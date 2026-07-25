import { AggregateRoot, Result, ValidationError, ConflictError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import { LeadCreated } from "../../events/lead-created.js";
import { LeadConverted } from "../../events/lead-converted.js";

/**
 * Lead — Aggregate Root do Sales Domain (`ADR-0042`), adaptado do
 * Lead-to-Convert do Salesforce por autorização direta do CTO ("adapte tudo
 * do salesforce para o Novaris... autorização para editar o que não tiver").
 *
 * Captura mínima de um contato **antes** de virar `Party` (Customer Domain)
 * — não exige nome de organização confirmado, documento, nem qualquer campo
 * que só faça sentido depois de qualificação. `company` é texto livre (nome
 * declarado pelo próprio Lead), não uma referência a `Party` — só a
 * conversão cria um `Party` de verdade.
 *
 * **Por que vive em Sales, não em Customer** (`ADR-0042 § Decision`):
 * `DOMAIN_MODEL.md § DEPENDÊNCIAS` proíbe um domínio de depender de um
 * abaixo dele na cadeia "Identity → Workspace → Relationship → Sales → ...".
 * Como converter um Lead cria um `Party` (Relationship/Customer, que vem
 * antes de Sales) e opcionalmente uma `Opportunity` (o próprio Sales), só
 * Sales pode orquestrar essa conversão sem violar a regra já congelada.
 */
export type LeadStatus = "new" | "contacted" | "qualified" | "unqualified" | "converted";

/**
 * Validação em runtime contra a união (`ENG-0134`/`ENG-0137`, bug sistêmico
 * já corrigido em `Activity`/`Relationship`/`Task`/`Party`/`Organization`):
 * sem isso, um valor fora da união só seria barrado pelo CHECK constraint do
 * Postgres, devolvendo `InfrastructureError` (500) em vez de `ValidationError`
 * (400). `"converted"` fica de fora — só `convert()` alcança esse estado.
 */
const VALID_UPDATABLE_LEAD_STATUSES: readonly Exclude<LeadStatus, "converted">[] = [
  "new",
  "contacted",
  "qualified",
  "unqualified",
];

export interface LeadProps {
  organizationId: UniqueEntityId;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status: LeadStatus;
  convertedPartyId?: UniqueEntityId;
  convertedOpportunityId?: UniqueEntityId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadInput {
  organizationId: UniqueEntityId;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
}

export class Lead extends AggregateRoot<LeadProps> implements Timestamped {
  private constructor(props: LeadProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /** Único ponto de criação. `name` é o único campo obrigatório além de `organizationId` — mínimo para identificar o contato. */
  static create(input: CreateLeadInput): Result<Lead, DomainError> {
    if (input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" não pode ser vazio'));
    }
    const now = new Date();
    const lead = new Lead({
      organizationId: input.organizationId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      source: input.source,
      status: "new",
      createdAt: now,
      updatedAt: now,
    });
    lead.addDomainEvent(new LeadCreated(lead.id));
    return Result.ok(lead);
  }

  /** Usado exclusivamente por uma implementação de `LeadRepository` (mesmo padrão de `ENS-0001 § 8`). */
  static reconstitute(props: LeadProps, id: UniqueEntityId): Lead {
    return new Lead(props, id);
  }

  /**
   * Transições não-terminais (`new`/`contacted`/`qualified`/`unqualified`).
   * **Nunca alcança `"converted"` por este método** — só `convert()` marca
   * esse estado terminal, mesma disciplina de `User.activate()`/`invite()`
   * serem métodos próprios em vez de um setter genérico de status.
   */
  updateStatus(status: Exclude<LeadStatus, "converted">): Result<void, DomainError> {
    if (!VALID_UPDATABLE_LEAD_STATUSES.includes(status)) {
      return Result.fail(
        new ValidationError(`"status" inválido: "${status}" — valores aceitos: ${VALID_UPDATABLE_LEAD_STATUSES.join(", ")}`),
      );
    }
    if (this.props.status === "converted") {
      return Result.fail(new ConflictError('Lead já convertido — status não pode mais mudar'));
    }
    this.props.status = status;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  /**
   * Transição terminal — equivalente ao `ConvertLead` do Salesforce. Só
   * grava a referência ao `Party`/`Opportunity` já criados — **não os cria**
   * (responsabilidade do `ConvertLeadHandler`, Application Layer, único
   * lugar que pode orquestrar 2 Business Domains). Falha se já convertido —
   * sem reversão, mesmo critério de `Opportunity.markWon()`/`markLost()`.
   */
  convert(partyId: UniqueEntityId, opportunityId?: UniqueEntityId): Result<void, DomainError> {
    if (this.props.status === "converted") {
      return Result.fail(new ConflictError('Lead já convertido — não pode ser convertido novamente'));
    }
    this.props.status = "converted";
    this.props.convertedPartyId = partyId;
    this.props.convertedOpportunityId = opportunityId;
    this.props.updatedAt = new Date();
    this.addDomainEvent(new LeadConverted(this.id));
    return Result.ok(undefined);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get company(): string | undefined {
    return this.props.company;
  }

  get source(): string | undefined {
    return this.props.source;
  }

  get status(): LeadStatus {
    return this.props.status;
  }

  get convertedPartyId(): UniqueEntityId | undefined {
    return this.props.convertedPartyId;
  }

  get convertedOpportunityId(): UniqueEntityId | undefined {
    return this.props.convertedOpportunityId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
