import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Party — Aggregate Root do Customer Domain.
 *
 * Traceability:
 * - [RELATIONSHIP_AGGREGATE_DESIGN.md](../../../../../knowledge/architecture/analysis/RELATIONSHIP_AGGREGATE_DESIGN.md) §§ 2, 4 — `Party` confirmado Aggregate Root único (evidência decisiva: `Opportunity.partyId` já usa uma única referência genérica, nunca dois campos separados)
 * - [ADR-0025](../../../../../adr/ADR-0025-party-minimum-fields.md) — `name`/`document` como campos mínimos de conteúdo, extensão de `BOM.md`
 * - [CUSTOMER_TECHNICAL_BLUEPRINT.md](../../../../../knowledge/architecture/blueprints/CUSTOMER_TECHNICAL_BLUEPRINT.md) § 2
 *
 * `Person`/`External Organization` são especializações internas, distinguidas
 * por `partyType` (união literal) — nunca subclasses, mesmo princípio já
 * usado em `Opportunity`/`OpportunityStatus` (`ENG-0039`).
 *
 * Sem Domain Event — `PartyCreated` não está confirmado em `DOMAIN_MODEL.md § EVENT BUS`
 * (`RELATIONSHIP_AGGREGATE_DESIGN.md § 7`); nenhum evento é inventado para
 * preencher essa lacuna.
 *
 * Estado deliberadamente mínimo — `Contact`/`Address`/`Phone`/`Email`/`Social
 * Profile` permanecem bloqueados (sem entrada em `BOM.md`, não estendidos por
 * `ADR-0025`), não incluídos como campo.
 *
 * `create()` valida `partyType` contra `VALID_PARTY_TYPES` (achado em
 * consolidação, mesma classe de bug já corrigida em `Activity`/`Relationship`/
 * `Task`, `ENG-0133`/`0134`) — sem essa validação, um valor fora da união só
 * era rejeitado pelo CHECK constraint do Postgres, retornando
 * `InfrastructureError` (500) em vez de `ValidationError` (400).
 */
export type PartyType = "person" | "external_organization";

const VALID_PARTY_TYPES: readonly PartyType[] = ["person", "external_organization"];

export interface PartyProps {
  organizationId: UniqueEntityId;
  partyType: PartyType;
  name: string;
  document?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePartyInput {
  organizationId: UniqueEntityId;
  partyType: PartyType;
  name: string;
  document?: string;
}

export class Party extends AggregateRoot<PartyProps> implements Timestamped {
  private constructor(props: PartyProps, id?: UniqueEntityId) {
    super(props, id);
  }

  /** Único ponto de criação. `name` obrigatório (`ADR-0025`) — sem ele, um Party não é identificável em nenhuma tela. */
  static create(input: CreatePartyInput): Result<Party, DomainError> {
    if (!VALID_PARTY_TYPES.includes(input.partyType)) {
      return Result.fail(new ValidationError(`"partyType" inválido: "${input.partyType}" — valores aceitos: ${VALID_PARTY_TYPES.join(", ")}`));
    }
    if (input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório'));
    }

    const now = new Date();
    const props: PartyProps = {
      organizationId: input.organizationId,
      partyType: input.partyType,
      name: input.name,
      document: input.document,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Party(props));
  }

  /** Usado exclusivamente por uma implementação de `PartyRepository` (ENS-0001 § 8). */
  static reconstitute(props: PartyProps, id: UniqueEntityId): Party {
    return new Party(props, id);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get partyType(): PartyType {
    return this.props.partyType;
  }

  get name(): string {
    return this.props.name;
  }

  get document(): string | undefined {
    return this.props.document;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
