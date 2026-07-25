# ADR-0006 - Monorepo Structure Decision

> ⚠️ **Amendado por [ADR-0007](ADR-0007-domain-boundaries.md)** (Missão ENG-0000.2, 2026-07-14): `services/domains/growth/`, criado por este ADR, foi removido — não era um bounded context real, era Product Layer. `customer/`, `marketing/`, `analytics/` foram adicionados. A decisão de separar Kernel de Domains e criar `packages/contracts/` (o núcleo deste ADR) continua vigente, sem alteração.

## Problema

`ENG-0000` criou o Kernel e os domínios de negócio no mesmo nível conceitual (`services/<modulo>/`, todos irmãos), sem separação explícita entre infraestrutura compartilhada e lógica de negócio. A "Ordem de Missão ENG-0000.1" (correção pós-aprovação de ENG-0000) pede separação clara entre Kernel e Business Domains, mais uma camada formal de contratos entre eles, mais estrutura inicial de IA.

## Contexto

`SYSTEM_ARCHITECTURE.md § 3` já definia Kernel (Layer 1) como camada abaixo de Business Domains (Layer 2) — arquitetura em camadas, não pastas irmãs. A estrutura plana de `ENG-0000` não refletia essa separação no sistema de arquivos, embora respeitasse a regra de acesso só via interface pública.

## Alternativas

1. **Manter `services/<modulo>/` plano** — rejeitada; não reflete a separação de camadas já declarada em `SYSTEM_ARCHITECTURE.md § 3`, e a ordem de missão pede explicitamente a separação.
2. **Kernel e Domains em pastas de topo separadas** (`kernel/` e `domains/` na raiz, não dentro de `services/`) — rejeitada; a ordem de missão pede ambos dentro de `services/`.
3. **`services/kernel/` e `services/domains/`, com `packages/contracts/` para a comunicação entre eles** — escolhida, conforme a estrutura pedida pela ordem de missão.

## Escolha

- `services/kernel/<modulo>/` — os 20 módulos já existentes de `ENG-0000`, movidos sem alteração de conteúdo.
- `services/domains/<dominio>/` — domínios de negócio, começando com `sales/`, `growth/`, `financial/`, `projects/` (4 dos 13 domínios de `DOMAIN_MODEL.md`; ver nota de nomenclatura em `services/domains/README.md` — `growth` não é um domínio de `DOMAIN_MODEL.md`, é nomeado assim pela própria ordem de missão).
- `packages/contracts/{events,api,schemas}/` — camada de contrato obrigatória entre Kernel e Domains.
- `packages/ai/{agents,prompts,tools,memory}/` — estrutura inicial de IA, sem funcionalidade.

## Consequências

Positivas: a árvore de arquivos passa a refletir a separação em camadas já declarada em `SYSTEM_ARCHITECTURE.md § 3`; a existência formal de `packages/contracts/` torna explícito (não apenas por convenção) que nenhum domínio acessa o Kernel diretamente.

Negativas: todo link relativo para `services/<modulo>/` (criados em `ENG-0000`, com um nível a menos de profundidade) precisou ser corrigido para `services/kernel/<modulo>/` — feito nesta mesma missão. `services/domains/` cobre só 4 de 13 domínios; os outros 9 não têm pasta ainda — não é omissão, é escopo explícito da ordem de missão ("Executar somente as correções abaixo").

## Responsável

Decisão de arquitetura: usuário (Ordem de Missão ENG-0000.1, "Correction Mission" sobre ENG-0000 já aprovada). Execução: Engenheiro Principal.

## Data

2026-07-14

## Impactos

`services/README.md` (antigo índice do Kernel) virou `services/kernel/README.md`; `services/README.md` passou a indexar `kernel/` e `domains/`. Toda referência cruzada em `PROJECT_RULES.md`, `knowledge/core/README.md`, `CHANGELOG.md`, `adr/README.md`, Object Specifications (`User.md`, `Role.md`, `Permission.md`) e os documentos ARCH-002 a ARCH-005 (`DATABASE_ARCHITECTURE.md`, `CANONICAL_DATA_MODEL.md`, `IMPLEMENTATION_ROADMAP.md`, `UBIQUITOUS_LANGUAGE.md`) que apontavam para `services/<modulo>/` foi corrigida para `services/kernel/<modulo>/`.

## Plano de Migração

Mover cada `services/<modulo>/` para `services/kernel/<modulo>/` preservando conteúdo; ajustar profundidade de link relativo (mesma técnica já usada em toda a sessão); criar `services/domains/`, `packages/contracts/`, `packages/ai/` do zero; corrigir referências cruzadas conhecidas.

## Status

Aceito
