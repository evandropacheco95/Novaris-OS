import type { IntegrationResult } from "./integration-result.js";

/** Port do provedor Google Sheets (`ADR-0040`) — adicionar uma linha a uma planilha. */
export interface GoogleSheetsProvider {
  appendRow(spreadsheetId: string, values: string[]): Promise<IntegrationResult>;
}
