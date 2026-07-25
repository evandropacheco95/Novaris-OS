# permissions

⚠️ **Histórico — sem capacidade própria (Missão ENG-0004, `EPIC-004`, atualizado por ENG-0008)**: este módulo foi investigado formalmente ([PERMISSION_EPIC_PLANNING.md](PERMISSION_EPIC_PLANNING.md), [PERMISSION_DOMAIN_DISCOVERY.md](PERMISSION_DOMAIN_DISCOVERY.md)) e o Epic foi encerrado ([PERMISSION_EPIC_CLOSURE.md](PERMISSION_EPIC_CLOSURE.md)) com a decisão **`PERMISSION REMAINS INSIDE IDENTITY`** — `Permission` é um Value Object implementado dentro de `services/kernel/identity/`, sem identidade própria, sem ciclo de vida próprio, e estruturalmente sem Repository possível. Esta pasta não tem capacidade própria e não deve ser tratada como dependência por nenhum outro módulo — a dependência real, para verificação de permissão, é de `Identity`. Preservada como registro histórico, não removida.

## Objetivo (histórico, ver aviso acima)

Permissões granulares e verificação de autorização — hoje resolvido dentro do Identity Domain (`Permission` Value Object, `AuthorizationDomainService`).

## Fase

Fase B — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md). Superada pela decisão de `EPIC-004`.

## Interface Pública

Não aplicável — nenhuma interface própria; ver [identity/CONTRACT.md](../identity/CONTRACT.md) para o contrato real de Identity, que já cobre `Permission`.

## Dependências

Nenhuma — módulo sem capacidade própria (ver aviso acima).

## Eventos

Nenhum — os eventos relacionados a permissão já implementados (`PermissionGrantedToRole`, `PermissionRevokedFromRole`) pertencem ao Identity Domain, não a este módulo.

## Status

🔴 Encerrado como domínio/capacidade própria (Missão ENG-0004.2, `PERMISSION_EPIC_CLOSURE.md`). Nenhuma implementação de código pertence a esta pasta.
