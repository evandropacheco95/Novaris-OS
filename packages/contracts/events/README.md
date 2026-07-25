# events

## Objetivo

Contratos de eventos de domínio: nome, payload, versão. Um arquivo por evento, espelhando os já nomeados em BOM.md/objects/.

## Escopo

Um arquivo por evento, à medida que uma integração real via Event Bus precisar dele — não escrito preventivamente para todo evento já nomeado em `BOM.md`/`objects/` (evitaria documentar payload de eventos que nenhum Subscriber real consome ainda).

## Contratos Escritos

- [user-created.md](user-created.md) — primeiro contrato real (`ENG-0139`, `ADR-0037`)

## Relação com Outros Módulos

- [packages/contracts/](../README.md) — pasta-pai
- [adr/ADR-0006](../../../adr/ADR-0006-monorepo-structure-decision.md) — decisão de criar esta camada
- [adr/ADR-0037](../../../adr/ADR-0037-event-bus-mechanism.md) — primeira implementação real do Event Bus que consome estes contratos

## Status

🟡 Estrutura criada (Missão ENG-0000.1), primeiro contrato real escrito (`ENG-0139`). Demais eventos já nomeados (`OrganizationCreated` etc.) seguem sem contrato — escritos quando ganharem uma integração real via Event Bus, mesmo critério que gerou `user-created.md`.
