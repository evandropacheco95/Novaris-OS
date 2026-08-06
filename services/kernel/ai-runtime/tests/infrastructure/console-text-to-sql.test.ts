import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Logger, LogContext } from "@novaris/logging";
import { ConsoleTextToSqlRuntime } from "../../src/infrastructure/console-text-to-sql.js";

class FakeLogger implements Logger {
  readonly infos: Array<{ message: string; context?: LogContext }> = [];
  debug(): void {}
  info(message: string, context?: LogContext): void {
    this.infos.push({ message, context });
  }
  warn(): void {}
  error(): void {}
}

describe("ConsoleTextToSqlRuntime", () => {
  it("loga a pergunta e devolve uma resposta estrutural com sql: null e loggedOnly: true", async () => {
    const logger = new FakeLogger();
    const runtime = new ConsoleTextToSqlRuntime(logger);

    const result = await runtime.ask("Quanto fechei este mês?", { organizationId: "org-1" });

    assert.equal(result.sql, null);
    assert.equal(result.loggedOnly, true);
    assert.equal(logger.infos.length, 1);
    assert.match(logger.infos[0]!.message, /Quanto fechei este mês\?/);
  });

  it("propaga o context recebido para o log", async () => {
    const logger = new FakeLogger();
    const runtime = new ConsoleTextToSqlRuntime(logger);

    await runtime.ask("pergunta", { organizationId: "org-2" });

    assert.deepEqual(logger.infos[0]!.context?.context, { organizationId: "org-2" });
  });
});
