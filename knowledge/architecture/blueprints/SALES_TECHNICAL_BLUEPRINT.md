# Sales — Technical Blueprint

Versão: 1.0.0

Status: 🟢 Blueprint concluído — Fase 1 (Domain Definition) de `KERNEL_DOMAIN_LIFECYCLE_V2.md` completa para `Sales`; aguardando Architecture Approval do CTO antes da Fase 2

Missão: ENG-0036 (Sales Technical Blueprint)

Escopo: consolidar `SALES_DOMAIN_DISCOVERY.md` (ENG-0032), `SALES_AGGREGATE_DESIGN.md` (ENG-0034), `ADR-0020` (ENG-0033) e `ADR-0021` (ENG-0035) num único documento de referência técnica, pronto para orientar a Fase 2 (`Aggregate & Contract Implementation`). Nenhuma regra de negócio nova é inventada; nenhuma decisão arquitetural aprovada é reaberta ou reinterpretada; nenhum código, classe, interface, contract ou schema é criado.

---

## 1. Purpose

Fornecer a especificação técnica única e implementation-ready do Business Domain `Sales`, traduzindo as decisões já aprovadas (`ADR-0019`–`ADR-0021`, `SALES_DOMAIN_DISCOVERY.md`, `SALES_AGGREGATE_DESIGN.md`) em orientação concreta de estrutura de pastas, Aggregates, Repository conceituais, Commands/Domain Events candidatos e ordem de implementação — sem resolver nenhuma pergunta ainda em aberto e sem redefinir nenhuma fronteira já congelada.

## 2. Domain Overview

**Responsibilities** (reproduzido de `DOMAIN_MODEL.md § SALES DOMAIN`, "Responsável por", sem alteração): Oportunidades, Pipelines, Etapas, Negociação, Propostas, Contratos, Receitas.

**Bounded Context**: `Sales` administra a negociação comercial desde a criação de uma oportunidade até seu fechamento (ganho, perdido, ou convertido em contrato), através de um fluxo configurável de etapas. Não possui identidade de cliente (`Customer`), dados de recebimento (`Financial`), nem tarefas/atividades (`Projects`/`Activity`) — apenas os referencia.

**Architectural position**: Business Domain confirmado, `🟡 Scaffolding` (`NOVARIS_PLATFORM_ARCHITECTURE.md`) — um dos 10 Business Domains ativos pós-`ENG-0028`. Compõe, junto de `Customer` e `Activity`, o produto `CRM` (`PRODUCT_DOMAIN_ARCHITECTURE.md § 4`) — `Sales` em si nunca é `CRM` (`ADR-0011`: `CRM` não é Business Domain).

## 3. Aggregate Structure

Usando exclusivamente decisões já aprovadas (`SALES_AGGREGATE_DESIGN.md`, `ADR-0021`):

### Aggregate Roots
- **`Opportunity`** — Aggregate Root transacional. Candidato mais forte do domínio (`SALES_AGGREGATE_DESIGN.md § 1`).
- **`Pipeline`** — Aggregate Root de configuração ("Configuration Aggregate", `ADR-0021`), mesmo padrão estrutural de `Role`/`Identity`.

### Internal Entities
- **`Proposal`** — candidata a Internal Entity de `Opportunity` (`SALES_AGGREGATE_DESIGN.md § 4`).
- **`Stage`** — Internal Entity de `Pipeline`, não de `Opportunity` (`ADR-0021`).

### Value Objects
- **`Revenue`** — candidato a Value Object monetário, forma de campos não definida (`SALES_AGGREGATE_DESIGN.md § 5`).

### External References (by id only)
- `Party` → `Customer` (`Relationship`)
- `User` → `Identity`
- `organizationId` → `Organization`
- `Task` → `Projects` (`ADR-0016`)
- `Activity` → `Activity Domain`

### Needs Evidence (não classificados, não resolvidos por esta Blueprint)
- **`Quotation`** — conceito distinto de `Proposal` confirmado (`ADR-0020`), forma estrutural não definida.
- **`Contract`** — pode ser estado terminal do mesmo Aggregate `Opportunity` ou Aggregate/domínio subsequente — não determinado.

## 4. Folder Structure

Estrutura de implementação pretendida — **nenhuma pasta ou arquivo é criado por esta missão**, exemplo apenas, mesmo padrão já usado por `services/kernel/{identity,organizations,audit}/`:

```
services/domains/sales/
├── domain/
│   ├── aggregates/
│   │   ├── opportunity/
│   │   └── pipeline/
│   ├── entities/          (Proposal, Stage — se modelados como classes próprias)
│   ├── value-objects/     (Revenue)
│   └── repositories/      (interfaces conceituais, ver § 5)
├── application/
├── infrastructure/
├── contracts/
└── tests/
```

## 5. Repository Interfaces

Identificação conceitual apenas — **nenhum método é definido**, mesmo padrão já usado nas Repository Contract de `Identity`/`Organization`/`Audit` (zero método de conveniência, só o que `Repository<T>`/`ReadRepository<T>`/`WriteRepository<T>` do Shared Kernel já provê):

- **`OpportunityRepository`** — Repository conceitual do Aggregate Root `Opportunity`.
- **`PipelineRepository`** — Repository conceitual do Aggregate Root `Pipeline`.

## 6. Candidate Commands

Nomes apenas, sem payload (já listados em `SALES_AGGREGATE_DESIGN.md § 9`, reproduzidos sem alteração):

- `CreateOpportunity`
- `AdvanceOpportunityStage`
- `SubmitProposal`
- `ApproveProposal`
- `MarkOpportunityWon`
- `MarkOpportunityLost`

## 7. Candidate Domain Events

Nomes apenas, sem payload (já listados em `SALES_AGGREGATE_DESIGN.md § 10`, com nível de confiança original preservado):

- `OpportunityCreated` (confirmado em 3 fontes)
- `OpportunityWon` (confirmado em 3 fontes)
- `OpportunityLost` (2 de 3 fontes)
- `ProposalApproved` (1 de 3 fontes)

## 8. External Dependencies

| Domínio | Natureza da Referência |
|---|---|
| `Identity` | `UserId` — Open Host Service, referência por id |
| `Organization` | `organizationId` — raiz de referência universal, Open Host Service, referência por id |
| `Customer` (`Relationship`) | `Party` — referência por id (`Customer` ainda não implementado) |
| `Projects` | `Task` — referência por id (`ADR-0016`) |
| `Activity` | `Activity` — referência por id, candidata |

**Toda referência ocorre exclusivamente por id ou por contrato publicado — nunca por objeto embutido.** Nenhum Aggregate de `Sales` acessa tabela de outro domínio diretamente (`DOMAIN_MODEL.md § REGRAS`, já citada em toda Blueprint anterior desta engenharia).

## 9. Explicit Non-Responsibilities

`Sales` explicitamente **não possui**:
- **`Payment`** — pertence a `Financial` (`Revenue` é reconhecimento contábil, distinto de `Payment`, recebimento efetivo — `UBIQUITOUS_LANGUAGE.md § Domínio: Financial`).
- **`Invoice`** — pertence a `Financial`.
- **`Billing`** — pertence a `Financial`.
- **Customer lifecycle** — pertence a `Customer`/`Relationship` (`Party`, `Person`, `External Organization` — `ADR-0007`); `Sales` referencia `Party` por id, nunca o possui.
- **Authentication** — pertence a `Identity`.
- **Authorization** — pertence a `Identity`.

## 10. Implementation Constraints

Consolidação de todas as regras de ADRs congeladas relevantes a `Sales`:

- **`ADR-0019`**: nenhuma Infrastructure/Application antes do Domain Layer de `Sales` estar congelado; todo código segue `KERNEL_DOMAIN_LIFECYCLE_V2.md` integralmente; ARG (12 critérios, `ARCHITECTURE_REVIEW_GATE_STANDARD.md`) obrigatório em toda missão de implementação.
- **`ADR-0011`**: `CRM` não é Business Domain — nenhum código de `Sales` deve referenciar ou depender de um "domínio CRM".
- **`ADR-0016`/`ADR-0017`**: `Task` pertence a `Projects`; `Sales` o referencia por id; o termo "Task" nunca deve ser reutilizado dentro de `Sales` para outro conceito, sob risco de recriar a ambiguidade já resolvida.
- **`ADR-0020`**: `Quotation` é conceito distinto de `Proposal` — implementação futura não pode tratá-los como sinônimos nem fundi-los sem nova decisão.
- **`ADR-0021`**: `Pipeline` é Aggregate Root próprio, nunca Entity interna de `Opportunity`; `Stage` é Entity interna de `Pipeline`, nunca de `Opportunity`; nenhuma implementação pode embutir `Pipeline`/`Stage` dentro do Aggregate `Opportunity`.
- **Princípios gerais** (`ARCHITECTURE_GOVERNANCE.md`, `KERNEL_DOMAIN_LIFECYCLE_V2.md § 2`): Architecture First, Shared Kernel First, No Infrastructure Before Domain, No Hidden Decisions, Traceability First — aplicam-se sem exceção à implementação futura de `Sales`.

## 11. Traceability Matrix

| Decisão Consolidada | Fonte Formal |
|---|---|
| `Sales` é Business Domain ativo | `DOMAIN_MODEL.md § SALES DOMAIN`; `NOVARIS_PLATFORM_ARCHITECTURE.md § 7` |
| `Opportunity` é Aggregate Root | `SALES_AGGREGATE_DESIGN.md § 1`; `AGGREGATE_DISCOVERY.md § Sales` (ENG-0013) |
| `Pipeline` é Aggregate Root (Configuration) | `ADR-0021` |
| `Stage` é Internal Entity de `Pipeline` | `ADR-0021` |
| `Proposal` é candidata a Internal Entity de `Opportunity` | `SALES_AGGREGATE_DESIGN.md § 4` |
| `Revenue` é candidato a Value Object | `SALES_AGGREGATE_DESIGN.md § 5` |
| `Quotation` é conceito distinto de `Proposal`, Owner `Sales` | `ADR-0020` |
| Referência externa só por id | `DOMAIN_MODEL.md § REGRAS`; `CONTEXT_RELATIONSHIPS.md § 5` |
| `CRM` não é Business Domain | `ADR-0011` |
| `Task` pertence a `Projects`, referenciado por `Sales` por id | `ADR-0016` |
| Arquitetura macro congelada, implementação autorizada | `ADR-0019` |
| Método de Discovery aplicado (6 critérios) | `SALES_DOMAIN_DISCOVERY.md` (ENG-0032) |

## 12. Future Implementation Order

Recomendado, seguindo `KERNEL_DOMAIN_LIFECYCLE_V2.md § 5` (Fase 2 em diante):

```
Domain (Aggregates Opportunity/Pipeline, Entities Proposal/Stage, VO Revenue)
  ↓
Application (Commands/Domain Services, se identificados)
  ↓
Infrastructure (Repository concreto, Mapper, Migration — só após Persistence & Mapper Blueprint, Fase 3)
  ↓
Contracts (Repository Contract Tests, API pública)
  ↓
Tests (unitários do Aggregate, integração de Repository)
```

Nenhuma fase começa antes da anterior estar completa e aprovada (Self Review + ACR + ARG), mesmo padrão já usado por `Identity`/`Organization`/`Audit`.

## 13. Open Questions

Reproduzidas de `SALES_AGGREGATE_DESIGN.md § 13`, sem nenhuma nova pergunta inventada:

- Forma exata de `Quotation` — Entity, Value Object, ou documento externo (`ADR-0020`, não resolvido).
- Se `Contract` é estado terminal do mesmo Aggregate `Opportunity` ou um Aggregate/domínio subsequente.
- Tabela completa de transições de `Stage` dentro de um `Pipeline`.
- Mecanismo exato de geração de `Contract`/reconhecimento de `Revenue` no fechamento de uma `Opportunity`.
- Forma de campos de `Revenue` (moeda, precisão).
- Mecanismo exato de criação/edição de `Pipeline` (quem pode, quando).
- Payload de qualquer Domain Event candidato (§ 7) — pendência de plataforma (`ADR-0019 § Evidence`), não específica de `Sales`.

---

## Validações

- **Link Checker** (`-Root` explícito): ver ENG-0036 FINAL REPORT.
- **Cross-reference validation contra ADRs**: toda afirmação desta Blueprint cita `ADR-0019`/`ADR-0020`/`ADR-0021`/`ADR-0011`/`ADR-0016`/`ADR-0017` ou os documentos de Discovery/Aggregate Design — nenhuma decisão nova introduzida, nenhuma decisão existente reinterpretada.
- **KERNEL_DOMAIN_LIFECYCLE_V2 compliance**: esta Blueprint corresponde exatamente ao artefato "Technical Blueprint" da Fase 1 (`§ 5`, tabela de artefatos obrigatórios) — não avança para nenhum artefato de Fase 2 (Aggregate/Repository/Mapper/teste reais).
- **ARG (ENS-0002)**: N/A nos critérios de código — missão de consolidação documental, sem implementação.
- **Domain Model Validation**: nenhuma Entity/Aggregate/Value Object/Domain Event real criado; `DOMAIN_MODEL.md` não alterado; nenhum ADR aprovado modificado.

## Relação com Outros Módulos

- [knowledge/architecture/analysis/SALES_DOMAIN_DISCOVERY.md](../analysis/SALES_DOMAIN_DISCOVERY.md) (ENG-0032)
- [knowledge/architecture/analysis/SALES_AGGREGATE_DESIGN.md](../analysis/SALES_AGGREGATE_DESIGN.md) (ENG-0034, atualizado ENG-0035)
- [adr/ADR-0019-architecture-freeze.md](../../../adr/ADR-0019-architecture-freeze.md), [ADR-0020](../../../adr/ADR-0020-sales-quotation-position.md), [ADR-0021](../../../adr/ADR-0021-pipeline-nature.md)
- [knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md § 5](../../engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md) — artefatos obrigatórios da Fase 1
- [services/kernel/organizations/ORGANIZATION_TECHNICAL_BLUEPRINT.md](../../../services/kernel/organizations/ORGANIZATION_TECHNICAL_BLUEPRINT.md) — precedente estrutural de rigor seguido

## Status

🟢 Blueprint concluído (Missão ENG-0036). Nenhum código, classe, interface, repository, API, contract ou schema criado. Fase 1 de `KERNEL_DOMAIN_LIFECYCLE_V2.md` completa para `Sales` — aguardando Architecture Approval do CTO antes de qualquer missão de Fase 2.
