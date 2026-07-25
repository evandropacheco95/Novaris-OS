import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Campaign — Aggregate Root do Marketing Domain.
 *
 * Traceability:
 * - [MARKETING_AGGREGATE_DESIGN.md](../../../../../knowledge/architecture/analysis/MARKETING_AGGREGATE_DESIGN.md) — confirmado único Aggregate Root do domínio
 * - [ADR-0033](../../../../../adr/ADR-0033-marketing-campaign-minimum-fields.md) — `name` obrigatório, `startDate`/`endDate` opcionais
 *
 * Sem Domain Event — nenhum evento relacionado a `Campaign` está confirmado
 * em `BOM.md` ou `DOMAIN_MODEL.md § EVENT BUS` (`ADR-0033`). Sem campo de
 * status/comportamento de mutação — nenhuma fonte confirma estados ou
 * transições (mesmo critério de `Subscription`).
 *
 * `Asset` não é referenciado aqui — sua posse (Marketing vs. conceito
 * transversal) permanece bloqueada (`MARKETING_AGGREGATE_DESIGN.md § 3`,
 * `ADR-0033`).
 */
export interface CampaignProps {
  organizationId: UniqueEntityId;
  name: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCampaignInput {
  organizationId: UniqueEntityId;
  name: string;
  startDate?: Date;
  endDate?: Date;
}

export class Campaign extends AggregateRoot<CampaignProps> implements Timestamped {
  private constructor(props: CampaignProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateCampaignInput): Result<Campaign, DomainError> {
    if (input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório'));
    }

    const now = new Date();
    const props: CampaignProps = {
      organizationId: input.organizationId,
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Campaign(props));
  }

  /** Usado exclusivamente por uma implementação de `CampaignRepository` (reconstituição). */
  static reconstitute(props: CampaignProps, id: UniqueEntityId): Campaign {
    return new Campaign(props, id);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get startDate(): Date | undefined {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
