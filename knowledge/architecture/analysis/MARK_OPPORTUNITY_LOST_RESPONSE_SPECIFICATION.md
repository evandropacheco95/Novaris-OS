# MarkOpportunityLost — Response Specification

Versão: 1.0.0

Status: 🟢 Especificação arquitetural congelada — nenhum código criado

Missão: ENG-0110 (MarkOpportunityLost Response Specification, sub-missão de ENG-0103-COMPOSITE)

**Verify Before Reimplementing**: busca executada por "MARK_OPPORTUNITY_LOST_RESPONSE_SPECIFICATION", "MarkOpportunityLostResponse" em todo o repositório — zero resultados. Confirmado, por listagem direta de `services/domains/sales/contracts/mark-opportunity-lost/`, que só existia `mark-opportunity-lost.request.ts` (ENG-0109). Nenhuma Specification prévia, nenhum Response implementado, nenhuma duplicação.

---

## 1. Objetivo

`MarkOpportunityLostResponse` é o payload público devolvido ao Cliente após a execução bem-sucedida do caso de uso `MarkOpportunityLost` — tradução do valor de sucesso de `Result<Opportunity, DomainError>` devolvido por `MarkOpportunityLostHandler.execute()`.

## 2. Fluxo do Handler

Confirmado por leitura direta de `mark-opportunity-lost.handler.ts` (linha 46): `execute()` converte `command.opportunityId` para `UniqueEntityId`, localiza a `Opportunity` via `findById()`, chama `opportunity.markLost()`, persiste via `save()`, e devolve `Result.ok(opportunity)` — a mesma instância já mutada.

**Achado**: estrutura idêntica a `MarkOpportunityWonHandler` (`ENG-0105 § 2`) — o Handler devolve `Result<Opportunity, DomainError>`, o Aggregate inteiro, mesma categoria de `CreateOpportunityResponse`/`AdvanceOpportunityStageResponse`/`MarkOpportunityWonResponse`.

## 3. Fonte das Evidências / Análise de Domínio

Análise restrita a `opportunity.ts` e a `markLost()` (linhas 143-153). Getters públicos confirmados: `organizationId`, `partyId`, `pipelineId` (opcional), `currentStageId` (opcional), `status`, `createdAt`, `updatedAt`, além de `id`.

**Efeito de `markLost()` sobre o estado**: define `status = "lost"` e atualiza `updatedAt` — não toca `pipelineId`/`currentStageId`, que permanecem exatamente como estavam antes (idêntico ao efeito de `markWon()`, `ENG-0105 § 3`). Mesma conclusão: opcionalidade de ambos herdada da criação, não do padrão de `AdvanceOpportunityStageResponse`.

## 4. Campos Públicos Permitidos

| Campo | Tipo | Obrigatório/Opcional | Origem | Justificativa |
|---|---|---|---|---|
| `id` | `string` | Obrigatório | `AggregateRoot.id` | Identidade da `Opportunity` |
| `organizationId` | `string` | Obrigatório | `opportunity.ts` linha 273 | Sempre presente desde a criação |
| `partyId` | `string` | Obrigatório | `opportunity.ts` linha 277 | Idem |
| `status` | `"open" \| "won" \| "lost"` | Obrigatório | `opportunity.ts` linha 289 | Após `markLost()` bem-sucedido, sempre `"lost"` — tipado como a união completa `OpportunityStatus`, mesmo raciocínio de `ENG-0105 § 4`/`ENG-0089` (espelha o tipo de domínio completo, não o subconjunto estreito desta operação) |
| `createdAt` | `string` (ISO 8601) | Obrigatório | `opportunity.ts` linha 293 | Sempre presente |
| `updatedAt` | `string` (ISO 8601) | Obrigatório | `opportunity.ts` linha 297 | Atualizado pela própria `markLost()` |
| `pipelineId` | `string` | Opcional | `opportunity.ts` linha 281 | `markLost()` não altera — opcionalidade herdada da criação |
| `currentStageId` | `string` | Opcional | `opportunity.ts` linha 285 | Idem |

## 5. Campos Opcionais

`pipelineId`, `currentStageId` — idêntico a `MARK_OPPORTUNITY_WON_RESPONSE_SPECIFICATION.md § 5`.

## 6. Campos Proibidos

| Campo/Dado | Motivo |
|---|---|
| Motivo de perda, classificação, concorrente, receita perdida, usuário responsável | Não existem em `Opportunity`/`MarkOpportunityLostCommand` — `mark-opportunity-lost.handler.ts` (linhas 37-38) confirma explicitamente que nenhum desses é validado ou aceito |
| `Proposal`/coleção de propostas | Não faz parte do retorno do Handler |
| `Quotation`, `Contract`, `Revenue`, `Task`, `Activity`, `User` | Não existem como campo em `Opportunity` |
| Domain Events (`OpportunityLost`) | Nunca exposto num Response |
| Repository/Infrastructure/Database data | Fora da fronteira da Contracts Layer |
| `Result`, `Option`, `UniqueEntityId`, `DomainError`, demais tipos do Shared Kernel | Nunca atravessam a fronteira (`SALES_CONTRACTS_FREEZE.md § 8`) |
| Props internas / coleção `proposals` privada | Estado interno protegido |

## 7. Justificativa Arquitetural

Todos os 8 campos citam a linha exata do getter em `opportunity.ts`; a coincidência total de forma com `MarkOpportunityWonResponse` é consequência de `markLost()`/`markWon()` terem exatamente o mesmo efeito estrutural sobre `OpportunityProps` (apenas `status`/`updatedAt` mudam) — não uma cópia sem verificação.

## 8. Dependency Boundary

`Contracts → Application → Domain`. Nenhum tipo do Shared Kernel/Domain/Application/Repository/Infrastructure é importado.

## 9. Rule Ownership

Contracts Layer = 0% regra de negócio; Domain Layer = 100%.

## 10. Freeze Result

Especificação congelada a partir de sua aprovação — qualquer alteração exige nova ADR ou Ordem de Missão explícita.

## 11. Próximas Implementações

1. `MarkOpportunityLostResponse` (interface, 8 campos).
2. Barrel local (`mark-opportunity-lost/index.ts`).
3. Sincronização do Root Barrel.

## 12. Conclusão

`MarkOpportunityLostResponse` deve conter exatamente 8 campos (`id`, `organizationId`, `partyId`, `status`, `createdAt`, `updatedAt` Obrigatórios; `pipelineId`, `currentStageId` Opcionais), idênticos em forma a `MarkOpportunityWonResponse` — consequência estrutural real, não copiada por analogia sem verificação.

---

## Domain Model Validation

Entity criada? NÃO. Aggregate criado? NÃO. Value Object criado? NÃO. Domain Event criado? NÃO. Nova regra criada? NÃO. Repository alterado? NÃO. Infrastructure alterada? NÃO.

## Relação com Outros Módulos

- [MARK_OPPORTUNITY_WON_RESPONSE_SPECIFICATION.md](MARK_OPPORTUNITY_WON_RESPONSE_SPECIFICATION.md) (ENG-0105) — precedente direto, mesma estrutura de Aggregate
- [services/domains/sales/domain/aggregates/opportunity/opportunity.ts](../../../services/domains/sales/domain/aggregates/opportunity/opportunity.ts) — fonte exclusiva de todo campo
- [services/domains/sales/application/handlers/mark-opportunity-lost/mark-opportunity-lost.handler.ts](../../../services/domains/sales/application/handlers/mark-opportunity-lost/mark-opportunity-lost.handler.ts) — origem do `Result<Opportunity, DomainError>` mapeado
- [services/domains/sales/contracts/mark-opportunity-lost/mark-opportunity-lost.request.ts](../../../services/domains/sales/contracts/mark-opportunity-lost/mark-opportunity-lost.request.ts) (ENG-0109) — Request correspondente

## Status

🟢 Especificação congelada (Missão ENG-0110). Nenhum código, DTO, interface, classe, Request, Response, Contract ou Barrel criado. Referência única e vinculante para a implementação futura de `MarkOpportunityLostResponse`.
