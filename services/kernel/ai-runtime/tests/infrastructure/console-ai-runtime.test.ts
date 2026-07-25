import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Logger, LogContext } from "@novaris/logging";
import { ConsoleAIRuntime } from "../../src/infrastructure/console-ai-runtime.js";

class FakeLogger implements Logger {
  readonly infos: Array<{ message: string; context?: LogContext }> = [];
  debug(): void {}
  info(message: string, context?: LogContext): void {
    this.infos.push({ message, context });
  }
  warn(): void {}
  error(): void {}
}

describe("ConsoleAIRuntime", () => {
  it("loga o prompt e devolve uma resposta estrutural com loggedOnly: true", async () => {
    const logger = new FakeLogger();
    const runtime = new ConsoleAIRuntime(logger);

    const response = await runtime.ask("Resuma esta Opportunity");

    assert.equal(response.loggedOnly, true);
    assert.equal(logger.infos.length, 1);
    assert.match(logger.infos[0]!.message, /Resuma esta Opportunity/);
  });

  it("propaga o context recebido para o log", async () => {
    const logger = new FakeLogger();
    const runtime = new ConsoleAIRuntime(logger);

    await runtime.ask("prompt", { opportunityId: "opp-1" });

    assert.deepEqual(logger.infos[0]!.context?.context, { opportunityId: "opp-1" });
  });
});
