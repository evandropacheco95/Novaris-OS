import type { Logger } from "@novaris/logging";
import type { GoogleCalendarProvider } from "../domain/ports/google-calendar-provider.js";
import type { IntegrationResult } from "../domain/ports/integration-result.js";

/**
 * Adapter estrutural — não chama a Google Calendar API real (`ADR-0040`,
 * nenhuma credencial existe). Loga o evento que seria criado.
 */
export class ConsoleGoogleCalendarProvider implements GoogleCalendarProvider {
  constructor(private readonly logger: Logger) {}

  async createEvent(title: string, startsAt: Date, endsAt: Date): Promise<IntegrationResult> {
    this.logger.info(`[integration-hub:google-calendar] Evento "${title}" de ${startsAt.toISOString()} a ${endsAt.toISOString()}`, {
      loggedOnly: true,
    });
    return { success: true, loggedOnly: true };
  }
}
