# Specs

## Objetivo

Ponto de partida obrigatório de toda funcionalidade da NOVARIS: nenhuma feature é implementada sem antes existir uma SPEC, seguindo [SPEC_TEMPLATE.md](SPEC_TEMPLATE.md).

## Escopo

Uma SPEC por funcionalidade, cobrindo Objetivo, Problema, Usuário, Fluxo, Wireframe, Regras de Negócio, Banco, API, Eventos, Permissões, Integrações, IA, Automações, Critérios de Aceite, Riscos, Plano de Testes e Roadmap — conforme `SPEC_TEMPLATE.md`.

## ⚠️ Sobreposição não resolvida com `specifications/`

Este repositório já tem uma pasta [specifications/](../specifications/README.md) (criada na Missão 011, [ADR-0002](../adr/ADR-0002-reestruturar-arvore-do-repositorio.md)) com propósito muito próximo:

- `specifications/<dominio>/` já tem `database.md`, `api.md`, `events.md`, `permissions.md`, `integrations.md`, `roadmap.md` por domínio — campos que se sobrepõem a `Banco`, `API`, `Eventos`, `Permissões`, `Integrações`, `Roadmap` de `SPEC_TEMPLATE.md`.
- `specifications/README.md` já tem um template de PRD por feature (`Problema`, `Usuários Afetados`, `Solução Proposta`, `Fora de Escopo`, `Métricas de Sucesso`, `Dependências Técnicas`) — mais enxuto e com campos diferentes de `SPEC_TEMPLATE.md`.
- [.command-center/FEATURE_REQUEST.md](../.command-center/FEATURE_REQUEST.md) hoje aponta uma feature aprovada para `specifications/<dominio>/features.md`, não para `specs/`.

Não decidi qual das duas estruturas prevalece, nem tentei fundir os dois templates — isso exigiria escolher que campos ganham (ex.: `Wireframe`, `Usuário`, `Regras de Negócio` só existem aqui; `Screens` só existe lá) sem instrução para isso. Ambas as pastas ficam registradas como existentes até uma decisão explícita, seguindo a mesma disciplina já aplicada a outros conflitos deste repositório (stack tecnológica, contagem de produtos, `MONOREPO_ARCHITECTURE.md` vs. scaffolding real).

## Relação com Outros Módulos

- [SPEC_TEMPLATE.md](SPEC_TEMPLATE.md) — template obrigatório de toda SPEC
- [specifications/](../specifications/README.md) — estrutura equivalente já existente; ver nota de sobreposição acima
- [.command-center/FEATURE_REQUEST.md](../.command-center/FEATURE_REQUEST.md) — ponto de entrada de uma solicitação de feature, hoje aponta para `specifications/`, não para `specs/`
- [adr/](../adr/README.md) — decisões arquiteturais que surgirem ao preencher `Banco`/`API`/`Integrações` de uma SPEC viram ADR, não ficam só na SPEC

## Campos Reservados para Futuras Expansões

- 🚧 Reconciliação com `specifications/` — pendente

## Status

🚧 Estrutura criada. Nenhuma SPEC real foi escrita ainda. Sobreposição com `specifications/` registrada, não resolvida.
