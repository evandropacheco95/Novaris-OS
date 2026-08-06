import type { Logger } from "@novaris/logging";
import type { TextToSqlPort, TextToSqlContext, TextToSqlResult } from "../domain/ports/text-to-sql.js";

/**
 * Adapter estrutural — não chama nenhum LLM real (`ADR-0054`, mesma
 * limitação de `ConsoleAIRuntime`/`ADR-0041`: nenhuma credencial existe).
 * Nunca gera SQL (`sql: null`) — não há SQL gerado por IA para validar
 * contra `validateReadOnlySql()` até que um adapter real exista. Loga a
 * pergunta recebida.
 */
export class ConsoleTextToSqlRuntime implements TextToSqlPort {
  constructor(private readonly logger: Logger) {}

  async ask(question: string, context: TextToSqlContext): Promise<TextToSqlResult> {
    this.logger.info(`[ai-runtime] Pergunta text-to-SQL recebida: ${question}`, { loggedOnly: true, context });
    return {
      answer: "Text-to-SQL ainda não configurado — nenhuma credencial real de IA existe (ADR-0054). Este é um retorno estrutural.",
      sql: null,
      loggedOnly: true,
    };
  }
}
