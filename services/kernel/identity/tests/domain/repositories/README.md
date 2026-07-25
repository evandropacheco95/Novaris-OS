# repositories

Testes estruturais dos contratos de repositório — espelha [src/domain/repositories/](../../../src/domain/repositories/README.md).

## Conteúdo (Missão ENG-0002.9)

- [user-repository.test.ts](user-repository.test.ts) — 5 testes, via `InMemoryUserRepository` (fake em memória, definido só neste arquivo, não é entregável de produção): atribuibilidade a `ReadRepository<User>`/`WriteRepository<User>`, `findById` (`Option.none`/`Option.some`), `exists` refletindo `save`/`delete`, `findAll`.
- [role-repository.test.ts](role-repository.test.ts) — mesma cobertura, via `InMemoryRoleRepository`, para `Role`.

Mesmo padrão de fixture já usado em `packages/shared-kernel/src/core/repositories/repository.test.ts` (ENG-0001.7) — valida a composição estrutural dos contratos, não uma implementação real de persistência.

## Status

🟢 10 testes implementados e passando (Missão ENG-0002.9).
