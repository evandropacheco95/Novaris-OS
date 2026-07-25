# NOVARIS Engineering Framework (NEF)

Versão: 1.0.0

Status: Oficial

Classificação: Framework de Engenharia

---

## Objetivo

O NEF é o framework que organiza e referencia — não substitui — tudo que já rege o ciclo de vida de software da NOVARIS. Depois desta missão, qualquer implementação (a começar por EPIC-001 — Identity Service) deve seguir o NEF como ponto de entrada: cada um dos 10 pilares abaixo diz *onde* está a regra vigente para aquele aspecto do trabalho.

## Por Que "Organiza" e Não "Substitui"

A própria Ordem de Missão NEF-001 restringe: "não alterar a arquitetura aprovada anteriormente". O repositório já tem, hoje, documentos reais e vinculantes para a maior parte dos 10 pilares (Constituição, Governança, Arquitetura, Desenvolvimento, Playbooks, Templates, Checklists). O NEF não reescreve esse conteúdo — cada pilar tem um documento próprio com Objetivo/Responsabilidades/Regras/Exemplos/Referências Cruzadas, mas a regra detalhada continua na fonte já aprovada, linkada, não copiada (Constituição, Artigo 16 — proibido duplicar). Onde a missão pediu algo genuinamente novo — papéis, modelo de planejamento, roadmap mestre de engenharia — o conteúdo é real e novo, porque nenhum documento anterior cobria esse território.

## Os 10 Pilares

| # | Pilar | Resumo |
|---|---|---|
| 1 | [Constitution](01-constitution/README.md) | Regras supremas do projeto |
| 2 | [Governance](02-governance/README.md) | Hierarquia de autoridade dos documentos, processo de emenda |
| 3 | [Architecture](03-architecture/README.md) | Arquitetura de sistema, domínios, dados |
| 4 | [Development](04-development/README.md) | Como um serviço é construído (Clean Architecture, DDD) |
| 5 | [Operations](05-operations/README.md) | Operação da plataforma em produção |
| 6 | [Evolution](06-evolution/README.md) | Como a plataforma evolui — inclui o [MASTER_ENGINEERING_ROADMAP.md](06-evolution/MASTER_ENGINEERING_ROADMAP.md) |
| 7 | [Playbooks](07-playbooks/README.md) | Procedimentos replicáveis |
| 8 | [Templates](08-templates/README.md) | Formulários reutilizáveis |
| 9 | [Checklists](09-checklists/README.md) | Critérios de verificação obrigatória |
| 10 | [Index](10-index/README.md) | Índice mestre de navegação do repositório |

## Papéis e Planejamento

- [ROLES.md](ROLES.md) — papéis humanos e de IA formalizados nesta missão
- [PLANNING_MODEL.md](PLANNING_MODEL.md) — hierarquia PROGRAM → EPIC → MISSION → TASK → CHECKLIST

## ⚠️ Sobreposições — Status de Resolução

Cada um dos 10 pilares, os papéis e o modelo de planejamento tinham nome ou conceito parecido com algo que já existia antes desta missão — três "playbooks", três "roadmaps mestres", três listas de papéis, quatro hierarquias de trabalho, duas Constituições. A maior parte já foi **resolvida**:

- Constituição, Roadmaps, Papéis, Modelo de Planejamento e Playbooks — resolvidos por [ADR-0008](../adr/ADR-0008-foundation-freeze.md) (Missão ENG-0000.5). Fonte canônica de cada assunto: [PROJECT_RULES.md § Matriz de Autoridade Documental](../PROJECT_RULES.md).
- NES vs. NEF vs. Handbook (qual é o ponto de entrada de engenharia) — resolvido por [ADR-0009](../adr/ADR-0009-engineering-entry-point-authority.md) (Missão DOC-0001): NEF é a referência estrutural, o Handbook é o guia de leitura linear, o NES é histórico.

Sobreposições de conteúdo ainda não resolvidas (fora do escopo dessas missões) continuam listadas em [PROJECT_RULES.md](../PROJECT_RULES.md).

## Relação com Outros Módulos

- [NES/README.md](../NES/README.md) — "Documento Mestre de Engenharia" anterior; por [ADR-0009](../adr/ADR-0009-engineering-entry-point-authority.md) é histórico, redirecionado para o NEF (estrutura) e para o Handbook (narrativa)
- [knowledge/engineering/NOVARIS_ENGINEERING_HANDBOOK.md](../knowledge/engineering/NOVARIS_ENGINEERING_HANDBOOK.md) — guia de leitura linear de todo o processo de engenharia; complementar ao NEF (referência), não concorrente — ver [ADR-0009](../adr/ADR-0009-engineering-entry-point-authority.md)
- [PROJECT_RULES.md](../PROJECT_RULES.md) — hierarquia de autoridade do repositório; o NEF está na Matriz de Autoridade Documental desde [ADR-0008](../adr/ADR-0008-foundation-freeze.md)
- [.claude/rules.md](../.claude/rules.md), [.command-center/EXECUTION_PROTOCOL.md](../.command-center/EXECUTION_PROTOCOL.md) — fluxo operacional que continua vigente independente do NEF

## Status

🟢 Oficial (v1.0.0). Sobreposições de ponto de entrada resolvidas por [ADR-0008](../adr/ADR-0008-foundation-freeze.md) e [ADR-0009](../adr/ADR-0009-engineering-entry-point-authority.md) (Missão DOC-0001). Nenhuma arquitetura anterior foi alterada para criar este framework.
