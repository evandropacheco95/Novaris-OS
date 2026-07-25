# customer

## Objetivo

Domínio Customer — bounded context para pessoas e empresas com quem a NOVARIS se relaciona (equivalente a Relationship Domain em DOMAIN_MODEL.md).

## Escopo

**Segundo domínio de negócio implementado de ponta a ponta (`ENG-0125`)**, seguindo exatamente a mesma receita já provada em Sales (`ENG-0120`-`0124`): Domain (`Party`/`Relationship`, Aggregate Roots irmãos, `RELATIONSHIP_AGGREGATE_DESIGN.md`) → Application (`CreatePartyHandler`/`CreateRelationshipHandler`) → Infrastructure (Prisma real, tabelas `parties`/`relationships`) → API (`apps/api`, `CustomerModule`) → Frontend (`apps/web`, `/customer`).

`Party` ganhou campos mínimos de conteúdo (`name`, `document`) via [ADR-0025](../../../adr/ADR-0025-party-minimum-fields.md) — sem isso, o Aggregate não teria nenhum campo exibível. `Contact`/`Address`/`Phone`/`Email`/`Social Profile` permanecem bloqueados (sem entrada em `BOM.md`).

## Objetos Relacionados (BOM)

Party, Person, External Organization, Relationship — ver [UBIQUITOUS_LANGUAGE.md](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md).

## Relação com Outros Módulos

- [services/kernel/](../../kernel/README.md) — infraestrutura consumida via [packages/contracts/](../../../packages/contracts/README.md)
- [adr/ADR-0007](../../../adr/ADR-0007-domain-boundaries.md) — decisão de criar este bounded context e a distinção entre Product Layer e Domain Layer
- [adr/ADR-0025](../../../adr/ADR-0025-party-minimum-fields.md) — campos mínimos de `Party`
- [knowledge/architecture/analysis/RELATIONSHIP_AGGREGATE_DESIGN.md](../../../knowledge/architecture/analysis/RELATIONSHIP_AGGREGATE_DESIGN.md) — Aggregate Design (`ENG-0119`)
- [knowledge/architecture/blueprints/CUSTOMER_TECHNICAL_BLUEPRINT.md](../../../knowledge/architecture/blueprints/CUSTOMER_TECHNICAL_BLUEPRINT.md) — Technical Blueprint (`ENG-0125`)

## Status

🟢 Domain/Application/Infrastructure/API/Frontend completos e testados contra Postgres real (Supabase). 13 testes unitários de Domain Layer, todos passando.
