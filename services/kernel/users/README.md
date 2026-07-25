# users

⚠️ **Histórico — sem capacidade própria (fechado nesta nota, `ENG-0139`)**: diferente de `permissions/` (que teve um Epic formal de investigação e encerramento, `EPIC-004`), esta pasta nunca recebeu um processo de fechamento próprio — ficou como estrutura vazia (`🚧`) desde a Missão ARCH-001, mesmo depois de `User` ter sido implementado como Aggregate Root real dentro de `services/kernel/identity/` (`src/domain/aggregates/user/user.ts`, `IDENTITY_AGGREGATE_DESIGN_FREEZE.md`, `EPIC-002`), com ciclo de vida completo (`create`/`invite`/`activate`/`disable`), Repository (`user-repository.ts`) e Handlers de Application (`CreateUserHandler`, `ActivateUserHandler`, `DisableUserHandler`) — tudo dentro de `identity/`, nada nesta pasta. Fechada agora, por analogia direta, para não deixar uma ambiguidade que `permissions/` já resolveu para o conceito irmão. Preservada como registro histórico, não removida.

## Objetivo (histórico, ver aviso acima)

Gestão de usuários dentro de uma organização — hoje resolvido dentro do Identity Domain (`User` Aggregate Root).

## Fase

Fase B — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md). Superada pela implementação real de `User` dentro de `identity/`.

## Interface Pública

Não aplicável — nenhuma interface própria; ver [identity/CONTRACT.md](../identity/CONTRACT.md) para o contrato real de Identity, que já cobre `User`.

## Dependências

Nenhuma — módulo sem capacidade própria (ver aviso acima).

## Eventos

Nenhum — os eventos relacionados a usuário já implementados (`UserCreated`, `UserInvited`, `UserActivated`, `UserDisabled`) pertencem ao Identity Domain, não a este módulo.

## Status

🔴 Encerrado como domínio/capacidade própria (`ENG-0139`, por analogia com `PERMISSION_EPIC_CLOSURE.md`). Nenhuma implementação de código pertence a esta pasta.
