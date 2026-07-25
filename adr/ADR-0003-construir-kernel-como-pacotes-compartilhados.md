# ADR-0003 - Construir o Kernel como Pacotes Compartilhados

> ⚠️ **Revogado por [ADR-0004](ADR-0004-mover-kernel-para-services.md)** (Missão ENG-0000, 2026-07-14). O Kernel foi movido de `packages/kernel/` para `services/`. Este documento é mantido íntegro como registro histórico da decisão original — não editado, não removido.

## Problema

A "Ordem de Missão ARCH-001" pede a construção da infraestrutura base (Kernel) da plataforma NOVARIS — 20 módulos compartilhados por todos os domínios de negócio — antes de qualquer módulo de negócio. Era preciso decidir onde e como essa infraestrutura seria estruturada no repositório.

## Contexto

`SYSTEM_ARCHITECTURE.md § 4` define o Kernel como a camada que "concentra tudo que é compartilhado. Todos os demais módulos utilizam o Kernel. Nenhum domínio replica funcionalidades do Kernel." O repositório já tem duas pastas de scaffolding vazias com propósito relevante: `packages/` ("código compartilhado entre apps — nunca deployado sozinho") e `services/` ("serviços de backend que não são uma aplicação com interface própria — ex.: workers, processos de background").

## Alternativas

1. **`packages/kernel/`** — Kernel como pacote de código compartilhado, importado por outros pacotes/apps, sem processo de deploy próprio.
2. **`services/kernel/`** — Kernel como um ou mais serviços de backend com deploy independente.
3. **Pasta de topo própria (`kernel/`)** — Kernel como uma quarta categoria, ao lado de `packages/`/`services/`, fora do scaffolding já definido por [ADR-0002](ADR-0002-reestruturar-arvore-do-repositorio.md).

## Escolha

Alternativa 1 — `packages/kernel/`, com um subdiretório por módulo (`identity/`, `organizations/`, `users/`, `roles/`, `permissions/`, `audit/`, `configuration/`, `feature-flags/`, `storage/`, `files/`, `notifications/`, `logging/`, `event-bus/`, `search/`, `ai-runtime/`, `automation-runtime/`, `scheduler/`, `realtime/`, `monitoring/`, `integration-hub/`).

## Consequências

Positivas: usa scaffolding já existente e com definição compatível (nenhuma pasta nova criada); reforça que nenhum domínio de negócio pode acessar o Kernel além de sua interface pública, já que pacotes não expõem endpoint de rede próprio. Negativas: módulos que futuramente precisarem de processo próprio (ex.: um scheduler que roda como daemon separado) exigirão uma nova decisão de migração para `services/` — não antecipada aqui.

## Responsável

Decisão de arquitetura: usuário (Ordem de Missão ARCH-001). Execução: Engenheiro Principal, sob o protocolo de [.claude/rules.md](../.claude/rules.md) e [.command-center/EXECUTION_PROTOCOL.md](../.command-center/EXECUTION_PROTOCOL.md).

## Data

2026-07-14

## Impactos

Cria `packages/kernel/` com 20 subpastas, cada uma com `README.md`; 3 delas (`identity`, `event-bus`, `audit`) recebem também `CONTRACT.md` como referência de padrão para as demais. Cria `knowledge/core/objects/User.md`, `Role.md` e `Permission.md` (parciais) como pré-requisito de `BOM.md § 1`. Nenhum módulo de negócio (CRM, Leads, Clientes) é afetado.

## Plano de Migração

Não aplicável — não há Kernel implementado anteriormente para migrar. Plano de implementação por fases (A a G) documentado em `packages/kernel/README.md`.

## Status

Aceito
