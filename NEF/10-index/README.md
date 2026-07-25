# Pilar 10 — Index

## Objetivo

Índice mestre de navegação de todo o repositório NOVARIS, por camada — não duplica conteúdo, só aponta.

## Responsabilidades

Manter uma visão única de "onde está cada coisa", complementar aos índices locais (`README.md` de cada pasta).

## Índice por Camada

| Camada | Onde |
|---|---|
| Identidade institucional imutável | [knowledge/core/](../../knowledge/core/README.md) |
| Documentos oficiais com conteúdo real | `NOVARIS_OS.md`, `CONSTITUTION.md`, `NOVARIS_CONSTITUTION.md`, `NES/`, `SYSTEM_ARCHITECTURE.md`, `BOM.md`, `DOMAIN_MODEL.md`, `DATABASE_ARCHITECTURE.md`, `CANONICAL_DATA_MODEL.md`, `UBIQUITOUS_LANGUAGE.md`, `IMPLEMENTATION_ROADMAP.md` — todos em `knowledge/core/` |
| Governança | [PROJECT_RULES.md](../../PROJECT_RULES.md) |
| Decisões de arquitetura | [adr/](../../adr/README.md) (ADR-0001 a ADR-0007) |
| Arquitetura de referência | [architecture/](../../architecture/README.md) |
| Processo de engenharia (repositório) | [engineering/](../../engineering/README.md) |
| Padrão de arquitetura de serviço | [knowledge/engineering/](../../knowledge/engineering/README.md) |
| Especificação funcional | [specifications/](../../specifications/README.md), [specs/](../../specs/README.md) (⚠️ sobrepostos) |
| Conhecimento de negócio | [business/](../../business/README.md) |
| Procedimentos replicáveis | [playbooks/](../../playbooks/README.md), [engineering/playbooks/](../../engineering/playbooks/README.md) |
| Código do monorepo (scaffolding) | [apps/](../../apps/README.md), [packages/](../../packages/README.md), [services/](../../services/README.md), [infrastructure/](../../infrastructure/README.md) |
| Documentação de referência ao cliente/dev | [docs/](../../docs/README.md) |
| Agentes de IA de negócio | [agents/](../../agents/README.md) |
| Regras operacionais de IA | [.claude/](../../.claude/rules.md) |
| Templates e checklists de gestão | [.command-center/](../../.command-center/README.md) |
| Este framework | [NEF/](../README.md) |

## Regras

Este índice é atualizado sempre que uma nova camada de topo é criada — mesma disciplina de manter `README.md` raiz atualizado, já seguida a sessão inteira.

## Exemplos

Alguém procurando "onde fica a regra de nomenclatura de tabela" navega: `NEF/10-index` → Camada "Documentos oficiais" → `DATABASE_ARCHITECTURE.md § 16`.

## Referências Cruzadas

- [README.md](../../README.md) — Mapa da Documentação da raiz, mais granular por seção de `docs/`

## Status

🟢 Documento do NEF v1.0.0.
