# user

Testes de `User` — espelha [src/domain/aggregates/user/](../../../../src/domain/aggregates/user/README.md).

## Conteúdo (Missão ENG-0002.7)

- [user.test.ts](user.test.ts) — 21 testes: criação válida, `reconstitute` sem validação/eventos, cada transição de status válida e inválida (`invite`/`activate`/`disable`, incluindo ausência de reativação), `assignRole`/`revokeRole` (incluindo idempotência de revogar um Role não atribuído), geração correta de cada um dos 6 Domain Events, incremento de `version`/`updatedAt`/`updatedBy` a cada mutação bem-sucedida (e ausência de incremento quando a mutação falha).

## Status

🟢 21 testes implementados e passando (Missão ENG-0002.7).
