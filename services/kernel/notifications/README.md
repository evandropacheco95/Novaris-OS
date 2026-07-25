# notifications

## Objetivo

Envio de notificações a usuários.

## Fase

Fase E — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md).

## Dependências

Identity

## Eventos

Nenhum — consumidor de `UserCreated` (Event Bus), não origem.

## Status

🟡 Parcial, real (`ENG-0140`, [ADR-0039](../../../adr/ADR-0039-remaining-kernel-infrastructure-adapters.md)). `Notifier` (Port) + `ConsoleNotifier` (Infrastructure) implementados e testados (`@novaris/notifications`) — ligado a `UserCreated` via Event Bus em `apps/api`, verificado ao vivo. Canal externo real (email/SMS/push) deliberadamente adiado — decisão de fornecedor fora do escopo desta missão.
