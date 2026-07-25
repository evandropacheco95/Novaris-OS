# repositories

Contrato de persistência (port) do Organization Domain — nenhuma implementação concreta, nenhuma tecnologia. Implementação real fica em `infrastructure/`, fora do escopo desta pasta ([ENGINEERING_PLAYBOOK.md § 3](../../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer)).

## Conteúdo (Missão ENG-0003.9)

- [organization-repository.ts](organization-repository.ts) — `OrganizationRepository extends ReadRepository<Organization>, WriteRepository<Organization>`.

Reutiliza integralmente `ReadRepository<T>`/`WriteRepository<T>` do Shared Kernel (`@novaris/shared-kernel`, ENG-0001.7) — composição idêntica ao padrão já congelado no Identity Domain (`UserRepository`/`RoleRepository`, ENG-0002.9), **sem nenhum método próprio**. Nenhuma consulta específica de negócio (ex.: buscar por `slug`) foi acrescentada — nenhuma fonte oficial define índices/consultas reais do Organization Domain ainda.

## Status

🟢 1 contrato implementado (Missão ENG-0003.9). Nenhuma implementação concreta (Prisma/Supabase/SQL) — fora do escopo desta pasta e desta missão.
