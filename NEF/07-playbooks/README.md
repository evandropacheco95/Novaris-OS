# Pilar 7 — Playbooks

## Objetivo

Reunir os procedimentos replicáveis da engenharia NOVARIS.

## Responsabilidades

Apontar para os playbooks já existentes — este pilar não cria procedimento novo.

## Regras

✅ **Localização única confirmada** ([ADR-0008](../../adr/ADR-0008-foundation-freeze.md), Missão ENG-0000.5, Foundation Freeze):

- [engineering/playbooks/](../../engineering/playbooks/README.md) — localização oficial única, técnica e de negócio: 7 procedimentos técnicos (create-feature, create-table, create-api, create-component, create-agent, create-dashboard, create-automation) + destino de futuros playbooks de negócio/produto.
- [playbooks/](../../playbooks/README.md) (raiz) — redirecionado para `engineering/playbooks/`; nunca teve conteúdo real, preservado por histórico.
- Este pilar (`NEF/07-playbooks/`) — não cria um terceiro conjunto de arquivos, só indexa a localização única acima.

## Exemplos

Para criar o Identity Service, o playbook técnico relevante é `engineering/playbooks/create-api.md` (hoje `TODO`, estrutura apenas).

## Referências Cruzadas

- [playbooks/](../../playbooks/README.md)
- [engineering/playbooks/](../../engineering/playbooks/README.md)

## Status

🟢 Documento do NEF v1.0.0. Não duplica conteúdo dos playbooks já existentes.
