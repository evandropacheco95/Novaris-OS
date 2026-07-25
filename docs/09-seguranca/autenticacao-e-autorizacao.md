# Autenticação e Autorização

## Autenticação (AuthN)

<!-- Supabase Auth: métodos suportados, MFA. -->

🚧 A ser detalhado — ver [docs/05-backend/autenticacao.md](../05-backend/autenticacao.md).

## Autorização (AuthZ)

<!-- Modelo de papéis (RBAC) por organização/tenant. -->

🟢 **Mecanismo básico implementado (`ADR-0036`, `ENG-0136`)**: `PermissionGuard` + `@RequirePermission()` (NestJS Guard/Reflector) aplicam um catálogo de 13 códigos de `Permission` (um por Controller/recurso — `<domínio>.<recurso>.manage` ou `.read`) sobre as 13 rotas protegidas da API, reaproveitando `AuthorizationDomainService` (Identity Domain). Ver [ADR-0036](../../adr/ADR-0036-rbac-permission-catalog-and-guard.md) para o catálogo completo e o mecanismo.

🚧 Ainda a detalhar: matriz de permissões diferenciada por papel (`SuperMaster`/`Usuario` hoje têm acesso idêntico, decisão de produto adiada — `ADR-0036`), granularidade `.read`/`.manage` separada, semântica de negação explícita.

## Controle de Acesso a Dados

<!-- Row Level Security como mecanismo primário de autorização a nível de dados. -->

🚧 A ser detalhado — ver [protecao-de-dados.md](protecao-de-dados.md).

## Autorização de Agentes de IA

<!-- Quais ações um agente de IA pode executar em nome de um usuário, e quais exigem confirmação humana. -->

🚧 A ser detalhado — ver [docs/06-integracao-ia/arquitetura-de-agentes.md](../06-integracao-ia/arquitetura-de-agentes.md).

## Tópicos a Documentar

- Matriz de permissões por papel
- Auditoria de ações sensíveis
