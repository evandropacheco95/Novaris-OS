// AI Runtime Service — barrel de exportação pública (`ADR-0041`).

export type { AIRuntime, AIContext, AIResponse } from "./domain/ports/ai-runtime.js";
export { ConsoleAIRuntime } from "./infrastructure/console-ai-runtime.js";
