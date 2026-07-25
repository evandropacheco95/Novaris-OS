import type { IntegrationResult } from "./integration-result.js";

/**
 * Port do provedor Bling (`ADR-0040`) — operação única representativa:
 * emitir uma cobrança/fatura simples. Payload deliberadamente mínimo
 * (`reference`/`amount`/`description`) — **não** uma NF-e completa (CFOP,
 * regime tributário, natureza da operação etc.), que exigiria uma decisão
 * fiscal/de negócio fora do escopo desta ADR.
 */
export interface BlingProvider {
  emitInvoice(reference: string, amount: number, description: string): Promise<IntegrationResult>;
}
