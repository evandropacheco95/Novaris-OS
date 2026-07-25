# roles

⚠️ **Histórico — sem capacidade própria (fechado nesta nota, `ENG-0139`)**: diferente de `permissions/` (que teve um Epic formal de investigação e encerramento, `EPIC-004`), esta pasta nunca recebeu um processo de fechamento próprio — ficou como estrutura vazia (`🚧`) desde a Missão ARCH-001, mesmo depois de `Role` ter sido implementado como Aggregate Root real dentro de `services/kernel/identity/` (`src/domain/aggregates/role/role.ts`, `IDENTITY_AGGREGATE_DESIGN_FREEZE.md`, `EPIC-002`). A evidência é a mesma categoria da que fechou `permissions`: `Role` tem identidade própria, ciclo de vida, Repository (`role-repository.ts`) e Handlers de Application (`CreateRoleHandler`, `GrantPermissionHandler`, `RevokePermissionHandler`) — tudo dentro de `identity/`, nada nesta pasta. Fechada agora, por analogia direta, para não deixar uma ambiguidade que `permissions/` já resolveu para o conceito irmão. Preservada como registro histórico, não removida.

## Objetivo (histórico, ver aviso acima)

Definição de papéis (roles) atribuíveis a usuários — hoje resolvido dentro do Identity Domain (`Role` Aggregate Root, `RoleAssignmentDomainService`).

## Fase

Fase B — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md). Superada pela implementação real de `Role` dentro de `identity/`.

## Interface Pública

Não aplicável — nenhuma interface própria; ver [identity/CONTRACT.md](../identity/CONTRACT.md) para o contrato real de Identity, que já cobre `Role`.

## Dependências

Nenhuma — módulo sem capacidade própria (ver aviso acima).

## Eventos

Nenhum — os eventos relacionados a papel já implementados (`RoleCreated`, `RoleAssignedToUser`, `RoleRevokedFromUser`, `PermissionGrantedToRole`, `PermissionRevokedFromRole`) pertencem ao Identity Domain, não a este módulo.

## Status

🔴 Encerrado como domínio/capacidade própria (`ENG-0139`, por analogia com `PERMISSION_EPIC_CLOSURE.md`). Nenhuma implementação de código pertence a esta pasta.
