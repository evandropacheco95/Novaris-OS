# integration-hub

## Objetivo

Ponto único de integração com sistemas externos.

## Fase

Fase G — ver [ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md) e o plano de implementação.

## Interface Pública

Ver [CONTRACT.md](CONTRACT.md).

## Dependências

Configuration, Audit (declaradas originalmente, não exercidas nesta versão — ver [CONTRACT.md § Dependências](CONTRACT.md)).

## Eventos

Nenhum.

## Status

🟡 Estrutural, real (`ENG-0141`, [ADR-0040](../../../adr/ADR-0040-integration-hub-structure-only.md)). Sistemas externos definidos pelo CTO: WhatsApp, Meta, Bling, Google (Calendar/Gmail/Sheets/Ads) — 7 Ports + 7 Console adapters implementados e testados (`@novaris/integration-hub`). **Nenhuma credencial real existe para nenhum dos 4** — nenhum adapter chama uma API externa de verdade, todos só logam (`loggedOnly: true`). Adapters HTTP reais ficam para quando as contas existirem.
