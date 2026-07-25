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
 * Estado interno desta primeira implementação — subconjunto de
 * `ORGANIZATION_TECHNICAL_BLUEPRINT.md § 3`. `branding`, `plan`,
 * `billingStatus`, `trialEnd`, `maxUsers`, `maxStorage`, `storageUsed`,
 * `featureFlags`, `settings` foram deliberadamente excluídos — nenhum tem
 * valor ou forma de criação definida por nenhuma fonte (mesma categoria de
 * lacuna já registrada para o valor inicial de `status`,
 * ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16); incluí-los exigiria inventar
 * um default ou uma forma não congelada. Uma futura missão pode estendê-los
 * quando essas decisões existirem.
 */
export interface OrganizationProps {
  slug: string;
  name: string;
  legalName: string;
  document: string;
  address: OrganizationAddress;
  status: OrganizationStatus;
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
  metadata?: OrganizationMetadata;
}

export interface UpdateOrganizationProfileInput {
  name?: string;
  legalName?: string;
  document?: string;
  address?: OrganizationAddress;
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
