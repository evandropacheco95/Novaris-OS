import type { Logger } from "@novaris/logging";
import type { AIRuntime, AIContext, AIResponse } from "../domain/ports/ai-runtime.js";

/**
 * Adapter estrutural — não chama nenhuma API de IA real (OpenAI, Anthropic)
 * (`ADR-0041`, nenhuma credencial existe: `OPENAI_API_KEY`/`ANTHROPIC_API_KEY`
 * seguem vazias em `.env.example`). Loga o prompt recebido, devolve uma
 * resposta fixa com `loggedOnly: true`. Substituível por um adapter real sem
 * mudar o Port.
 */
export class ConsoleAIRuntime implements AIRuntime {
  constructor(private readonly logger: Logger) {}

  async ask(prompt: string, context?: AIContext): Promise<AIResponse> {
    this.logger.info(`[ai-runtime] Prompt recebido: ${prompt}`, { loggedOnly: true, context });
    return {
      answer: "IA ainda não configurada — nenhuma credencial real existe (ADR-0041). Este é um retorno estrutural.",
      loggedOnly: true,
    };
  }
}
