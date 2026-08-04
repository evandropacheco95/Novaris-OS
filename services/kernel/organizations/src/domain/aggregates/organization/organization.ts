import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped, HasMetadata } from "@novaris/shared-kernel";
import { OrganizationCreated } from "../../domain-events/organization-created.js";

/**
 * Status = 5 valores definitivos (ADR-ORG-001). `§ LIFECYCLE` de
 * objects/Organization.md é narrativa, não um enum à parte — `Deleted` é
 * representado por `deletedAt`, nunca por `status`.
 *
 * `create()` valida `status` contra `VALID_ORGANIZATION_STATUSES` (achado em
 * consolidação, mesma classe de bug já corrigida em `Activity`/`Relationship`/
 * `Task`/`Party`) — hoje não há nenhuma rota HTTP que chame `create()` com
 * `status` vindo de input externo (`POST /organizations` não existe, só
 * `apps/api/src/seed.ts` chama isto, com literal fixo), mas o Aggregate não
 * deveria depender de nenhuma rota para proteger sua própria invariante.
 */
export type OrganizationStatus = "active" | "suspended" | "trial" | "blocked" | "archived";

const VALID_ORGANIZATION_STATUSES: readonly OrganizationStatus[] = ["active", "suspended", "trial", "blocked", "archived"];

/**
 * 3 tiers (`ENG-0164`, decisão direta do CTO — Starter/Professional/Enterprise,
 * mesmo padrão de nomenclatura das Edições do Salesforce). Diferente de
 * `maxUsers`/`enabledDomains` (limites reais, configuráveis por Organization,
 * sem número/mapeamento inventado — decisão explícita do CTO de não fixar
 * "Starter = N usuários" sem fonte), `plan` é só o rótulo comercial do tier;
 * o que cada tier concretamente limita é decidido caso a caso via
 * `maxUsers`/`enabledDomains` de cada Organization, não derivado do nome do
 * plano.
 */
export type OrganizationPlan = "starter" | "professional" | "enterprise";

const VALID_ORGANIZATION_PLANS: readonly OrganizationPlan[] = ["starter", "professional", "enterprise"];

/**
 * Controle manual, sem gateway de pagamento real (`ENG-0164` — mesmo padrão
 * estrutural de `integration-hub`/`ai-runtime`, `ADR-0040`/`ADR-0041`:
 * nenhuma credencial de terceiro existe, então nenhuma cobrança automática
 * acontece; `billingStatus` só reflete o que um humano define via API).
 */
export type OrganizationBillingStatus = "trialing" | "active" | "overdue" | "canceled";

const VALID_BILLING_STATUSES: readonly OrganizationBillingStatus[] = ["trialing", "active", "overdue", "canceled"];

/** Mesma justificativa de `UserMetadata` (Identity, ENG-0002.7) — forma não definida por nenhuma fonte. */
export type OrganizationMetadata = Record<string, unknown>;

/**
 * Agrupamento de campos já citados em objects/Organization.md § ATRIBUTOS —
 * não um Value Object real (ORGANIZATION_TECHNICAL_BLUEPRINT.md § 4 definiu
 * `Address` como candidato a Value Object, mas sua validação nunca foi
 * congelada; esta missão não implementa Value Objects não congelados).
 */
export interface OrganizationAddress {
  street: string;
  number: string;
  district: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Estado interno — subconjunto de `ORGANIZATION_TECHNICAL_BLUEPRINT.md § 3`.
 * `plan`/`billingStatus`/`trialEnd`/`maxUsers`/`enabledDomains` adicionados
 * em `ENG-0164` (decisão direta do CTO, ver `architecture/multi-tenancy.md`
 * § "Tópicos a Documentar"). `branding`, `maxStorage`, `storageUsed`,
 * `settings` **continuam deliberadamente excluídos** — nenhum tem valor ou
 * forma de criação definida por nenhuma fonte ainda (mesma categoria de
 * lacuna já registrada para o valor inicial de `status`,
 * ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16). `maxUsers`/`enabledDomains`
 * são `undefined` por padrão (= sem limite / todos os domínios habilitados,
 * preserva o comportamento de toda Organization já existente antes desta
 * missão) — nenhum valor numérico ou mapeamento plano→limite foi inventado;
 * cada Organization tem seu próprio limite configurado individualmente.
 */
export interface OrganizationProps {
  slug: string;
  name: string;
  legalName: string;
  document: string;
  address: OrganizationAddress;
  status: OrganizationStatus;
  plan: OrganizationPlan;
  billingStatus: OrganizationBillingStatus;
  trialEnd?: Date;
  maxUsers?: number;
  enabledDomains?: string[];
  metadata: OrganizationMetadata;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateOrganizationInput {
  slug: string;
  name: string;
  legalName: string;
  document: string;
  address: OrganizationAddress;
  status: OrganizationStatus;
  plan: OrganizationPlan;
  billingStatus: OrganizationBillingStatus;
  trialEnd?: Date;
  maxUsers?: number;
  enabledDomains?: string[];
  metadata?: OrganizationMetadata;
}

export interface UpdateOrganizationProfileInput {
  name?: string;
  legalName?: string;
  document?: string;
  address?: OrganizationAddress;
}

/**
 * Todos os campos opcionais — `PATCH` parcial, mesmo padrão de
 * `UpdateOrganizationProfileInput`. `maxUsers: null`/`enabledDomains: null`
 * removem o limite explicitamente (undefined = "não mudar este campo",
 * null = "define como sem limite/todos habilitados" — distinção necessária
 * porque ambos são opcionais e `undefined` já significa "não enviado").
 */
export interface UpdateOrganizationPlanInput {
  plan?: OrganizationPlan;
  billingStatus?: OrganizationBillingStatus;
  trialEnd?: Date | null;
  maxUsers?: number | null;
  enabledDomains?: string[] | null;
}

/**
 * Aggregate Root do Organization Domain — congelado em
 * [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](../../../../ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md),
 * assinatura técnica em
 * [ORGANIZATION_TECHNICAL_BLUEPRINT.md](../../../../ORGANIZATION_TECHNICAL_BLUEPRINT.md).
 * Segue [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md)
 * (ENS-0001).
 *
 * **Sem `implements Auditable`/`Versionable`**, diferente de `User`/`Role` —
 * nenhuma fonte oficial cita `createdBy`/`updatedBy`/`version` para
 * `Organization` (achado documentado em `ORGANIZATION_TECHNICAL_BLUEPRINT.md § 3`).
 *
 * **`status` inicial nunca é decidido pelo Aggregate** — `create()` exige
 * `status` como input obrigatório em vez de aplicar um valor padrão, porque
 * nenhuma fonte confirma qual deveria ser (Freeze § 16). O Aggregate garante
 * apenas que o valor recebido seja um dos 5 já congelados (`OrganizationStatus`,
 * garantido pelo próprio sistema de tipos, sem checagem redundante em runtime).
 *
 * **`updateProfile()` não dispara nenhum Domain Event** — só `OrganizationCreated`
 * é definitivo (Freeze § 9); `OrganizationUpdated` permanece candidato, não
 * aprovado, não implementado (ENS-0003 § 15 — nenhum Domain Service ou Aggregate
 * emite evento não aprovado).
 */
export class Organization
  extends AggregateRoot<OrganizationProps>
  implements Timestamped, HasMetadata<OrganizationMetadata>
{
  private constructor(props: OrganizationProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateOrganizationInput): Result<Organization, DomainError> {
    if (!VALID_ORGANIZATION_STATUSES.includes(input.status)) {
      return Result.fail(new ValidationError(`"status" inválido: "${input.status}" — valores aceitos: ${VALID_ORGANIZATION_STATUSES.join(", ")}`));
    }
    if (!VALID_ORGANIZATION_PLANS.includes(input.plan)) {
      return Result.fail(new ValidationError(`"plan" inválido: "${input.plan}" — valores aceitos: ${VALID_ORGANIZATION_PLANS.join(", ")}`));
    }
    if (!VALID_BILLING_STATUSES.includes(input.billingStatus)) {
      return Result.fail(new ValidationError(`"billingStatus" inválido: "${input.billingStatus}" — valores aceitos: ${VALID_BILLING_STATUSES.join(", ")}`));
    }
    if (input.maxUsers !== undefined && input.maxUsers < 1) {
      return Result.fail(new ValidationError('"maxUsers" deve ser maior que zero quando definido'));
    }
    if (input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório'));
    }
    if (input.slug.trim().length === 0) {
      return Result.fail(new ValidationError('"slug" é obrigatório'));
    }

    const now = new Date();
    const props: OrganizationProps = {
      slug: input.slug,
      name: input.name,
      legalName: input.legalName,
      document: input.document,
      address: input.address,
      status: input.status,
      plan: input.plan,
      billingStatus: input.billingStatus,
      trialEnd: input.trialEnd,
      maxUsers: input.maxUsers,
      enabledDomains: input.enabledDomains,
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };
    const organization = new Organization(props);
    organization.addDomainEvent(new OrganizationCreated(organization.id));
    return Result.ok(organization);
  }

  /** Usado exclusivamente por uma futura implementação de `OrganizationRepository` (ENS-0001 § 8). */
  static reconstitute(props: OrganizationProps, id: UniqueEntityId): Organization {
    return new Organization(props, id);
  }

  /**
   * Atualiza dados cadastrais (`name`, `legalName`, `document`, `address`).
   * Não muta `status`, `slug` nem `metadata` — nenhuma fonte prevê isso como
   * parte deste comportamento (ORGANIZATION_TECHNICAL_BLUEPRINT.md § 8).
   */
  updateProfile(input: UpdateOrganizationProfileInput): Result<void, DomainError> {
    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        return Result.fail(new ValidationError('"name" não pode ser vazio'));
      }
      this.props.name = input.name;
    }
    if (input.legalName !== undefined) {
      this.props.legalName = input.legalName;
    }
    if (input.document !== undefined) {
      this.props.document = input.document;
    }
    if (input.address !== undefined) {
      this.props.address = input.address;
    }

    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  /**
   * Atualiza plano/billing/limites (`ENG-0164`). Sem Domain Event dedicado
   * pelo mesmo motivo de `updateProfile()` — `OrganizationUpdated` continua
   * candidato, não aprovado (`ENS-0003 § 15`).
   */
  updatePlan(input: UpdateOrganizationPlanInput): Result<void, DomainError> {
    if (input.plan !== undefined) {
      if (!VALID_ORGANIZATION_PLANS.includes(input.plan)) {
        return Result.fail(new ValidationError(`"plan" inválido: "${input.plan}" — valores aceitos: ${VALID_ORGANIZATION_PLANS.join(", ")}`));
      }
      this.props.plan = input.plan;
    }
    if (input.billingStatus !== undefined) {
      if (!VALID_BILLING_STATUSES.includes(input.billingStatus)) {
        return Result.fail(new ValidationError(`"billingStatus" inválido: "${input.billingStatus}" — valores aceitos: ${VALID_BILLING_STATUSES.join(", ")}`));
      }
      this.props.billingStatus = input.billingStatus;
    }
    if (input.trialEnd !== undefined) {
      this.props.trialEnd = input.trialEnd ?? undefined;
    }
    if (input.maxUsers !== undefined) {
      if (input.maxUsers !== null && input.maxUsers < 1) {
        return Result.fail(new ValidationError('"maxUsers" deve ser maior que zero quando definido'));
      }
      this.props.maxUsers = input.maxUsers ?? undefined;
    }
    if (input.enabledDomains !== undefined) {
      this.props.enabledDomains = input.enabledDomains ?? undefined;
    }

    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  get slug(): string {
    return this.props.slug;
  }

  get name(): string {
    return this.props.name;
  }

  get legalName(): string {
    return this.props.legalName;
  }

  get document(): string {
    return this.props.document;
  }

  get address(): OrganizationAddress {
    return this.props.address;
  }

  get status(): OrganizationStatus {
    return this.props.status;
  }

  get plan(): OrganizationPlan {
    return this.props.plan;
  }

  get billingStatus(): OrganizationBillingStatus {
    return this.props.billingStatus;
  }

  get trialEnd(): Date | undefined {
    return this.props.trialEnd;
  }

  get maxUsers(): number | undefined {
    return this.props.maxUsers;
  }

  get enabledDomains(): string[] | undefined {
    return this.props.enabledDomains;
  }

  get metadata(): OrganizationMetadata {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }
}
