import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Dashboard as PrismaDashboard } from "@novaris/database";
import { Dashboard, type DashboardProps } from "../../domain/aggregates/dashboard/dashboard.js";

/** PrismaDashboardMapper — tradução pura Aggregate ↔ linha real do Postgres (via Prisma Client), sem I/O próprio. */
export class PrismaDashboardMapper {
  static toPersistenceCreate(dashboard: Dashboard) {
    return {
      id: dashboard.id.toString(),
      organizationId: dashboard.organizationId.toString(),
      name: dashboard.name,
    };
  }

  static toDomain(record: PrismaDashboard): Dashboard {
    const props: DashboardProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      name: record.name,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Dashboard.reconstitute(props, new UniqueEntityId(record.id));
  }
}
