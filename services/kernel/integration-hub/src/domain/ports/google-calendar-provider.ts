import type { IntegrationResult } from "./integration-result.js";

/** Port do provedor Google Calendar (`ADR-0040`) — criar um evento simples. */
export interface GoogleCalendarProvider {
  createEvent(title: string, startsAt: Date, endsAt: Date): Promise<IntegrationResult>;
}
