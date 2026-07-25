# Customer (Relationship) — Technical Blueprint

Versão: 1.0.0

Status: 🟢 Blueprint concluído — consolida `RELATIONSHIP_AGGREGATE_DESIGN.md` (`ENG-0119`) e `ADR-0025` para orientar a implementação real (`ENG-0125`)

Missão: ENG-0125 (Customer Domain — Implementação de ponta a ponta, seguindo a mesma receita já provada em Sales: Domain → Application → Infrastructure → API → Frontend)

Escopo: mesmo padrão de `SALES_TECHNICAL_BLUEPRINT.md` (ENG-0036), porém condensado — a maior parte das decisões já está consolidada em `RELATIONSHIP_AGGREGATE_DESIGN.md`; este documento adiciona apenas o que falta para implementação (estrutura de pastas, Repository conceitual, Commands candidatos) e incorpora `ADR-0025` (campos mínimos de `Party`).

---

## 1. Domain Overview

**Responsibilities** (`DOMAIN_MODEL.md § RELATIONSHIP DOMAIN`): Relacionamentos, Contatos, Interações.

**Bounded Context**: Customer administra a identidade de toda entidade externa (pessoa ou organização) com quem a NOVARIS se relaciona, e o vínculo de negócio entre essas entidades — não possui negociação comercial (`Sales`), dados financeiros (`Financial`) nem tarefas (`Project`/`Activity`), apenas é referenciado por eles (`Opportunity.partyId`, já implementado).

**Architectural position**: Business Domain confirmado, um dos 10 ativos (`DOMAIN_MODEL.md`). Pasta real: `services/domains/customer/` (nome já fixado por `ADR-0007`, equivalente a "Relationship" em `DOMAIN_MODEL.md`).

## 2. Aggregate Structure

### Aggregate Roots
- **`Party`** — pessoa física ou organização externa (discriminado por `partyType`). Campos: `organizationId`, `partyType: "person" | "external_organization"`, `name` (`ADR-0025`), `document?` (`ADR-0025`), `createdAt`/`updatedAt`. Sem Domain Event (`PartyCreated` não confirmado, `RELATIONSHIP_AGGREGATE_DESIGN.md § 7`).
- **`Relationship`** — vínculo entre dois `Party`. Campos: `organizationId`, `partyIdA`/`partyIdB` (`UniqueEntityId`), `type: "cliente" | "fornecedor" | "parceiro" | "prospect" | "investidor" | "colaborador"`, `createdAt`/`updatedAt`. Dispara `RelationshipCreated` (confirmado, `DOMAIN_MODEL.md § EVENT BUS`).

Aggregates irmãos, nunca aninhados — `Relationship` referencia `Party` só por id (`RELATIONSHIP_AGGREGATE_DESIGN.md § 8`).

### Internal Entities / Value Objects
Nenhum — `Contact`/`Address`/`Phone`/`Email`/`Social Profile` permanecem bloqueados (sem entrada em `BOM.md`, não estendidos por `ADR-0025`, que cobriu apenas `Party.name`/`Party.document`).

### Invariante implementada
`Relationship.create()` rejeita `partyIdA === partyIdB` (`RELATIONSHIP_AGGREGATE_DESIGN.md § 9`, única invariante candidata promovida a implementação — mínima, estrutural, mesmo padrão de unicidade já usado em `Pipeline.addStage()`).

## 3. Folder Structure

Mesmo padrão de `services/domains/sales/`:

```
services/domains/customer/
├── domain/
│   ├── aggregates/
│   │   ├── party/
│   │   └── relationship/
│   ├── repositories/
│   └── events/
├── application/
│   ├── commands/
│   └── handlers/
├── infrastructure/
│   ├── mappers/
│   └── repositories/
├── contracts/
├── src/
└── tests/
```

## 4. Repository Interfaces

Conceitual, zero método de conveniência (mesmo padrão de `OpportunityRepository`):
- **`PartyRepository`** — `ReadRepository<Party> & WriteRepository<Party>`.
- **`RelationshipRepository`** — `ReadRepository<Relationship> & WriteRepository<Relationship>`.

## 5. Candidate Commands

- `CreateParty` (`partyType`, `name`, `document?`, `organizationId`)
- `CreateRelationship` (`partyIdA`, `partyIdB`, `type`, `organizationId`)

Sem comandos de edição/remoção nesta primeira fatia — mesma disciplina de escopo mínimo já aplicada à primeira fatia de Sales (`CreateOpportunity` antes dos demais 5 casos de uso).

## 6. External Dependencies

| Domínio | Natureza da Referência |
|---|---|
| `Organization` | `organizationId` — referência por id |
| `Sales` | `Opportunity.partyId` já referencia `Party` por id (implementado, `ENG-0049`) — nenhuma mudança em `Sales` por esta missão |

## 7. Explicit Non-Responsibilities

Customer explicitamente **não possui**: negociação (`Sales`), dados financeiros (`Financial`), autenticação (`Identity`) — mesma disciplina de exclusão já aplicada a todo Blueprint anterior.

## 8. Implementation Order

Idêntica à já provada em Sales (`ENG-0120`-`0124`):

```
Domain (Party, Relationship, Repositories, testes unitários)
  ↓
Application (CreatePartyCommand/Handler, CreateRelationshipCommand/Handler)
  ↓
Infrastructure (Prisma models, Mappers, Repository concreto, Migration real contra Supabase)
  ↓
API (PartyController/RelationshipController em apps/api, protegidos por JwtAuthGuard)
  ↓
Frontend (tela de Customer em apps/web, substitui a tag "em breve" na sidebar)
```

## 9. Open Questions (herdadas, não resolvidas por este Blueprint)

- `Contact`/`Address`/`Phone`/`Email`/`Social Profile` — bloqueados, requerem extensão própria de `BOM.md`.
- Nomenclatura definitiva de `partyIdA`/`partyIdB` (`RELATIONSHIP_AGGREGATE_DESIGN.md § 5`) — mantida como está, sem nova evidência para renomear.
- `Relationship.status` — não implementado, `Needs Evidence`.

---

## Relação com Outros Módulos

- [RELATIONSHIP_AGGREGATE_DESIGN.md](../analysis/RELATIONSHIP_AGGREGATE_DESIGN.md) (`ENG-0119`)
- [ADR-0025](../../../adr/ADR-0025-party-minimum-fields.md)
- [SALES_TECHNICAL_BLUEPRINT.md](SALES_TECHNICAL_BLUEPRINT.md) — precedente estrutural direto

## Status

🟢 Blueprint concluído. Implementação real segue nesta mesma missão (`ENG-0125`).
