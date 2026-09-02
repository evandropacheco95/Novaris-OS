/**
 * Resultado comum a todo provedor de `integration-hub` (`ADR-0040`).
 * `loggedOnly: true` é deliberado e sempre presente nos adapters Console
 * desta missão — nenhuma credencial real existe para nenhum dos 7
 * provedores, então nenhuma chamada aqui atinge a API externa de verdade.
 * Propagado até a resposta HTTP para nunca ser confundido com envio real.
 *
 * `T` (opcional, `ADR-0060`) carrega o payload de leitura de métodos que
 * retornam dado, ex.: `GoogleAdsProvider.getCampaignPerformance()` — os 6
 * outros provedores, todos write-only (`createCampaign` etc.), continuam
 * usando `IntegrationResult` sem parâmetro, sem quebra.
 */
export interface IntegrationResult<T = void> {
  readonly success: boolean;
  readonly loggedOnly: boolean;
  readonly externalRef?: string;
  readonly data?: T;
}
