import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Activity } from "../aggregates/activity/activity.js";

/** Contrato de persistência do Aggregate `Activity` — port da Domain Layer. Mesmo padrão de `OpportunityRepository`. */
export interface ActivityRepository extends ReadRepository<Activity>, WriteRepository<Activity> {}
