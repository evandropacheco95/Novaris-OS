# Pilar 4 — Development

## Objetivo

Definir como um serviço é efetivamente construído: arquitetura interna, padrões de código, testes.

## Responsabilidades

Apontar para o padrão de arquitetura de serviço e processo de repositório já vigentes.

## Regras

- Padrão de arquitetura de serviço (Clean Architecture, DDD, Ports & Adapters, camadas, error handling, logging, testes): [knowledge/engineering/ENGINEERING_PLAYBOOK.md](../../knowledge/engineering/ENGINEERING_PLAYBOOK.md) — 20 capítulos.
- Processo de repositório (git workflow, padrões de código, CI/CD, árvore de decisão): [engineering/](../../engineering/README.md).
- Procedimentos de construção (criar feature, tabela, API, componente, agente, dashboard, automação): [engineering/playbooks/](../../engineering/playbooks/README.md).

## Exemplos

O Identity Service segue `ENGINEERING_PLAYBOOK.md § 2` (estrutura `src/{application,domain,infrastructure,interfaces}`) e `§ 13` (segurança: JWT, RBAC via `services/kernel/roles/` e `permissions/`).

## Referências Cruzadas

- [knowledge/engineering/](../../knowledge/engineering/README.md)
- [knowledge/engineering/templates/](../../knowledge/engineering/templates/README.md)

## Status

🟢 Documento do NEF v1.0.0.
