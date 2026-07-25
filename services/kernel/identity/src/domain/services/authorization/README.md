# authorization

`AuthorizationDomainService` — coordena a verificação de autorização do Identity Domain.

## Conteúdo (Missão ENG-0002.10C)

- [authorization-domain-service.ts](authorization-domain-service.ts) — `AuthorizationDomainService implements AsyncDomainService<CheckPermissionInput, boolean>` ([IDENTITY_TECHNICAL_BLUEPRINT.md § 4](../../../../IDENTITY_TECHNICAL_BLUEPRINT.md), aprovado em [DOMAIN_SERVICE_IDENTIFICATION.md § 5](../../../../DOMAIN_SERVICE_IDENTIFICATION.md)). Fluxo: valida `permissionCode` (`Permission.create`) → localiza `User` (`UserRepository.findById`) → carrega cada `Role` referenciado em `user.roleIds` (`RoleRepository.findById`, um por um) → devolve `true` se algum `Role` possuir a `Permission`, `false` caso contrário.

## Dependências

- `UserRepository`, `RoleRepository` ([src/domain/repositories/](../../repositories/README.md)) — injetadas via construtor.

## Decisões de Escopo

- Sem `RoleHasPermissionSpecification` como classe própria (Blueprint § 6 a propõe) — checagem inline (`role.permissions.some(...)`), um único call site; mesmo critério de `AuthenticationDomainService` (ENG-0002.10B) para `UserIsActiveSpecification`.
- `findById` em loop para carregar os `Role`s do `User` — resolve a escolha de índice que o Blueprint § 10 deixava explicitamente em aberto ("`findAll()` filtrado... ou `findById` em loop — decisão de índice fora de escopo").
- `userId` inexistente e `roleId` órfão devolvem `Result.ok(false)` — resposta de domínio válida, não falha. `Result.fail` só para `permissionCode` malformado ou Repository indisponível.
- Somente leitura — nenhum método de escrita de `UserRepository`/`RoleRepository` é usado.

## Status

🟢 Implementado e testado (Missão ENG-0002.10C). `RoleAssignmentDomainService` também já implementado (`services/kernel/identity/src/domain/services/role-assignment/`). Consumido pela primeira vez em produção por `PermissionGuard` (`apps/api/src/auth/permission.guard.ts`, `ADR-0036`, `ENG-0136`) — de `EPIC-002` até esta missão, existia implementado e testado sem nenhum caminho HTTP real que o chamasse.
