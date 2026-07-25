import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { CalendarEvent } from "../aggregates/calendar-event/calendar-event.js";

/** Contrato de persistência do Aggregate `CalendarEvent` (`ADR-0045`). */
export interface CalendarEventRepository extends ReadRepository<CalendarEvent>, WriteRepository<CalendarEvent> {}
