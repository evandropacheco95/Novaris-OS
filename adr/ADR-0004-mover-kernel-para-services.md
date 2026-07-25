# ADR-0004 - Mover o Kernel de packages/kernel/ para services/

## Problema

`ADR-0003` decidiu construir o Kernel (Identity, Organizations, Users, Roles, Permissions, Audit, Configuration, Feature Flags, Storage, Files, Notifications, Logging, Event Bus, Search, AI Runtime, Automation Runtime, Scheduler, Realtime, Monitoring, Integration Hub) em `packages/kernel/<modulo>/`. A "Ordem de Missão ENG-0000" (Épico 001 — Foundation Engineering) pede explicitamente que esses mesmos módulos vivam sob `/services/<modulo>/`.

## Contexto

`packages/` foi definida (`ADR-0002`) como "código compartilhado — nunca deployado sozinho"; `services/` como "serviços de backend com deploy próprio (workers, processos de background)". A escolha original (`ADR-0003`) partiu da leitura de que o Kernel era só biblioteca compartilhada. ENG-0000, ao adotar NestJS como framework de backend (ver `ADR-0005`), trata cada módulo de Kernel como um serviço NestJS com ciclo de vida e deploy próprios — o que corresponde à definição de `services/`, não `packages/`.

## Alternativas

1. Manter `packages/kernel/` (status quo do `ADR-0003`) — rejeitada; contraria a instrução explícita de ENG-0000 e a decisão do usuário ao ser consultado.
2. Híbrido — `packages/kernel/` para lógica compartilhada, `services/` como wrappers finos de deploy — rejeitada; complexidade sem justificativa registrada, também rejeitada explicitamente pelo usuário ao ser consultado.
3. **Mover para `services/`** — escolhida.

## Escolha

Os 20 módulos de Kernel passam a viver em `services/<modulo>/`, mantendo a mesma estrutura interna (`README.md`, `CONTRACT.md`) já escrita.

## Consequências

Positivas: alinha a localização do Kernel com o fato de cada módulo ser, na prática, um serviço NestJS deployável, consistente com `ADR-0005`. Negativas: todo link relativo para `packages/kernel/` em `PROJECT_RULES.md`, `knowledge/core/README.md`, `CHANGELOG.md` e nas Object Specifications (`User.md`, `Role.md`, `Permission.md`) precisa ser corrigido — feito nesta mesma missão (ENG-0000).

## Responsável

Decisão de arquitetura: usuário (consultado via pergunta direta antes desta missão). Execução: Engenheiro Principal, sob [.claude/rules.md](../.claude/rules.md) e [.command-center/EXECUTION_PROTOCOL.md](../.command-center/EXECUTION_PROTOCOL.md).

## Data

2026-07-14

## Impactos

`packages/kernel/` deixa de existir. `services/` passa a ter 20 subpastas. Nenhum código de funcionalidade de negócio é afetado — só reorganização do Kernel, ainda sem implementação real além de `README.md`/`CONTRACT.md`.

## Plano de Migração

Mover cada `packages/kernel/<modulo>/` para `services/<modulo>/` preservando conteúdo; corrigir profundidade de link relativo (mesma técnica já usada nesta sessão); corrigir as 4 referências cruzadas conhecidas.

## Status

Aceito — supersede `ADR-0003`.
