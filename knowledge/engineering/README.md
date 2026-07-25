# Engineering (knowledge/engineering/)

## Objetivo

Abrigar o [ENGINEERING_PLAYBOOK.md](ENGINEERING_PLAYBOOK.md) — a referência técnica principal de como um serviço da NOVARIS é construído (Clean Architecture, DDD, Ports & Adapters) — os [standards/](standards/README.md) derivados dele, os templates reutilizáveis, o [NOVARIS_ENGINEERING_HANDBOOK.md](NOVARIS_ENGINEERING_HANDBOOK.md) — guia de leitura linear que amarra tudo isso (Missão NEP-0001) — e o [NOVARIS_ENGINEERING_COMPANION.md](NOVARIS_ENGINEERING_COMPANION.md), que explica o Handbook em linguagem simples, sem autoridade normativa própria. Nenhum serviço poderá ser implementado sem seguir o playbook (Missão ENG-0000.3).

## Escopo

Padrão de arquitetura interna de serviço: camadas, convenções de código, error handling, logging, observabilidade, segurança, testes, eventos, APIs, checklist de PR e Definition of Done — mais o guia consolidado de todo o processo de engenharia (filosofia, fluxos, governança, papéis de IA).

## Conteúdo

- [NOVARIS_ENGINEERING_HANDBOOK.md](NOVARIS_ENGINEERING_HANDBOOK.md) — guia mestre de leitura linear: filosofia, estrutura do repositório, fluxos oficiais, tipos de missão, governança, padrões, criação de domínios, merge, release, roadmap, papéis de IA (Missão NEP-0001)
- [NOVARIS_ENGINEERING_COMPANION.md](NOVARIS_ENGINEERING_COMPANION.md) — explica, seção a seção, o Handbook acima em português simples, com analogias e exemplos reais do repositório; aplica a convenção "Termo Técnico" (`PROJECT_RULES.md`, Emenda 31); documento pedagógico, sem autoridade normativa
- [ENGINEERING_PLAYBOOK.md](ENGINEERING_PLAYBOOK.md) — 20 capítulos
- [templates/](templates/README.md) — 7 templates reutilizáveis (serviço, módulo, API, ADR, evento, repositório, caso de uso)
- [standards/](standards/README.md) — Engineering Standards (ENS): padrões obrigatórios de implementação por tipo de componente, começando por [AGGREGATE_IMPLEMENTATION_STANDARD.md](standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (Missão ENS-0001)

## Relação com Outros Módulos

- [engineering/](../../engineering/README.md) — processo de repositório (git, CI/CD); escopo diferente deste documento (arquitetura de serviço)
- [knowledge/technical/engenharia/](../technical/engenharia/README.md) — conhecimento tácito/decisões do dia a dia de engenharia; escopo diferente (não é o padrão normativo)
- [adr/](../../adr/README.md) — toda escolha de ferramenta marcada "requer decisão" no playbook vira ADR quando decidida
- [services/](../../services/README.md) — consumidor direto deste playbook

## Campos Reservados para Futuras Expansões

- 🚧 A definir

## Status

🚧 Estrutura criada (Missão ENG-0000.3). Playbook com conteúdo real; templates estruturais, sem instância preenchida.
