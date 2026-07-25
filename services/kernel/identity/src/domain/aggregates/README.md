# aggregates

Aggregate Roots do domínio Identity, previstos em [IDENTITY_TECHNICAL_BLUEPRINT.md § 1](../../../IDENTITY_TECHNICAL_BLUEPRINT.md) e congelados em [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](../../../IDENTITY_AGGREGATE_DESIGN_FREEZE.md). Segue [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001).

## Conteúdo

- [user/](user/README.md) — `User`: `extends AggregateRoot<UserProps>`, `implements Auditable, Versionable, HasMetadata<UserMetadata>` (Missão ENG-0002.7).
- [role/](role/README.md) — `Role`: `extends AggregateRoot<RoleProps>`, `implements Auditable, Versionable` (Missão ENG-0002.8), mesmo padrão estrutural de `user/`.

Os 2 Aggregate Roots do Identity Domain (`IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 1`) estão implementados.

## Status

🟢 `user/` (Missão ENG-0002.7) e `role/` (Missão ENG-0002.8) implementados e testados.
