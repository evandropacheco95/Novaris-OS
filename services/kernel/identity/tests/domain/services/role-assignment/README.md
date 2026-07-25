# role-assignment

Testes de `RoleAssignmentDomainService` — espelha [src/domain/services/role-assignment/](../../../../src/domain/services/role-assignment/README.md).

## Conteúdo (Missão ENG-0002.10D)

- [role-assignment-domain-service.test.ts](role-assignment-domain-service.test.ts) — 10 testes via `InMemoryUserRepository`/`InMemoryRoleRepository` (fakes em memória, definidos só neste arquivo, não são entregáveis de produção): atribuição válida (incluindo persistência via `save`), User inexistente, Role inexistente, Organization incompatível, Role duplicada (comportamento herdado, não corrigido), falha de `findById` de cada Repository, falha de `save`, ausência de exceção.

## Status

🟢 10 testes implementados e passando (Missão ENG-0002.10D).
