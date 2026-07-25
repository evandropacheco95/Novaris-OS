import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Dashboard as PrismaDashboard, Widget as PrismaWidget } from "@novaris/database";
import { Dashboard, type DashboardProps } from "../../domain/aggregates/dashboard/dashboard.js";
import { Widget, type WidgetProps, type WidgetType } from "../../domain/entities/widget/widget.js";

type PrismaDashboardWithWidgets = PrismaDashboard & { widgets: PrismaWidget[] };

/**
 * PrismaDashboardMapper — tradução pura Aggregate ↔ linha real do Postgres
 * (via Prisma Client), sem I/O próprio. Reconstitui a coleção `widgets`
 * (tabela própria, `widgets`) — mesmo tratamento de `PrismaCampaignMapper`
 * para `assets` (`ADR-0049`).
 */
export class PrismaDashboardMapper {
  static toPersistenceCreate(dashboard: Dashboard) {
    return {
      id: dashboard.id.toString(),
      organizationId: dashboard.organizationId.toString(),
      name: dashboard.name,
    };
  }

  static toDomain(record: PrismaDashboardWithWidgets): Dashboard {
    const widgets = record.widgets.map((widgetRecord) => {
      const props: WidgetProps = {
        type: widgetRecord.type as WidgetType,
        title: widgetRecord.title,
        metricKey: widgetRecord.metricKey,
      };
      return Widget.reconstitute(props, new UniqueEntityId(widgetRecord.id));
    });

    const props: DashboardProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      name: record.name,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Dashboard.reconstitute(props, new UniqueEntityId(record.id), widgets);
  }
}
