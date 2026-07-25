# value-objects

## Objetivo

Objetos sem identidade, imutáveis, definidos inteiramente pelo seu valor (ex.: um `Email`, um `Money`). Definição: [ENGINEERING_PLAYBOOK.md § 3](../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer).

## Conteúdo (Missão ENG-0001.2)

- [value-object.ts](value-object.ts) — classe base abstrata; propriedades `readonly`/congeladas (`Object.freeze`), igualdade por deep equality.

Nenhum Value Object concreto (ex.: `Email`, `Money`) foi implementado — apenas a classe base.

## Status

🟢 Bloco base implementado (Missão ENG-0001.2 — Core Domain Foundations). Value Objects concretos ainda não existem.
