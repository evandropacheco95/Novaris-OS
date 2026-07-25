# sales / tests / domain / entities / proposal

## Purpose

Testes unitários da Internal Entity `Proposal` — espelha [domain/entities/](../../../../domain/entities/README.md) (`proposal/proposal.ts`).

## Conteúdo (Missão ENG-0055)

- [proposal.test.ts](proposal.test.ts) — 16 testes: `create()` (estado inicial `"pending"`, `createdAt`/`updatedAt` iguais na criação, aceita chamada sem argumento, nunca lança exceção), `reconstitute()` (sem validação, preserva `status`/id fornecidos, ausência de `domainEvents`), `approve()` (transição `pending → approved`, atualiza `updatedAt`, rejeita segunda aprovação com `ConflictError`, nunca lança exceção), e uma suíte estrutural verificando que `Proposal` continua `Entity`, nunca `AggregateRoot`, não publica Domain Events (sem `domainEvents`/`addDomainEvent`, mesmo após `approve()`), não expõe setter público (`Object.getOwnPropertyDescriptor` sobre os getters do protótipo), integridade dos getters e encapsulamento do estado.

Segue exatamente o mesmo padrão de `opportunity.test.ts` (`ENG-0053`) e `pipeline.test.ts` (`ENG-0054`) — `describe`/`it` por método, `getValue()!`/`getError()`. Testa apenas o comportamento já implementado — `approve()` já rejeitava uma segunda aprovação antes desta missão (`proposal.ts`, `ENG-0040`); esta suíte confirma esse comportamento existente, não o inventa.

Nenhum método, regra, evento, estado ou Value Object novo foi criado. `opportunity.ts`, `pipeline.ts`, `stage.ts`, Repositories, Mappers, Infrastructure e Contracts permanecem inalterados.

## Status

🟢 16 testes implementados (Missão ENG-0055). Comportamento atual da Entity `Proposal` congelado por teste.
