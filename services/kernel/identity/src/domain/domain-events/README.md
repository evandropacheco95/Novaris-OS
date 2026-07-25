# domain-events

Domain Events concretos do Identity Domain, todos implementando o contrato `DomainEvent` do Shared Kernel (`@novaris/shared-kernel`, ENG-0001.5). Nome da pasta espelha `packages/shared-kernel/src/core/domain-events/` — mesma convenção de bloco da Domain Layer ([ENGINEERING_PLAYBOOK.md § 3](../../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer)).

## Conteúdo

Eventos de `User` e `Role`, listados em [IDENTITY_TECHNICAL_BLUEPRINT.md § 7](../../../IDENTITY_TECHNICAL_BLUEPRINT.md) e [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 12](../../../IDENTITY_AGGREGATE_DESIGN_FREEZE.md):

- [user-created.ts](user-created.ts), [user-invited.ts](user-invited.ts), [user-activated.ts](user-activated.ts), [user-disabled.ts](user-disabled.ts) — já oficiais (`BOM.md`). (Missão ENG-0002.7)
- [role-assigned-to-user.ts](role-assigned-to-user.ts), [role-revoked-from-user.ts](role-revoked-from-user.ts) — propostos em `IDENTITY_DOMAIN_MODEL.md § 7`; tecnicamente eventos do Aggregate `User` (Freeze § 12, nota de rodapé) — `aggregateId` é sempre o `id` do `User`. Disparados por `User.assignRole`/`User.revokeRole`. (Missão ENG-0002.7)
- [role-created.ts](role-created.ts), [permission-granted-to-role.ts](permission-granted-to-role.ts), [permission-revoked-from-role.ts](permission-revoked-from-role.ts) — propostos em `IDENTITY_DOMAIN_MODEL.md § 7`; eventos do Aggregate `Role` — `aggregateId` é sempre o `id` do `Role`. Disparados por `Role.create`/`Role.grantPermission`/`Role.revokePermission`. (Missão ENG-0002.8)

Cada classe implementa só o contrato `DomainEvent` (`eventId`, `aggregateId`, `occurredAt`, `eventName`) — nenhum campo de payload adicional foi definido por nenhuma fonte oficial; formato de payload de evento é `requer decisão` (mesma categoria de pendência já registrada para `packages/contracts/events/`, [ENGINEERING_PLAYBOOK.md § 7](../../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#7-contracts)).

Todos os 9 Domain Events do Identity Domain listados em `IDENTITY_TECHNICAL_BLUEPRINT.md § 7` / `IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 12` estão implementados.

## Status

🟢 9 Domain Events implementados — 6 de `User` (ENG-0002.7), 3 de `Role` (ENG-0002.8). Nenhum Event Bus, publisher ou infraestrutura — só o contrato de dado, armazenado por `AggregateRoot.addDomainEvent`.
