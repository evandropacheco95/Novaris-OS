import type { Logger } from "@novaris/logging";
import type { BlingProvider } from "../domain/ports/bling-provider.js";
import type { IntegrationResult } from "../domain/ports/integration-result.js";

/**
 * Adapter estrutural — não chama a API real do Bling (`ADR-0040`, nenhuma
 * credencial existe). Loga o que seria emitido — payload mínimo, não uma
 * NF-e completa.
 */
export class ConsoleBlingProvider implements BlingProvider {
  constructor(private readonly logger: Logger) {}

  async emitInvoice(reference: string, amount: number, description: string): Promise<IntegrationResult> {
    this.logger.info(`[integration-hub:bling] Cobrança ${reference}: R$ ${amount.toFixed(2)} — ${description}`, { loggedOnly: true });
    return { success: true, loggedOnly: true };
  }
}
