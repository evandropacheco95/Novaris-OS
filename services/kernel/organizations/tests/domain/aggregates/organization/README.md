# organization

Testes de `Organization` — espelha [src/domain/aggregates/organization/](../../../../src/domain/aggregates/organization/README.md).

## Conteúdo (Missão ENG-0003.7)

- [organization.test.ts](organization.test.ts) — 13 testes: criação válida, metadata explícita, rejeição de `name`/`slug` vazios, geração de `OrganizationCreated`, `reconstitute` sem validação/eventos, `updateProfile` (cada campo, atualização parcial, rejeição de `name` vazio, `updatedAt`, ausência de novo Domain Event), ausência de exceção.

## Status

🟢 13 testes implementados e passando (Missão ENG-0003.7).
