# aggregates

Aggregate Roots do Organization Domain, congelados em [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](../../../ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md), assinatura técnica em [ORGANIZATION_TECHNICAL_BLUEPRINT.md](../../../ORGANIZATION_TECHNICAL_BLUEPRINT.md). Segue [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001).

## Conteúdo (Missão ENG-0003.7)

- [organization/](organization/README.md) — `Organization`: `extends AggregateRoot<OrganizationProps>`, `implements Timestamped, HasMetadata<OrganizationMetadata>`.

`Workspace`, `Team`, `Subscription` — candidatos a Aggregate Root próprio ([ORGANIZATION_DOMAIN_DECISIONS.md](../../../ORGANIZATION_DOMAIN_DECISIONS.md), `DEC-ORG-002`/`003`/`004`) — não implementados, sem Object Specification própria ainda.

## Status

🟢 `organization/` implementado e testado (Missão ENG-0003.7).
