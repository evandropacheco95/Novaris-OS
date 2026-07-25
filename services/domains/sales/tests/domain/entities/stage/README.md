# sales / tests / domain / entities / stage

## Purpose

Testes unitários da Internal Entity `Stage` — espelha [domain/entities/](../../../../domain/entities/README.md) (`stage/stage.ts`).

## Conteúdo (Missão ENG-0056)

- [stage.test.ts](stage.test.ts) — 14 testes: `create()` (criação com `name`, rejeita `name` vazio/só espaços com `ValidationError`, nunca lança exceção), `reconstitute()` (preserva id e estado fornecidos, sem validação, ausência de `domainEvents`), `name` (getter reflete valor de criação e de reconstituição), e uma suíte estrutural verificando que `Stage` continua `Entity`, nunca `AggregateRoot`, não publica Domain Events (sem `domainEvents`/`addDomainEvent`), não expõe setter público (`Object.getOwnPropertyDescriptor`), integridade do getter e encapsulamento do estado.

Segue exatamente o mesmo padrão de `proposal.test.ts` (`ENG-0055`), `opportunity.test.ts` (`ENG-0053`) e `pipeline.test.ts` (`ENG-0054`). Testa apenas o comportamento já implementado — `Stage` não tem `createdAt`/`updatedAt` (diferente de `Proposal`, `stage.ts` § "Estado deliberadamente mínimo") nem nenhum método de mutação além de `create()`/`reconstitute()`; nenhum teste inventa um desses.

Nenhum método, regra, evento, estado ou Value Object novo foi criado. `opportunity.ts`, `pipeline.ts`, `proposal.ts`, Repositories, Mappers, Infrastructure e Contracts permanecem inalterados.

**Encerra a cobertura unitária isolada do Domain Layer de `Sales`** — `Opportunity` (`ENG-0053`), `Pipeline` (`ENG-0054`), `Proposal` (`ENG-0055`) e `Stage` (`ENG-0056`) têm agora suíte própria.

## Status

🟢 14 testes implementados (Missão ENG-0056). Comportamento atual da Entity `Stage` congelado por teste.
