import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Subscription } from "../aggregates/subscription/subscription.js";

/** Contrato de persistência do Aggregate `Subscription` — port da Domain Layer. */
export interface SubscriptionRepository extends ReadRepository<Subscription>, WriteRepository<Subscription> {}
