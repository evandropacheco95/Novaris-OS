# organization

`Organization` — Aggregate Root do Organization Domain.

## Conteúdo (Missão ENG-0003.7)

- [organization.ts](organization.ts) — `Organization extends AggregateRoot<OrganizationProps>`, `implements Timestamped, HasMetadata<OrganizationMetadata>` ([ORGANIZATION_TECHNICAL_BLUEPRINT.md § 3](../../../../ORGANIZATION_TECHNICAL_BLUEPRINT.md), congelado em [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](../../../../ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md)).
  - `static create(input: CreateOrganizationInput): Result<Organization, DomainError>` — dispara `OrganizationCreated`. `status` é entrada obrigatória, nunca um default do Aggregate (valor inicial não definido, [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16](../../../../ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md)).
  - `static reconstitute(props, id): Organization` — sem validação, sem eventos (ENS-0001 § 8).
  - `updateProfile(input)` — atualiza `name`/`legalName`/`document`/`address`; nunca dispara evento (só `OrganizationCreated` é aprovado).

## Escopo Desta Implementação

`OrganizationProps` é um subconjunto deliberado de `ORGANIZATION_TECHNICAL_BLUEPRINT.md § 3` — `branding`, `plan`, `billingStatus`, `trialEnd`, `maxUsers`, `maxStorage`, `storageUsed`, `featureFlags`, `settings` foram excluídos por não terem valor ou forma de criação definidos em nenhuma fonte (mesma categoria de lacuna do valor inicial de `status`). Sem `implements Auditable`/`Versionable` — nenhuma fonte cita `createdBy`/`updatedBy`/`version` para `Organization`, diferente de `User`/`Role`.

## Status

🟢 Implementado e testado (Missão ENG-0003.7). `changePlan`/`suspend`/`activate`/`archive` permanecem bloqueados ([ORGANIZATION_TECHNICAL_BLUEPRINT.md § 8](../../../../ORGANIZATION_TECHNICAL_BLUEPRINT.md)), não implementados.
