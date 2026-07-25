# entities

## Objetivo

Objetos com identidade própria, que persiste ao longo do tempo mesmo que seus atributos mudem (ex.: `Organization`, `User` — ver [knowledge/core/objects/](../../../../../knowledge/core/objects/README.md)). Definição: [ENGINEERING_PLAYBOOK.md § 3](../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer).

## Conteúdo (Missão ENG-0001.2)

- [unique-entity-id.ts](unique-entity-id.ts) — identidade única de uma Entity; gera valor via `node:crypto` quando nenhum é fornecido; igualdade por valor.
- [entity.ts](entity.ts) — classe base abstrata para toda Entity; igualdade exclusivamente por identidade (`UniqueEntityId`).

Nenhuma entidade de domínio concreta (ex.: `Organization`) foi implementada — apenas as classes base.

## Status

🟢 Blocos base implementados (Missão ENG-0001.2 — Core Domain Foundations). Entidades de domínio concretas ainda não existem.
