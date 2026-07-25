# ai-runtime

## Objetivo

Execução controlada de IA — todo acesso de agentes a dados passa por aqui.

## Fase

Fase F — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md).

## Dependências

Logging (real). `Event Bus`, `Configuration`, `Identity` (citadas originalmente) não exercidas nesta versão — ver [CONTRACT.md § Dependências](CONTRACT.md).

⚠️ **Correção (Missão ENG-0008)**: esta dependência listava "Permissions" como módulo independente — obsoleto desde `PERMISSION_EPIC_CLOSURE.md` (EPIC-004). A dependência real é de `Identity`.

## Eventos

Nenhum.

## Status

🟡 Estrutural, real (`ENG-0142`, [ADR-0041](../../../adr/ADR-0041-automation-ai-runtime-salesforce-reference.md)). Inspirado no Salesforce Einstein Copilot — `AIRuntime.ask()` (Port) + `ConsoleAIRuntime` (Infrastructure) implementados e testados (`@novaris/ai-runtime`), expostos via `POST /ai/ask`. **Nenhuma chamada real a um modelo de IA** — sem credencial (`OPENAI_API_KEY`/`ANTHROPIC_API_KEY`), mesmo critério de `integration-hub` (`ADR-0040`).
