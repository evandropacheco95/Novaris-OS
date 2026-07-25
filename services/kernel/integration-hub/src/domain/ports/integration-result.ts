/**
 * Resultado comum a todo provedor de `integration-hub` (`ADR-0040`).
 * `loggedOnly: true` é deliberado e sempre presente nos adapters Console
 * desta missão — nenhuma credencial real existe para nenhum dos 7
 * provedores, então nenhuma chamada aqui atinge a API externa de verdade.
 * Propagado até a resposta HTTP para nunca ser confundido com envio real.
 */
export interface IntegrationResult {
  readonly success: boolean;
  readonly loggedOnly: boolean;
  readonly externalRef?: string;
}
