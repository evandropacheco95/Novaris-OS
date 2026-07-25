import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Logger, LogContext } from "@novaris/logging";
import { ConsoleNotifier } from "../../src/infrastructure/console-notifier.js";

class FakeLogger implements Logger {
  readonly infos: Array<{ message: string; context?: LogContext }> = [];
  debug(): void {}
  info(message: string, context?: LogContext): void {
    this.infos.push({ message, context });
  }
  warn(): void {}
  error(): void {}
}

describe("ConsoleNotifier", () => {
  it("loga a notificação via Logger, incluindo o destinatário e a mensagem", () => {
    const logger = new FakeLogger();
    const notifier = new ConsoleNotifier(logger);

    notifier.notify("user-123", "Bem-vindo à NOVARIS");

    assert.equal(logger.infos.length, 1);
    assert.match(logger.infos[0]!.message, /user-123/);
    assert.match(logger.infos[0]!.message, /Bem-vindo à NOVARIS/);
  });

  it("propaga o context estruturado para o Logger", () => {
    const logger = new FakeLogger();
    const notifier = new ConsoleNotifier(logger);

    notifier.notify("user-123", "mensagem", { origem: "UserCreated" });

    assert.deepEqual(logger.infos[0]!.context, { origem: "UserCreated" });
  });
});
