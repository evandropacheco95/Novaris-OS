# sales / tests / domain / aggregates / pipeline

## Purpose

Testes unitários do Aggregate Root `Pipeline` (e da Entity interna `Stage` que ele possui) — espelha [domain/aggregates/](../../../../domain/aggregates/README.md) (`pipeline/pipeline.ts`) e [domain/entities/](../../../../domain/entities/README.md) (`stage/stage.ts`).

## Conteúdo (Missão ENG-0054)

- [pipeline.test.ts](pipeline.test.ts) — 21 testes: `create()` (coleção de Stages vazia, nenhum Domain Event, nunca lança exceção), `reconstitute()` (sem validação, sem eventos, restauração de `stages`), `addStage()` (adiciona, múltiplas Stages, rejeita id duplicado via `ConflictError`, nenhum evento), `findStage()` (existente/inexistente), `getStages()` (coleção vazia, cópia defensiva, nova referência a cada chamada), e uma suíte estrutural verificando que `Pipeline` permanece `AggregateRoot`, `Stage` permanece `Entity` (nunca `AggregateRoot`), e que nenhum dos dois expõe setter público (checagem de `Object.getOwnPropertyDescriptor` sobre os getters do protótipo).

Segue exatamente o mesmo padrão de `opportunity.test.ts` (`ENG-0053`) e dos precedentes de Kernel (`organization.test.ts`, `user.test.ts`) — `describe`/`it` por método, `getValue()!`/`getError()`, checagem de `domainEvents` diretamente sobre a instância.

Nenhum método, regra, evento, campo, Aggregate, Entity ou Value Object novo foi criado. `opportunity.ts`, `proposal.ts`, `stage.ts`, Repositories, Mappers, Infrastructure e Contracts permanecem inalterados.

## Status

🟢 21 testes implementados (Missão ENG-0054). Comportamento atual do Aggregate `Pipeline` e da Entity `Stage` congelado por teste.
