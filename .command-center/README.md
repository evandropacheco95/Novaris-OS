# .command-center — Centro de Comando da Engenharia

## Objetivo

Reunir, em um único lugar, os templates operacionais usados no dia a dia de engenharia da NOVARIS — missões, planos, revisões, bugs, releases — todos derivados do protocolo oficial em [EXECUTION_PROTOCOL.md](EXECUTION_PROTOCOL.md) e da Constituição, não uma autoridade paralela a eles.

## Conteúdo

| Arquivo | Uso |
|---|---|
| [MISSION_TEMPLATE.md](MISSION_TEMPLATE.md) | Registrar uma missão antes de ela entrar no fluxo de execução |
| [EXECUTION_PROTOCOL.md](EXECUTION_PROTOCOL.md) | Protocolo oficial: as 11 fases obrigatórias antes de qualquer implementação, e o que cada uma exige |
| [ENGINEERING_CHECKLIST.md](ENGINEERING_CHECKLIST.md) | Checklist de qualidade antes de considerar algo pronto |
| [TASK_TEMPLATE.md](TASK_TEMPLATE.md) | Registrar uma Task dentro da hierarquia de `BACKLOG.md` |
| [SPRINT_TEMPLATE.md](SPRINT_TEMPLATE.md) | Planejar e fechar um ciclo de entrega |
| [BUG_REPORT.md](BUG_REPORT.md) | Reportar um defeito |
| [FEATURE_REQUEST.md](FEATURE_REQUEST.md) | Solicitar uma funcionalidade nova |
| [CHANGE_REQUEST.md](CHANGE_REQUEST.md) | Solicitar mudança em algo que já existe (não-arquitetural; arquitetural vira ADR) |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Formato do plano técnico exigido na Fase 5/6 de `EXECUTION_PROTOCOL.md` |
| [CODE_REVIEW.md](CODE_REVIEW.md) | Formato de uma revisão de código |
| [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) | O que precisa ser verdade antes de lançar uma versão |
| [ARCHITECTURE_COMPLIANCE_REPORT_TEMPLATE.md](ARCHITECTURE_COMPLIANCE_REPORT_TEMPLATE.md) | **Obrigatório desde ENG-0002.A**: relatório de conformidade arquitetural, junto com o Self Review, para toda missão ser considerada concluída |
| [ARCHITECTURE_REVIEW_GATE_TEMPLATE.md](ARCHITECTURE_REVIEW_GATE_TEMPLATE.md) | **Obrigatório desde ENS-0002** para toda missão de implementação (`ENG-`): gate binário PASS/FAIL de 12 critérios, último passo antes do Relatório Final e da aprovação do CTO |

## Relação com Outros Módulos

- [EXECUTION_PROTOCOL.md](EXECUTION_PROTOCOL.md) — as 11 fases que estes templates operacionalizam
- [.claude/rules.md](../.claude/rules.md) — relação do protocolo com a Constituição (Artigos 15, 21 e 22)
- [adr/](../adr/README.md) — decisões de arquitetura têm processo próprio (`adr/TEMPLATE.md`), não usam `CHANGE_REQUEST.md`
- [knowledge/core/BACKLOG.md](../knowledge/core/BACKLOG.md) — hierarquia Epic→Feature→Story→Task→Subtask que `TASK_TEMPLATE.md` e `SPRINT_TEMPLATE.md` alimentam
- [specifications/](../specifications/README.md) — destino de uma `FEATURE_REQUEST.md` aprovada

## Status

🚧 Estrutura criada — cada arquivo define título, objetivo, estrutura, campos obrigatórios e checklist. Nenhum destes templates foi usado ainda para registrar uma missão, task, bug ou release real.
