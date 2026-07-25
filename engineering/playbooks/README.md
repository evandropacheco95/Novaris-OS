# Engineering Playbooks

Procedimentos oficiais da engenharia: o passo a passo para criar cada tipo de artefato técnico na NOVARIS.

> ✅ **Localização oficial única de playbooks** ([ADR-0008](../../adr/ADR-0008-foundation-freeze.md), Missão ENG-0000.5): [playbooks/](../../playbooks/README.md) (raiz, nunca teve conteúdo) foi redirecionado para esta pasta — playbooks de negócio/produto também são criados aqui a partir de agora. [docs/10-operacoes/runbooks/](../../docs/10-operacoes/runbooks/README.md) continua com escopo diferente (resposta a **incidentes**, não procedimento replicável).

## Conteúdo

| Arquivo | Uso |
|---|---|
| [create-feature.md](create-feature.md) | Procedimento para criar uma feature |
| [create-table.md](create-table.md) | Procedimento para criar uma tabela |
| [create-api.md](create-api.md) | Procedimento para criar uma API |
| [create-component.md](create-component.md) | Procedimento para criar um componente |
| [create-agent.md](create-agent.md) | Procedimento para criar um agente |
| [create-dashboard.md](create-dashboard.md) | Procedimento para criar um dashboard |
| [create-automation.md](create-automation.md) | Procedimento para criar uma automação |

Todos seguem o mesmo esquema: Objetivo, Pré-requisitos, Fluxo, Checklist, Critérios de Aceite, Pós-implementação.

## Relação com Outros Módulos

- [.command-center/EXECUTION_PROTOCOL.md](../../.command-center/EXECUTION_PROTOCOL.md) — estes playbooks detalham, para cada tipo de artefato, o que a Fase 7 (Implementação) e a Fase 8 (Testes) exigem na prática
- [engineering/decision-tree.md](../decision-tree.md) — crivo aplicado antes de seguir qualquer um destes playbooks
- [specs/SPEC_TEMPLATE.md](../../specs/SPEC_TEMPLATE.md) / [specifications/](../../specifications/README.md) — a SPEC ou especificação funcional é o que diz *o quê* construir; estes playbooks dizem *como* construir

## Status

🚧 Estrutura criada. Nenhum dos 7 playbooks tem conteúdo ainda — apenas os 6 campos definidos por instrução.
