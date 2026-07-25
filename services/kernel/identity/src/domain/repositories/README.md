# repositories

Contratos de persistência (ports) do Identity Domain — nenhuma implementação concreta, nenhuma tecnologia. Implementação real fica em `infrastructure/`, fora do escopo desta pasta ([ENGINEERING_PLAYBOOK.md § 3](../../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer)).

## Conteúdo (Missão ENG-0002.9)

- [user-repository.ts](user-repository.ts) — `UserRepository extends ReadRepository<User>, WriteRepository<User>`.
- [role-repository.ts](role-repository.ts) — `RoleRepository extends ReadRepository<Role>, WriteRepository<Role>`.

Ambos reutilizam integralmente `ReadRepository<T>`/`WriteRepository<T>` do Shared Kernel (`@novaris/shared-kernel`, ENG-0001.7) — composição exata já congelada em [IDENTITY_TECHNICAL_BLUEPRINT.md § 5](../../../IDENTITY_TECHNICAL_BLUEPRINT.md), **sem nenhum método próprio**. Nenhuma operação foi acrescentada além do que o Shared Kernel já provê — nenhuma fonte oficial define índices/consultas reais do Identity Service; acrescentar um (`findByEmail`, por exemplo) seria antecipar uma decisão de infraestrutura ainda não tomada. Lista completa de operações consideradas e rejeitadas: Self Review da Missão ENG-0002.9.

Sem `PermissionRepository` — `Permission` é Value Object, persistida como parte de `Role` (Blueprint § 5).

## Status

🟢 2 contratos implementados (Missão ENG-0002.9). Nenhuma implementação concreta (Prisma/Supabase/SQL) — fora do escopo desta pasta e desta missão.
