# domain

Domain Layer do serviço `organizations` — Aggregates, Domain Events ([ENGINEERING_PLAYBOOK.md § 2-3](../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md)). Nunca importa de `infrastructure/` ou `interfaces/`.

## Conteúdo

- [aggregates/](aggregates/README.md) — `Organization` (Missão ENG-0003.7)
- [domain-events/](domain-events/README.md) — `OrganizationCreated` (Missão ENG-0003.7)

`OrganizationRepository` (Repository Contract) e Value Objects (`Address`/`Document`/`Slug`/`BrandingTheme`) ainda não implementados — nenhum foi congelado o suficiente para código real ([ORGANIZATION_TECHNICAL_BLUEPRINT.md §§ 4-5](../../ORGANIZATION_TECHNICAL_BLUEPRINT.md)).

## Status

🟢 `aggregates/organization/` e `domain-events/` implementados (Missão ENG-0003.7).
