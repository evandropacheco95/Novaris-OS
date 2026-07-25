# AdvanceOpportunityStage — Response Specification

Versão: 1.0.0

Status: 🟢 Especificação arquitetural congelada — nenhum código criado

Missão: ENG-0089 (AdvanceOpportunityStage Response Specification)

Escopo: congelar o payload público de `AdvanceOpportunityStageResponse` antes de sua implementação — mesmo processo já usado para `CreateOpportunityResponse` (`CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md`, `ENG-0080`). Esta missão **não implementa código, interface, classe, DTO, Contract, Controller, Endpoint, Mapper, Serializer, Presenter, Factory, teste, README, ADR, Blueprint, Package, Export ou Barrel**. Toda decisão de campo cita exclusivamente `opportunity.ts` (código real, já congelado), `SALES_CONTRACTS_LAYER_ARCHITECTURE.md` ou `SALES_CONTRACTS_FREEZE.md` — nenhum campo é inferido sem essa citação.

**Verify Before Reimplementing**: busca executada por "AdvanceOpportunityStage Response Specification", "ADVANCE_OPPORTUNITY_STAGE_RESPONSE_SPECIFICATION", "AdvanceOpportunityStageResponse", "advance-opportunity-stage.response" em todo o repositório — **0 ocorrências**. Nenhum documento equivalente existia — nenhuma duplicação.

---

## 1. Purpose

`AdvanceOpportunityStageResponse` é o payload público devolvido ao Cliente após a execução bem-sucedida do caso de uso `AdvanceOpportunityStage` — a tradução, na fronteira externa da Contracts Layer, do valor de sucesso de `Result<Opportunity, DomainError>` já devolvido por `AdvanceOpportunityStageHandler.execute()` (`ENG-0062`). Seu único propósito é comunicar ao Cliente o estado da `Opportunity` após a mudança de etapa, em particular sua nova `currentStageId`.

## 2. Architectural Context

Mesma posição já fixada em `SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 2`: `Cliente → API → Contracts (este documento) → Application (`AdvanceOpportunityStageHandler`, já congelado, `SALES_APPLICATION_FREEZE.md`) → Domain (`Opportunity.advanceStage()`, já congelado, `SALES_DOMAIN_COMPLETION_AUDIT.md`) → Repository → Infrastructure`.

## 3. Source of Truth

Toda decisão de campo desta especificação deriva exclusivamente de:
- `services/domains/sales/domain/aggregates/opportunity/opportunity.ts` — método `advanceStage(stageId: UniqueEntityId): Result<void, DomainError>` (mutação) e os getters públicos da classe (estado resultante).
- `markWon()` — citado apenas como precedente estrutural: mesma classe de mutação (altera um campo de `OpportunityProps`, retorna `Result<void, DomainError>`, e o Handler correspondente devolve o `Opportunity` inteiro, não um valor parcial) — não introduz nenhum campo novo a esta especificação.
- `OpportunityStatus` (`"open" | "won" | "lost"`) — tipo já congelado, reutilizado sem alteração.
- `SALES_CONTRACTS_LAYER_ARCHITECTURE.md §§ 4, 10, 13` — tipos de artefato autorizados, Response Pattern, uso do Shared Kernel.
- `SALES_CONTRACTS_FREEZE.md §§ 5-8` — DTO Freeze, Contracts Freeze, Rule Ownership Freeze, Shared Kernel Freeze.

## 4. Public Fields

`AdvanceOpportunityStageHandler.execute()` devolve `Result<Opportunity, DomainError>` — o **mesmo Aggregate inteiro**, não um valor parcial (`advance-opportunity-stage.handler.ts`: `return Result.ok(opportunity);`). Por isso, os campos públicos disponíveis são exatamente os mesmos getters já expostos por `Opportunity` (`opportunity.ts` linhas 273-299, mais `id`, herdado de `Entity`) — idênticos em identidade a `CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md § 3`, mas com obrigatoriedade reavaliada campo a campo para este caso de uso específico (§ 5-6).

| Campo | Tipo | Obrigatório/Opcional | Origem no Aggregate | Justificativa |
|---|---|---|---|---|
| `id` | `string` | Obrigatório | `Entity.id` (herdado) | Identidade da `Opportunity` — sem ele, nenhuma operação futura pode referenciá-la |
| `organizationId` | `string` | Obrigatório | `opportunity.ts` linha 273 | Sempre presente desde a criação (`CreateOpportunityInput`, obrigatório) — `advanceStage()` nunca o altera |
| `partyId` | `string` | Obrigatório | `opportunity.ts` linha 277 | Mesma justificativa de `organizationId` |
| `status` | `"open" \| "won" \| "lost"` | Obrigatório | `opportunity.ts` linha 289 | Sempre presente; `advanceStage()` **não altera** `status` — só é executável quando `status === "open"` (`opportunity.ts` linhas 167-169), e permanece `"open"` após a chamada |
| `createdAt` | `string` (ISO 8601) | Obrigatório | `opportunity.ts` linha 293 | Sempre presente desde a criação, imutável |
| `updatedAt` | `string` (ISO 8601) | Obrigatório | `opportunity.ts` linha 297 | `advanceStage()` sempre a atualiza (`opportunity.ts` linha 171, `this.props.updatedAt = new Date()`) — sempre presente e sempre alterado por esta operação |

## 5. Optional Fields

| Campo | Tipo | Origem | Justificativa |
|---|---|---|---|
| `pipelineId` | `string?` | `opportunity.ts` linha 281 | Opcional desde a criação (`CreateOpportunityInput`, `Needs Evidence` se deveria ser obrigatório — `SALES_AGGREGATE_DESIGN.md § 8`); `advanceStage()` nunca o define nem o altera — permanece exatamente como estava antes da chamada |

## 6. Forbidden Fields

Idêntica à lista já congelada em `CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md § 7`, reafirmada aqui: `domainEvents` (nenhum é disparado por `advanceStage()` — confirmado em `opportunity.ts`, "não dispara nenhum Domain Event... nenhuma fonte associa evento a `advanceStage`"); `getProposals()`/lista de `Proposal` (não relacionado a este caso de uso, mesma justificativa de exclusão de `CreateOpportunityResponse`); objetos internos (`props`); dado de Repository/Infrastructure; `User`/`Task`/`Activity`/`Quotation`/`Contract`/`Revenue` (não existem no Aggregate); a instância do próprio Aggregate (`Result`, `Option`, ou qualquer tipo do Shared Kernel nunca exposto diretamente — `SALES_CONTRACTS_FREEZE.md § 8`).

## 7. Mapping Rules

O Response é construído a partir do valor de sucesso de `Result<Opportunity, DomainError>` devolvido pelo Handler — nunca por acesso direto ao Aggregate fora desse fluxo (`SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 10`). Cada campo é lido do getter público correspondente de `Opportunity` e convertido para seu tipo primitivo de Contracts (`UniqueEntityId → string` via `.toValue()`/`.toString()`; `Date → string` ISO 8601, mesma decisão já tomada em `ENG-0081` para `CreateOpportunityResponse`). Nenhuma lógica de negócio ocorre nesse mapeamento — é tradução de forma, nunca cálculo.

## 8. Naming Convention

Confirmado: `AdvanceOpportunityStageResponse` — mesmo padrão de sufixo `Response` já usado por `CreateOpportunityResponse` (`ENG-0081`), mesmo nome do Command/Handler correspondente (`AdvanceOpportunityStageCommand`/`AdvanceOpportunityStageHandler`).

## 9. Compatibility

- **`AdvanceOpportunityStageCommand`** (`ENG-0061`) — não afetado; o Response é a saída, o Command é a entrada, artefatos independentes (`SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 8`).
- **`AdvanceOpportunityStageHandler`** (`ENG-0062`) — já devolve exatamente `Result<Opportunity, DomainError>`, compatível sem nenhuma alteração de assinatura.
- **`Opportunity` Aggregate** — nenhum getter novo é exigido; todos os 8 campos desta especificação já são públicos hoje.

## 10. Future Evolution

Mesma regra de versionamento já congelada em `CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md § 11`: novos campos só como opcionais, nunca quebrando a forma aqui congelada, sempre correspondendo a um getter já existente em `Opportunity` no momento da adição, sempre via nova ADR ou Ordem de Missão explícita.

## 11. Freeze Criteria

Esta especificação é considerada congelada a partir de sua aprovação — qualquer alteração em §§ 4-6 exige nova ADR ou nova Ordem de Missão explícita. A implementação futura (`AdvanceOpportunityStageResponse`, próxima missão) só poderá ser incluída no Contracts Freeze geral quando corresponder exatamente a este documento, confirmado por auditoria — mesmo critério de `CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md § 14`.

## 12. Conclusion

`AdvanceOpportunityStageResponse` deve conter exatamente os mesmos 6 campos obrigatórios de `CreateOpportunityResponse` (`id`, `organizationId`, `partyId`, `status`, `createdAt`, `updatedAt`) — porque ambos os Handlers devolvem o mesmo Aggregate inteiro — mas com uma diferença estrutural relevante: **`currentStageId` passa a ser obrigatório** (não opcional) nesta especificação, porque `advanceStage()` sempre o define como parte de sua própria execução bem-sucedida (`opportunity.ts` linha 170: `this.props.currentStageId = stageId;`, sem condição). Apenas `pipelineId` permanece opcional, por nunca ser tocado por esta operação.

| Campo | Obrigatório/Opcional (nesta Response) |
|---|---|
| `id` | Obrigatório |
| `organizationId` | Obrigatório |
| `partyId` | Obrigatório |
| `status` | Obrigatório |
| `createdAt` | Obrigatório |
| `updatedAt` | Obrigatório |
| `currentStageId` | **Obrigatório** (diferente de `CreateOpportunityResponse`, onde é opcional) |
| `pipelineId` | Opcional |

---

## Domain Model Validation

- Entity criada? **NÃO.**
- Aggregate criado? **NÃO.**
- Value Object criado? **NÃO.**
- Domain Event criado? **NÃO.**
- Nova regra criada? **NÃO.**
- Repository alterado? **NÃO.**
- Infrastructure alterada? **NÃO.**

## Relação com Outros Módulos

- [CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md](CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md) (ENG-0080) — precedente direto de forma e método
- [SALES_CONTRACTS_LAYER_ARCHITECTURE.md](SALES_CONTRACTS_LAYER_ARCHITECTURE.md) (ENG-0078), [SALES_CONTRACTS_FREEZE.md](SALES_CONTRACTS_FREEZE.md) (ENG-0087) — base normativa
- [services/domains/sales/domain/aggregates/opportunity/opportunity.ts](../../../services/domains/sales/domain/aggregates/opportunity/opportunity.ts) — fonte exclusiva de todo campo
- [services/domains/sales/application/handlers/advance-opportunity-stage/advance-opportunity-stage.handler.ts](../../../services/domains/sales/application/handlers/advance-opportunity-stage/advance-opportunity-stage.handler.ts) (ENG-0062) — origem do `Result<Opportunity, DomainError>` mapeado
- [services/domains/sales/contracts/advance-opportunity-stage/advance-opportunity-stage.request.ts](../../../services/domains/sales/contracts/advance-opportunity-stage/advance-opportunity-stage.request.ts) (ENG-0088) — Request correspondente, mesmo par de Contract

## Status

🟢 Especificação congelada (Missão ENG-0089). Nenhum código, interface, classe, DTO, Contract, Controller, Endpoint, Mapper, Serializer, Presenter, Factory, teste, README, ADR, Blueprint, Package, Export ou Barrel criado. Referência única e vinculante para a implementação futura de `AdvanceOpportunityStageResponse`. Aguardando aprovação formal do CTO.
