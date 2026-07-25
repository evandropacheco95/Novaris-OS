import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Activity as PrismaActivity } from "@novaris/database";
import { Activity, type ActivityProps, type ActivityType, type ActivityStatus } from "../../domain/aggregates/activity/activity.js";

/** PrismaActivityMapper — tradução pura Aggregate ↔ linha real do Postgres (via Prisma Client), sem I/O próprio. */
export class PrismaActivityMapper {
  static toPersistenceCreate(activity: Activity) {
    return {
      id: activity.id.toString(),
      organizationId: activity.organizationId.toString(),
      partyId: activity.partyId.toString(),
      type: activity.type,
      status: activity.status,
      notes: activity.notes ?? null,
    };
  }

  static toDomain(record: PrismaActivity): Activity {
    const props: ActivityProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      partyId: new UniqueEntityId(record.partyId),
      type: record.type as ActivityType,
      status: record.status as ActivityStatus,
      notes: record.notes ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Activity.reconstitute(props, new UniqueEntityId(record.id));
  }
}
