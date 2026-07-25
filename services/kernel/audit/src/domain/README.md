# domain

Domain Layer do serviço `audit` — Aggregates ([ENGINEERING_PLAYBOOK.md § 2-3](../../../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md)). Nunca importa de `infrastructure/` ou `interfaces/`.

## Conteúdo

- [aggregates/](aggregates/README.md) — `AuditEntry` (Missão ENG-0005.7)

`AuditRepository` (Repository Contract) ainda não implementado — nenhum método/assinatura foi congelado além de conceitos, e o Aggregate ainda não passou por essa missão ([AUDIT_TECHNICAL_BLUEPRINT.md § 5](../../AUDIT_TECHNICAL_BLUEPRINT.md)). Nenhum Value Object, Mapper ou Domain Event implementado — `Target`/`Actor` permanecem referências simples por `UniqueEntityId`, sem forma de Value Object definida (`AUDIT_AGGREGATE_DESIGN_FREEZE.md § 16`).

## Status

🟢 `aggregates/audit-entry/` implementado e testado (Missão ENG-0005.7).
