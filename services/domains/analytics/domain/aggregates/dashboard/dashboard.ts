import { AggregateRoot, Result, ValidationError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import { Widget, type WidgetType } from "../../entities/widget/widget.js";

/**
 * Dashboard — Aggregate Root do Analytics Domain.
 *
 * Traceability:
 * - [ANALYTICS_AGGREGATE_DESIGN.md](../../../../../knowledge/architecture/analysis/ANALYTICS_AGGREGATE_DESIGN.md) — confirmado Aggregate Root; `Widget` confirmado como sua Internal Entity ("não usar isolado de um Dashboard")
 * - [ADR-0034](../../../../../adr/ADR-0034-analytics-dashboard-minimum-fields.md) — `name` como único campo mínimo; `Widget` bloqueado (sem campos de conteúdo, decisão explícita do CTO)
 * - [ADR-0049](../../../../../adr/ADR-0049-widget-visualization-types.md) — `Widget` desbloqueado, 4 tipos de visualização (`kpi`/`list`/`donut`/`bar`)
 *
 * Sem Domain Event — nenhum evento relacionado a `Dashboard`/`Widget` está
 * confirmado em nenhuma fonte. Sem campo de status/comportamento de mutação
 * do próprio Dashboard — mesmo critério de `Subscription`/`Campaign`.
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
  private readonly widgets: Widget[];

  private constructor(props: DashboardProps, widgets: Widget[], id?: UniqueEntityId) {
    super(props, id);
    this.widgets = widgets;
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
    return Result.ok(new Dashboard(props, []));
  }

  /** Usado exclusivamente por uma implementação de `DashboardRepository` (reconstituição). */
  static reconstitute(props: DashboardProps, id: UniqueEntityId, widgets: Widget[] = []): Dashboard {
    return new Dashboard(props, widgets, id);
  }

  /** Adiciona um Widget de configuração de exibição (`ADR-0049`) — o Domain nunca resolve `metricKey` contra dado real. */
  addWidget(input: { type: WidgetType; title: string; metricKey: string }): Result<Widget, DomainError> {
    const widgetResult = Widget.create(input);
    if (widgetResult.isFailure) {
      return Result.fail(widgetResult.getError()!);
    }
    const widget = widgetResult.getValue()!;
    this.widgets.push(widget);
    this.props.updatedAt = new Date();
    return Result.ok(widget);
  }

  /** Retorna uma cópia defensiva da coleção — mesmo padrão de `Campaign.getAssets()`. */
  getWidgets(): ReadonlyArray<Widget> {
    return [...this.widgets];
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
