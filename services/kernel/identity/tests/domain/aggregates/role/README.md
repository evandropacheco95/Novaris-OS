# role

Testes de `Role` — espelha [src/domain/aggregates/role/](../../../../src/domain/aggregates/role/README.md).

## Conteúdo (Missão ENG-0002.8)

- [role.test.ts](role.test.ts) — 13 testes: criação válida, `reconstitute` sem validação/eventos, `grantPermission`/`revokePermission` (incluindo idempotência de revogar uma Permission não concedida e revogação por igualdade de valor), embedding de `Permission` por valor, geração correta de cada um dos 3 Domain Events, incremento de `version`/`updatedAt`/`updatedBy`, isolamento de Aggregate (`organizationId` só por referência).

## Status

🟢 13 testes implementados e passando (Missão ENG-0002.8).
