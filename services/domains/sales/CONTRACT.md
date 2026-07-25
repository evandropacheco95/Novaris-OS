# sales — CONTRACT

Versão: 1.0.0

Status: 🚧 Fronteira pública documentada — nenhuma API, payload ou implementação real ainda

Missão: ENG-0037 (Sales Domain Skeleton)

Escopo: descrever a fronteira pública do Bounded Context `Sales`, suas regras de dependência e ownership, consolidadas de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md), [`ADR-0019`](../../../adr/ADR-0019-architecture-freeze.md), [`ADR-0020`](../../../adr/ADR-0020-sales-quotation-position.md), [`ADR-0021`](../../../adr/ADR-0021-pipeline-nature.md). Nenhuma definição de API ou payload de evento é feita aqui — apenas a fronteira conceitual.

## Public Boundary

`Sales` expõe, conceitualmente, dois Aggregate Roots — `Opportunity` (transacional) e `Pipeline` (configuração) — cada um acessível externamente apenas por seu id. Nenhum campo interno de `Opportunity`/`Pipeline` é exposto diretamente; todo acesso externo ocorre via Repository Contract (a ser definido em fase de implementação, `Fase 2`) ou via Domain Events publicados.

## Dependency Rules

- `Sales` depende de `Identity` e `Organization` como Open Host Services (`UserId`, `organizationId`) — referência por id, sem exceção.
- `Sales` depende de `Customer`/`Relationship` (`Party`) — referência por id; `Customer` ainda não implementado.
- `Sales` depende de `Projects` (`Task`, [`ADR-0016`](../../../adr/ADR-0016-task-ownership.md)) e, candidamente, de `Activity` (`Activity`) — referência por id.
- Nenhum domínio consumidor pode embutir ou reescrever um Aggregate de `Sales` — só referenciar por id ou reagir a um evento publicado.
- `Sales` nunca acessa tabela de outro domínio diretamente (`DOMAIN_MODEL.md § REGRAS`).

## Ownership Rules

| Conceito | Owner | Fonte |
|---|---|---|
| `Opportunity` | `Sales` | `DOMAIN_MODEL.md`; `SALES_AGGREGATE_DESIGN.md § 1` |
| `Pipeline` | `Sales` (Configuration Aggregate) | `ADR-0021` |
| `Stage` | `Sales`, interno a `Pipeline` | `ADR-0021` |
| `Proposal` | `Sales`, candidato interno a `Opportunity` | `SALES_AGGREGATE_DESIGN.md § 4` |
| `Quotation` | `Sales`, forma não definida | `ADR-0020` |
| `Contract` | `Sales`, forma não definida (`Needs Evidence`) | `SALES_AGGREGATE_DESIGN.md § 3` |
| `Revenue` | `Sales`, candidato a Value Object | `SALES_AGGREGATE_DESIGN.md § 5` |

## References by ID Only

Toda referência de `Sales` a outro domínio, e de outro domínio a `Sales`, ocorre exclusivamente por id (`UniqueEntityId` ou equivalente) — nunca por objeto embutido. Nenhuma exceção documentada.

## Events Ownership

`Sales` é o único publicador autorizado de eventos originados de `Opportunity`/`Pipeline`/`Proposal`. Nomes candidatos (sem payload, `SALES_TECHNICAL_BLUEPRINT.md § 7`): `OpportunityCreated`, `OpportunityWon`, `OpportunityLost`, `ProposalApproved`. Nenhum outro domínio pode publicar eventos em nome de `Sales`.

## Aggregate Ownership

`Opportunity` e `Pipeline` são os únicos Aggregate Roots de `Sales` — nenhum outro objeto listado acima (`Stage`, `Proposal`, `Quotation`, `Contract`, `Revenue`) pode ser tratado como Aggregate Root independente sem uma nova ADR que revise `ADR-0021`/`SALES_AGGREGATE_DESIGN.md`.

## Status

🟡 Fronteira documentada (Missão ENG-0037) — corrigido em `ENG-0058`, achado registrado em `SALES_DOMAIN_COMPLETION_AUDIT.md § 8`. Os dois Aggregate Roots (`Opportunity`, `Pipeline`) e suas Internal Entities estão implementados e testados desde `ENG-0039`–`ENG-0056`; ainda nenhuma API pública, payload de evento ou schema real implementado (`contracts/` permanece vazio).
