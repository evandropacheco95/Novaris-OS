/**
 * Port de Scheduler (`ENGINEERING_PLAYBOOK.md § 9`) — agendamento de
 * execuções futuras/recorrentes. Sem persistência: um `ScheduledTask`
 * cancelado ou perdido em um restart do processo não é retomado — mesma
 * limitação já aceita para `EventBus` in-process (`ADR-0037`), documentada
 * em `ADR-0039`, não escondida.
 */
export interface ScheduledTask {
  readonly id: string;
}

export interface Scheduler {
  /** Executa `task` uma única vez, no instante `runAt`. */
  scheduleOnce(runAt: Date, task: () => void): ScheduledTask;
  /** Executa `task` repetidamente, a cada `intervalMs`, a partir de agora. */
  scheduleRecurring(intervalMs: number, task: () => void): ScheduledTask;
  /** Cancela uma tarefa agendada (idempotente — cancelar 2x não falha). */
  cancel(task: ScheduledTask): void;
}
