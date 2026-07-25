# Contracts

## Objetivo

Camada oficial de contratos para comunicação entre `services/kernel/` e `services/domains/` — nenhum serviço se comunica com outro sem passar por um contrato definido aqui ([ADR-0006](../../adr/ADR-0006-monorepo-structure-decision.md), Missão ENG-0000.1).

## Conteúdo

- [events/](events/README.md) — contratos de eventos de domínio (payload, nome, versão)
- [api/](api/README.md) — contratos de API entre services (request/response)
- [schemas/](schemas/README.md) — schemas de validação compartilhados (ex.: Zod/JSON Schema — ferramenta ainda `TODO`)

## Relação com Outros Módulos

- [services/kernel/](../../services/kernel/README.md), [services/domains/](../../services/domains/README.md) — consumidores desta camada
- [packages/types/](../types/README.md) — tipos TypeScript gerados a partir destes contratos
- [knowledge/core/BOM.md](../../knowledge/core/BOM.md) — eventos já nomeados oficialmente (ex.: `OrganizationCreated`) devem ter contrato correspondente aqui antes de qualquer implementação real

## Status

🟡 Estrutura criada (Missão ENG-0000.1). `events/` ganhou seu primeiro contrato real (`user-created.md`, `ENG-0139`/`ADR-0037`) — `api/`/`schemas/` seguem vazios.
