# repositories

Testes do contrato `OrganizationRepository` — espelha [src/domain/repositories/](../../../src/domain/repositories/README.md).

## Conteúdo (Missão ENG-0003.10)

- [organization-repository.contract.test.ts](organization-repository.contract.test.ts) — 9 testes, **inteiramente de checagem em tempo de compilação** (tipos condicionais, sem Fake/Mock/banco em memória): existência do contrato; composição estrutural com `ReadRepository<Organization>`/`WriteRepository<Organization>`; tipagem correta de `findById`/`findAll`/`exists`/`save`/`delete` para `Organization`, `Result`, `Option`, `InfrastructureError`, `UniqueEntityId`; compatibilidade de `Organization` com `AggregateRoot<unknown>`; ausência de método próprio de negócio; conformidade estrutural com o padrão `ReadRepository + WriteRepository` do Identity Domain.

**Diferença deliberada do padrão usado em `services/kernel/identity/tests/domain/repositories/`** (ENG-0002.9) e em `packages/shared-kernel/src/core/repositories/repository.test.ts` (ENG-0001.7): ambos usam um `InMemory*Repository` (Fake em memória) para exercitar o contrato em runtime. A Ordem de Missão ENG-0003.10 proíbe explicitamente criar Fake/Mock/banco em memória para este contrato — por isso esta suíte não instancia nada; cada `it()` reporta a passagem de uma checagem de tipo (`tsc`, primeiro passo do script `test`), nunca um comportamento observado em runtime. Não testa persistência. Não testa implementação.

## Status

🟢 9 testes implementados e passando (Missão ENG-0003.10). Nenhuma implementação concreta (Prisma/Supabase/SQL) — fora do escopo desta pasta e desta missão.
