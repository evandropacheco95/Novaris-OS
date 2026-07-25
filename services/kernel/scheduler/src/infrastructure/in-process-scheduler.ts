import { randomUUID } from "node:crypto";
import type { Logger } from "@novaris/logging";
import type { Scheduler, ScheduledTask } from "../domain/ports/scheduler.js";

type NodeTimer = ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>;

/**
 * Adapter real do Port `Scheduler` — `setTimeout`/`setInterval` do próprio
 * processo Node (`ADR-0039`). Sem persistência: agendamentos não sobrevivem
 * a um restart do processo — aceitável para o único caso de uso real hoje
 * (nenhum), documentado como limitação conhecida, mesmo padrão de honestidade
 * já usado para `InProcessEventBus` (`ADR-0037`).
 */
export class InProcessScheduler implements Scheduler {
  private readonly timers = new Map<string, NodeTimer>();

  constructor(private readonly logger: Logger) {}

  scheduleOnce(runAt: Date, task: () => void): ScheduledTask {
    const id = randomUUID();
    const delayMs = Math.max(0, runAt.getTime() - Date.now());
    const timer = setTimeout(() => {
      this.timers.delete(id);
      this.runSafely(id, task);
    }, delayMs);
    this.timers.set(id, timer);
    return { id };
  }

  scheduleRecurring(intervalMs: number, task: () => void): ScheduledTask {
    const id = randomUUID();
    const timer = setInterval(() => this.runSafely(id, task), intervalMs);
    this.timers.set(id, timer);
    return { id };
  }

  cancel(task: ScheduledTask): void {
    const timer = this.timers.get(task.id);
    if (!timer) {
      return;
    }
    clearTimeout(timer);
    clearInterval(timer);
    this.timers.delete(task.id);
  }

  private runSafely(id: string, task: () => void): void {
    try {
      task();
    } catch (error) {
      this.logger.error(`[scheduler] Tarefa "${id}" lançou exceção`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
