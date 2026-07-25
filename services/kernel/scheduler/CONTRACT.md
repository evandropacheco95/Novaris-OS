# Contrato de Serviço — scheduler

## Objetivo

Agendamento de execuções futuras/recorrentes. Implementado real em `ENG-0140`/`ADR-0039`.

## Interface Pública

```typescript
interface Scheduler {
  scheduleOnce(runAt: Date, task: () => void): ScheduledTask;
  scheduleRecurring(intervalMs: number, task: () => void): ScheduledTask;
  cancel(task: ScheduledTask): void;
}
```

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `scheduleOnce` | `runAt: Date`, `task: () => void` | `ScheduledTask` | Se `runAt` já passou, executa na próxima iteração do event loop |
| `scheduleRecurring` | `intervalMs: number`, `task: () => void` | `ScheduledTask` | Primeira execução após `intervalMs`, não imediata |
| `cancel` | `task: ScheduledTask` | `void` | Idempotente; `task` desconhecida não lança erro |

## Erros

Uma exceção lançada por `task` é capturada e logada via `@novaris/logging` (dependência declarada deste módulo) — não derruba o processo, não interrompe outras tarefas agendadas.

## Eventos Emitidos

Nenhum.

## Dependências

`Logging` (`services/kernel/README.md`).

## Object Specification

Não aplicável — infraestrutura transversal, não expõe um Business Object do BOM.

## Status

🟢 Real (`ENG-0140`, `ADR-0039`). `Scheduler` (Port) + `InProcessScheduler` (Infrastructure, `setTimeout`/`setInterval`) implementados e testados. **Sem persistência** — agendamentos não sobrevivem a um restart do processo (aceito por `ADR-0039`, mesma limitação já assumida por `InProcessEventBus`). **Sem consumidor real ainda** — nenhum Handler existente precisa hoje de execução futura/recorrente; capacidade pronta para uso futuro (ex.: cobrança recorrente de `Subscription`, quando essa regra de negócio existir).
