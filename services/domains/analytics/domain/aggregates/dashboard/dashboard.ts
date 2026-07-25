import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";

/**
 * Dashboard — Aggregate Root do Analytics Domain.
 *
 * Traceability:
 * - [ANALYTICS_AGGREGATE_DESIGN.md](../../../../../knowledge/architecture/analysis/ANALYTICS_AGGREGATE_DESIGN.md) — confirmado Aggregate Root; `Widget` confirmado como sua Internal Entity ("não usar isolado de um Dashboard")
 * - [ADR-0034](../../../../../adr/ADR-0034-analytics-dashboard-minimum-fields.md) — `name` como único campo mínimo; `Widget` bloqueado (sem campos de conteúdo, decisão explícita do CTO)
 *
 * Sem Domain Event — nenhum evento relacionado a `Dashboard`/`Widget` está
 * confirmado em nenhuma fonte (`ADR-0034`). Sem campo de status/comportamento
 * de mutação — mesmo critério de `Subscription`/`Campaign`.
 *
 * `Widget` **não é implementado nesta versão** — um `Dashboard` real pode
 * existir sem nenhum Widget funcional ainda (`ADR-0034`, escopo mínimo).
 */
export interface DashboardProps {
  organizationId: UniqueEntityId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDashboardInput {
  organizationId: UniqueEntityId;
  name: string;
}

export class Dashboard extends AggregateRoot<DashboardProps> implements Timestamped {
  private constructor(props: DashboardProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateDashboardInput): Result<Dashboard, DomainError> {
    if (input.name.trim().length === 0) {
      return Result.fail(new ValidationError('"name" é obrigatório'));
    }

    const now = new Date();
    const props: DashboardProps = {
      organizationId: input.organizationId,
      name: input.name,
      createdAt: now,
      updatedAt: now,
    };
    return Result.ok(new Dashboard(props));
  }

  /** Usado exclusivamente por uma implementação de `DashboardRepository` (reconstituição). */
  static reconstitute(props: DashboardProps, id: UniqueEntityId): Dashboard {
    return new Dashboard(props, id);
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
