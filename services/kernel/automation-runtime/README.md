# automation-runtime

## Objetivo

Execução de workflows e automações.

## Fase

Fase F — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md).

## Dependências

Event Bus, Logging, Notifications (corrigido em `ENG-0142` — ver [CONTRACT.md § Dependências](CONTRACT.md)). `Scheduler`/`Identity`, citados originalmente, não são exercidos nesta versão.

## Eventos

Nenhum — consumidor do Event Bus, não origem.

## Status

🟢 Real (`ENG-0142`, [ADR-0041](../../../adr/ADR-0041-automation-ai-runtime-salesforce-reference.md)). Inspirado no Salesforce Flow: `AutomationRule` (gatilho + ações `log`/`notify`/`webhook`) implementado de ponta a ponta (`@novaris/automation-runtime`) — Domain/Application/Infrastructure (Prisma real) + API (`POST`/`GET /automation-rules`, `POST /automation-rules/:id/toggle`). Regras são configuráveis via API em runtime, sem restart. Antes fora de escopo por falta de especificação de "quais workflows" — resolvido tratando isso como motor genérico, não workflow hardcoded.
