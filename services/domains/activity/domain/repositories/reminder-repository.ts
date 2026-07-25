import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Reminder } from "../aggregates/reminder/reminder.js";

/** Contrato de persistência do Aggregate `Reminder` (`ADR-0045`). */
export interface ReminderRepository extends ReadRepository<Reminder>, WriteRepository<Reminder> {}
