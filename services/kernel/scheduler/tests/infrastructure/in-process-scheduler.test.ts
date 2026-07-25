import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Logger, LogContext } from "@novaris/logging";
import { InProcessScheduler } from "../../src/infrastructure/in-process-scheduler.js";

class FakeLogger implements Logger {
  readonly errors: Array<{ message: string; context?: LogContext }> = [];
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(message: string, context?: LogContext): void {
    this.errors.push({ message, context });
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("InProcessScheduler — scheduleOnce", () => {
  it("executa a tarefa depois do instante agendado", async () => {
    const scheduler = new InProcessScheduler(new FakeLogger());
    let ran = false;
    scheduler.scheduleOnce(new Date(Date.now() + 10), () => {
      ran = true;
    });

    assert.equal(ran, false);
    await wait(30);
    assert.equal(ran, true);
  });

  it("executa imediatamente quando runAt já passou", async () => {
    const scheduler = new InProcessScheduler(new FakeLogger());
    let ran = false;
    scheduler.scheduleOnce(new Date(Date.now() - 1000), () => {
      ran = true;
    });

    await wait(10);
    assert.equal(ran, true);
  });

  it("cancel() antes da execução impede a tarefa de rodar", async () => {
    const scheduler = new InProcessScheduler(new FakeLogger());
    let ran = false;
    const task = scheduler.scheduleOnce(new Date(Date.now() + 20), () => {
      ran = true;
    });
    scheduler.cancel(task);

    await wait(40);
    assert.equal(ran, false);
  });
});

describe("InProcessScheduler — scheduleRecurring", () => {
  it("executa a tarefa mais de uma vez", async () => {
    const scheduler = new InProcessScheduler(new FakeLogger());
    let count = 0;
    const task = scheduler.scheduleRecurring(10, () => {
      count += 1;
    });

    await wait(45);
    scheduler.cancel(task);

    assert.ok(count >= 2, `esperava ao menos 2 execuções, teve ${count}`);
  });

  it("cancel() interrompe execuções futuras", async () => {
    const scheduler = new InProcessScheduler(new FakeLogger());
    let count = 0;
    const task = scheduler.scheduleRecurring(10, () => {
      count += 1;
    });

    await wait(25);
    scheduler.cancel(task);
    const countAtCancel = count;
    await wait(40);

    assert.equal(count, countAtCancel, "nenhuma execução deveria acontecer depois do cancel()");
  });
});

describe("InProcessScheduler — cancel", () => {
  it("cancelar duas vezes não lança erro (idempotente)", () => {
    const scheduler = new InProcessScheduler(new FakeLogger());
    const task = scheduler.scheduleOnce(new Date(Date.now() + 1000), () => {});
    assert.doesNotThrow(() => {
      scheduler.cancel(task);
      scheduler.cancel(task);
    });
  });

  it("cancelar uma tarefa desconhecida não lança erro", () => {
    const scheduler = new InProcessScheduler(new FakeLogger());
    assert.doesNotThrow(() => scheduler.cancel({ id: "não-existe" }));
  });
});

describe("InProcessScheduler — isolamento de erro", () => {
  it("uma tarefa que lança exceção é logada e não derruba o processo", async () => {
    const logger = new FakeLogger();
    const scheduler = new InProcessScheduler(logger);
    scheduler.scheduleOnce(new Date(Date.now() + 5), () => {
      throw new Error("tarefa quebrada");
    });

    await wait(20);
    assert.equal(logger.errors.length, 1);
    assert.match(logger.errors[0]!.message, /lançou exceção/);
  });
});
