# domain-events

Domain Events concretos do Organization Domain, implementando o contrato `DomainEvent` do Shared Kernel (`@novaris/shared-kernel`, ENG-0001.5).

## Conteúdo (Missão ENG-0003.7)

- [organization-created.ts](organization-created.ts) — `OrganizationCreated`, único evento definitivo ([ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 9](../../../ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md)) — confirmado simultaneamente em `BOM.md`, `objects/Organization.md` e `DOMAIN_MODEL.md § EVENT BUS`.

`OrganizationUpdated`, `OrganizationActivated`, `OrganizationSuspended`, `OrganizationPlanChanged`, `OrganizationBillingFailed`, `OrganizationArchived`, `OrganizationDeleted` — candidatos, não implementados; lista canônica não resolvida ([ORGANIZATION_TECHNICAL_BLUEPRINT.md § 6](../../../ORGANIZATION_TECHNICAL_BLUEPRINT.md)).

## Status

🟢 1 Domain Event implementado (Missão ENG-0003.7). Nenhum Event Bus ou publisher — só o contrato de dado.
