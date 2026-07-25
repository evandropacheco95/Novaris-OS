import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Subscription as PrismaSubscription } from "@novaris/database";
import { Subscription, type SubscriptionProps } from "../../domain/aggregates/subscription/subscription.js";

/** PrismaSubscriptionMapper — tradução pura Aggregate ↔ linha real do Postgres. */
export class PrismaSubscriptionMapper {
  static toPersistenceCreate(subscription: Subscription) {
    return {
      id: subscription.id.toString(),
      organizationId: subscription.organizationId.toString(),
      name: subscription.name,
    };
  }

  static toDomain(record: PrismaSubscription): Subscription {
    const props: SubscriptionProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      name: record.name,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Subscription.reconstitute(props, new UniqueEntityId(record.id));
  }
}
