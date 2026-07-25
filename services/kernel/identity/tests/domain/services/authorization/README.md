# authorization

Testes de `AuthorizationDomainService` — espelha [src/domain/services/authorization/](../../../../src/domain/services/authorization/README.md).

## Conteúdo (Missão ENG-0002.10C)

- [authorization-domain-service.test.ts](authorization-domain-service.test.ts) — 9 testes via `InMemoryUserRepository`/`InMemoryRoleRepository` (fakes em memória, definidos só neste arquivo, não são entregáveis de produção): cenário autorizado, cenário não autorizado, ausência de User, ausência de Role (`roleIds` vazio e `roleId` órfão), `permissionCode` malformado, falha do `UserRepository`, falha do `RoleRepository`, ausência de exceção.

## Status

🟢 9 testes implementados e passando (Missão ENG-0002.10C).
