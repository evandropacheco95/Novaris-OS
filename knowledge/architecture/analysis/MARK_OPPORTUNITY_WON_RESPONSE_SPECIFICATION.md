# MarkOpportunityWon — Response Specification

Versão: 1.0.0

Status: 🟢 Especificação arquitetural congelada — nenhum código criado

Missão: ENG-0105 (MarkOpportunityWon Response Specification, sub-missão de ENG-0103-COMPOSITE)

**Verify Before Reimplementing**: busca executada por "MARK_OPPORTUNITY_WON_RESPONSE_SPECIFICATION", "MarkOpportunityWonResponse" em todo o repositório — zero resultados. Confirmado, por listagem direta de `services/domains/sales/contracts/mark-opportunity-won/`, que só existia `mark-opportunity-won.request.ts` (ENG-0104). Nenhuma Specification prévia, nenhum Response implementado, nenhuma duplicação.

---

## 1. Objetivo

`MarkOpportunityWonResponse` é o payload público devolvido ao Cliente após a execução bem-sucedida do caso de uso `MarkOpportunityWon` — tradução do valor de sucesso de `Result<Opportunity, DomainError>` devolvido por `MarkOpportunityWonHandler.execute()`.

## 2. Fluxo do Handler

Confirmado por leitura direta de `mark-opportunity-won.handler.ts` (linha 46): `execute()` converte `command.opportunityId` para `UniqueEntityId`, localiza a `Opportunity` via `findById()`, chama `opportunity.markWon()`, persiste via `save()`, e devolve `Result.ok(opportunity)` — a mesma instância já mutada pelo Aggregate.

**Achado**: o Handler devolve `Result<Opportunity, DomainError>` — o Aggregate inteiro, mesma categoria de `CreateOpportunityResponse` (ENG-0080) e `AdvanceOpportunityStageResponse` (ENG-0089), não a categoria de `Proposal` (`SubmitProposalResponse`/`ApproveProposalResponse`).

## 3. Fonte das Evidências / Análise de Domínio

Análise restrita a `services/domains/sales/domain/aggregates/opportunity/opportunity.ts` e a `markWon()` (linhas 130-140). Getters públicos confirmados (linhas 273-299): `organizationId`, `partyId`, `pipelineId` (opcional), `currentStageId` (opcional), `status`, `createdAt`, `updatedAt`, além de `id` (herdado de `AggregateRoot`).

**Efeito de `markWon()` sobre o estado**: define `status = "won"` e atualiza `updatedAt` — não toca `pipelineId`/`currentStageId`, que permanecem exatamente como estavam antes da chamada (podem ser `undefined` desde a criação, `CreateOpportunityInput` os define como opcionais). Portanto a opcionalidade desses dois campos segue o mesmo raciocínio de `CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md`, não o de `ADVANCE_OPPORTUNITY_STAGE_RESPONSE_SPECIFICATION.md` (onde `advanceStage()` sempre define `currentStageId`, tornando-o Obrigatório apenas naquele contexto).

## 4. Campos Públicos Permitidos

| Campo | Tipo | Obrigatório/Opcional | Origem | Justificativa |
|---|---|---|---|---|
| `id` | `string` | Obrigatório | `AggregateRoot.id` | Identidade da `Opportunity` |
| `organizationId` | `string` | Obrigatório | `opportunity.ts` linha 273 | Campo obrigatório em `CreateOpportunityInput`, nunca `undefined` |
| `partyId` | `string` | Obrigatório | `opportunity.ts` linha 277 | Idem |
| `status` | `"open" \| "won" \| "lost"` | Obrigatório | `opportunity.ts` linha 289 | Após `markWon()` bem-sucedido, sempre `"won"` — tipado como a união completa `OpportunityStatus` (não o literal `"won"` isolado), mesmo padrão já estabelecido em `ADVANCE_OPPORTUNITY_STAGE_RESPONSE_SPECIFICATION.md § 4`: o campo espelha o tipo de domínio completo, não o subconjunto estreito garantido por esta operação específica |
| `createdAt` | `string` (ISO 8601) | Obrigatório | `opportunity.ts` linha 293 | Sempre presente |
| `updatedAt` | `string` (ISO 8601) | Obrigatório | `opportunity.ts` linha 297 | Atualizado pela própria `markWon()` |
| `pipelineId` | `string` | Opcional | `opportunity.ts` linha 281 | `markWon()` não altera — opcionalidade herdada da criação (§ 3) |
| `currentStageId` | `string` | Opcional | `opportunity.ts` linha 285 | Idem — `markWon()` não altera |

## 5. Campos Opcionais

`pipelineId`, `currentStageId` — ambos podem ser `undefined`, pois `markWon()` não os define nem os exige; a opcionalidade vem inalterada desde `CreateOpportunityInput`.

## 6. Campos Proibidos

| Campo/Dado | Motivo |
|---|---|
| `Proposal`/coleção de propostas | Não faz parte do retorno de `MarkOpportunityWonHandler`; `getProposals()` existe no Aggregate mas não é chamado por este Handler |
| `Quotation`, `Contract`, `Revenue`, `Task`, `Activity`, `User` | Não existem como campo em `Opportunity` (`opportunity.ts`, cabeçalho, linhas 30-39) |
| Domain Events (`OpportunityWon`) | `Opportunity` publica o evento internamente (`addDomainEvent`), mas o Response nunca expõe a coleção de eventos |
| Repository/Infrastructure/Database data | A Contracts Layer não conhece a forma de persistência |
| `Result`, `Option`, `UniqueEntityId`, `DomainError`, demais tipos do Shared Kernel | Nunca atravessam a fronteira da Contracts Layer (`SALES_CONTRACTS_FREEZE.md § 8`) |
| Props internas / coleção `proposals` privada | Estado interno protegido |

## 7. Justificativa Arquitetural

Todos os 8 campos citam a linha exata do getter em `opportunity.ts` — nenhum copiado por analogia sem verificação; a coincidência de forma com `CreateOpportunityResponse` (mesmos 8 campos, mesma opcionalidade de `pipelineId`/`currentStageId`) é consequência de ambos os Handlers devolverem `Result<Opportunity, DomainError>` sem que `markWon()`/`create()` alterem esses dois campos especificamente.

## 8. Dependency Boundary

`Contracts → Application → Domain`. Nenhum tipo do Shared Kernel, Domain, Application, Repository ou Infrastructure é importado pelo Response — todos os campos são primitivos.

## 9. Rule Ownership

Contracts Layer = 0% regra de negócio; Domain Layer = 100%. Esta especificação não introduz nenhuma regra.

## 10. Freeze Result

Especificação congelada a partir de sua aprovação — qualquer alteração exige nova ADR ou Ordem de Missão explícita.

## 11. Próximas Implementações

1. `MarkOpportunityWonResponse` (interface, 8 campos).
2. Barrel local (`mark-opportunity-won/index.ts`).
3. Sincronização do Root Barrel.

## 12. Conclusão

`MarkOpportunityWonResponse` deve conter exatamente 8 campos (`id`, `organizationId`, `partyId`, `status`, `createdAt`, `updatedAt` Obrigatórios; `pipelineId`, `currentStageId` Opcionais), todos derivados diretamente dos getters já públicos de `Opportunity`.

---

## Domain Model Validation

Entity criada? NÃO. Aggregate criado? NÃO. Value Object criado? NÃO. Domain Event criado? NÃO. Nova regra criada? NÃO. Repository alterado? NÃO. Infrastructure alterada? NÃO.

## Relação com Outros Módulos

- [CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md](CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md) (ENG-0080), [ADVANCE_OPPORTUNITY_STAGE_RESPONSE_SPECIFICATION.md](ADVANCE_OPPORTUNITY_STAGE_RESPONSE_SPECIFICATION.md) (ENG-0089) — precedentes diretos, mesmo tipo de retorno (`Opportunity`)
- [services/domains/sales/domain/aggregates/opportunity/opportunity.ts](../../../services/domains/sales/domain/aggregates/opportunity/opportunity.ts) — fonte exclusiva de todo campo
- [services/domains/sales/application/handlers/mark-opportunity-won/mark-opportunity-won.handler.ts](../../../services/domains/sales/application/handlers/mark-opportunity-won/mark-opportunity-won.handler.ts) — origem do `Result<Opportunity, DomainError>` mapeado
- [services/domains/sales/contracts/mark-opportunity-won/mark-opportunity-won.request.ts](../../../services/domains/sales/contracts/mark-opportunity-won/mark-opportunity-won.request.ts) (ENG-0104) — Request correspondente

## Status

🟢 Especificação congelada (Missão ENG-0105). Nenhum código, DTO, interface, classe, Request, Response, Contract ou Barrel criado. Referência única e vinculante para a implementação futura de `MarkOpportunityWonResponse`.
