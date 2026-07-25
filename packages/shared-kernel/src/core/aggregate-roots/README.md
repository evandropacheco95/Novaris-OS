# aggregate-roots

## Objetivo

Fronteira de consistência transacional de um grupo de Entities/Value Objects — só o Aggregate Root é acessível de fora do agregado. Ver propostas de agregado em [CANONICAL_DATA_MODEL.md § 5-8](../../../../../knowledge/core/CANONICAL_DATA_MODEL.md). Definição: [ENGINEERING_PLAYBOOK.md § 3](../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer).

## Conteúdo

- [aggregate-root.ts](aggregate-root.ts) — classe base abstrata, herda `Entity<T>`; mantém coleção privada de [`DomainEvent`](../domain-events/README.md) (Missão ENG-0001.5 — antes tipada como `unknown`, ver Missão ENG-0001.2) com `addDomainEvent`/`removeDomainEvent`/`clearEvents`. **Não implementa Event Bus nem publica eventos** — só armazena, tipado, o que os métodos protegidos de uma subclasse concreta decidirem adicionar.

Nenhum Aggregate concreto foi implementado — apenas a classe base.

## Status

🟢 Bloco base implementado (Missão ENG-0001.2 — Core Domain Foundations). Coleção de eventos tipada com `DomainEvent` desde a Missão ENG-0001.5. Aggregates concretos ainda não existem.
