import type { Logger } from "@novaris/logging";
import type { GoogleSheetsProvider } from "../domain/ports/google-sheets-provider.js";
import type { IntegrationResult } from "../domain/ports/integration-result.js";

/**
 * Adapter estrutural — não chama a Google Sheets API real (`ADR-0040`,
 * nenhuma credencial existe). Loga a linha que seria adicionada.
 */
export class ConsoleGoogleSheetsProvider implements GoogleSheetsProvider {
  constructor(private readonly logger: Logger) {}

  async appendRow(spreadsheetId: string, values: string[]): Promise<IntegrationResult> {
    this.logger.info(`[integration-hub:google-sheets] Linha adicionada à planilha ${spreadsheetId}: ${values.join(", ")}`, {
      loggedOnly: true,
    });
    return { success: true, loggedOnly: true };
  }
}
