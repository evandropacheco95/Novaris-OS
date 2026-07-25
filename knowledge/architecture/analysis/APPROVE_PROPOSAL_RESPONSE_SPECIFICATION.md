# ApproveProposal Response Specification

Versão: 1.0.0

Status: 🟢 Especificação arquitetural congelada — nenhum código criado

Missão: ENG-0099 (ApproveProposal Response Specification)

**Verify Before Reimplementing**: busca executada por "APPROVE_PROPOSAL_RESPONSE_SPECIFICATION", "ApproveProposalResponse", "approve-proposal.response", "ApproveProposal DTO", "ApproveProposal Response", "Response Specification", "Proposal Response" em todo o repositório. Único resultado: uma ocorrência genérica da frase "Response Specification" dentro de `SUBMIT_PROPOSAL_RESPONSE_SPECIFICATION.md` (linha 7, "Missão: ENG-0094 (SubmitProposal Response Specification)") — referente ao caso de uso `SubmitProposal`, não a `ApproveProposal`. Confirmado, por listagem direta de `services/domains/sales/contracts/approve-proposal/`, que só existia `approve-proposal.request.ts` (`ENG-0098`). **Nenhuma Specification prévia, nenhum Response implementado, nenhuma duplicação arquitetural.**

---

## 1. Purpose

`ApproveProposalResponse` é o payload público devolvido ao Cliente após a execução bem-sucedida do caso de uso `ApproveProposal` — a tradução, na fronteira externa da Contracts Layer, do valor de sucesso de `Result<Proposal, DomainError>` devolvido por `ApproveProposalHandler.execute()`. Seu único propósito é comunicar ao Cliente que a `Proposal` foi aprovada e em que estado ela se encontra após a operação.

## 2. Architectural Context

Esta especificação segue o mesmo processo já aplicado em `CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md` (`ENG-0080`), `ADVANCE_OPPORTUNITY_STAGE_RESPONSE_SPECIFICATION.md` (`ENG-0089`) e `SUBMIT_PROPOSAL_RESPONSE_SPECIFICATION.md` (`ENG-0094`) — nenhum campo é definido por analogia ou copiado automaticamente de qualquer uma dessas três; cada decisão nasce exclusivamente da leitura direta do Handler e do Domain real desta missão, conforme exigido pela Ordem de Missão `ENG-0099` (seção "Fonte de Verdade"). A posição desta especificação no fluxo obrigatório: `Request Contract → Response Specification (esta) → Response Contract → Local Barrel → Root Barrel`.

## 3. Handler Return Analysis

Confirmado por leitura direta de `services/domains/sales/application/handlers/approve-proposal/approve-proposal.handler.ts` (linha 57):

```
ApproveProposalHandler.execute()
returns Result<Proposal, DomainError>
```

O Handler converte `command.opportunityId`/`command.proposalId` para `UniqueEntityId`, localiza a `Opportunity` via `OpportunityRepository.findById()`, chama `opportunity.approveProposal(proposalId)` (que devolve `Result<void, DomainError>` — nunca a `Proposal` em si, conforme nota registrada no próprio Handler, linhas 37-47), persiste via `save()`, e então lê `opportunity.findProposal(proposalId)!` — uma consulta pura, sem mutação — para obter a mesma instância de `Proposal` já mutada internamente por `proposal.approve()`. O valor de sucesso final devolvido é essa instância de `Proposal`.

**Achado decisivo, análise obrigatória desta missão**: assim como `SubmitProposalHandler` (`ENG-0094 § 2`), o retorno é a Entity `Proposal` — **não** `Opportunity`. `ApproveProposalResponse` deve representar exclusivamente `Proposal`, pelo mesmo motivo já registrado para `SubmitProposalResponse`.

## 4. Domain Source Analysis

Como o retorno é `Proposal`, a análise de origem usa exclusivamente `services/domains/sales/domain/entities/proposal/proposal.ts` — não `opportunity.ts`.

Getters públicos de `Proposal`, confirmados por leitura direta do arquivo (linhas 62-118), citados um a um:

| Getter | Linha | Tipo de domínio |
|---|---|---|
| `id` (herdado de `Entity`) | — | `UniqueEntityId` |
| `status` | linha 107-109 | `ProposalStatus` (`"pending" \| "approved"`) |
| `createdAt` | linha 111-113 | `Date` |
| `updatedAt` | linha 115-117 | `Date` |

Nenhum outro getter existe em `Proposal` — confirmado por leitura integral do arquivo (idêntico ao já confirmado em `ENG-0094 § 3`; o arquivo não foi alterado desde então). Em particular, `Proposal` continua sem getter `opportunityId` — nunca guarda referência de volta à `Opportunity` que a possui (`proposal.ts`, cabeçalho, linhas 20-24). Nenhum acesso a `props` internas, atributos privados ou estruturas não expostas foi utilizado nesta análise.

## 5. Public Response Fields

Exatamente os 4 campos com getter público confirmado em § 4 — nenhum a mais, nenhum a menos, nenhum copiado por analogia de `SubmitProposalResponse`:

| Campo | Tipo | Origem | Justificativa |
|---|---|---|---|
| `id` | `string` | `Entity.id` (herdado) | Identidade da `Proposal` — necessária para qualquer referência futura a esta aprovação |
| `status` | `"pending" \| "approved"` | `proposal.ts` linha 107 | Sempre presente; após `approveProposal()` bem-sucedido, `status` é sempre `"approved"` (`proposal.ts` linha 102) |
| `createdAt` | `string` (ISO 8601) | `proposal.ts` linha 111 | Sempre presente, imutável desde a criação da `Proposal` |
| `updatedAt` | `string` (ISO 8601) | `proposal.ts` linha 115 | Sempre presente; atualizado pela própria `approve()` no momento da aprovação (`proposal.ts` linha 103) |

`createdAt`/`updatedAt` tipados como `string` (ISO 8601), não `Date` — mesma decisão já tomada em `ENG-0081`/`ENG-0090`/`ENG-0094`, por segurança de serialização JSON (`SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 13`).

## 6. Field Origin Mapping

| Campo | Arquivo de origem | Getter/propriedade pública |
|---|---|---|
| `id` | `proposal.ts` (via `Entity<T>` do Shared Kernel) | `Entity.id` |
| `status` | `proposal.ts` | `get status(): ProposalStatus` |
| `createdAt` | `proposal.ts` | `get createdAt(): Date` |
| `updatedAt` | `proposal.ts` | `get updatedAt(): Date` |

Nenhum campo mapeado a partir de `opportunity.ts`, de nenhum outro Aggregate/Entity, ou de qualquer estrutura de Repository/Infrastructure.

## 7. Required and Optional Fields

**Obrigatórios (todos os 4):** `id`, `status`, `createdAt`, `updatedAt` — todos sempre definidos por `Proposal.create()` e preservados/atualizados por `approve()`.

**Opcionais:** nenhum. Idêntico ao achado de `ENG-0094 § 5` — `ProposalProps` não define nenhum campo opcional; `Proposal` continua sendo uma Entity deliberadamente mínima.

## 8. Forbidden Fields

| Campo/Dado | Por que nunca pode ser exposto |
|---|---|
| `price`, `amount`, `currency`, `discount` | Não existem em `Proposal` — `proposal.ts` documenta explicitamente (cabeçalho, linhas 26-33) a ausência deliberada de campo de valor/preço, por falta de fonte |
| `approvalReason`, `approvedBy`, `userId`, `notes`, `comments`, `attachments` | Não existem em `Proposal` nem em `Opportunity` — nenhuma fonte de domínio confirma esses campos |
| `quotationId`, `contractId`, `revenue`, `commission` | Conceitos não confirmados como parte de `Proposal` (`ADR-0020` distingue `Proposal` de `Quotation`, sem relacioná-los estruturalmente) |
| `opportunityId` | **Achado registrado, mesma natureza de `ENG-0094 § 6`**: não existe como getter em `Proposal` hoje — permanece `Needs Evidence` para decisão futura de domínio, não resolvida por esta especificação |
| Domain Events (`ProposalApproved`) | `Proposal` nunca publica evento diretamente (`Entity<T>`, sem `addDomainEvent`) — disparado exclusivamente por `Opportunity.approveProposal()`, nunca exposto num Response |
| Repository data / Infrastructure data / Database fields | A Contracts Layer nunca conhece a forma de persistência |
| Internal identifiers / Aggregate internals / Private props / Collections internas | Estado interno protegido, nunca acessado fora da própria classe |
| `Result`, `Option`, `DomainError`, `UniqueEntityId`, demais tipos do Shared Kernel | Nenhum tipo do Shared Kernel atravessa a fronteira da Contracts Layer (`SALES_CONTRACTS_FREEZE.md § 8`) |

Caso qualquer campo acima venha a existir futuramente em `Proposal`, sua inclusão em um Response exige nova decisão arquitetural — não antecipada aqui.

## 9. Dependency Rules

```
Contracts
    ↓
Application
    ↓
Domain
```

`ApproveProposalResponse` não pode depender de `domain/`, `application/`, `infrastructure/` ou `@novaris/shared-kernel` — todo campo é primitivo (`string`), toda conversão de tipo (`UniqueEntityId → string`, `Date → string`) é responsabilidade da implementação futura do Response, nunca desta especificação. A Contracts Layer não conhece Repository, Infrastructure, Database ou Framework.

## 10. DTO Philosophy Compliance

`ApproveProposalResponse` é uma **Public Representation**, não um **Domain Object Export**. Ele simplifica dados, protege o domínio e cria uma fronteira externa estável — não replica a Entity `Proposal`, não expõe o Domain Model, não transporta regras. Todos os 4 campos permitidos (§ 5) citam a linha exata do getter correspondente em `proposal.ts` — nenhum foi incluído por inferência ou por analogia com `SubmitProposalResponse`/`CreateOpportunityResponse`/`AdvanceOpportunityStageResponse`.

## 11. Rule Ownership

```
Contracts Layer = 0% regra de negócio
Application Layer = Orquestração
Domain Layer = 100% regra de negócio
```

Esta especificação não introduz nenhuma regra de negócio — apenas nomeia os campos já existentes e sua origem real.

## 12. Relationship With Other Modules

**Opportunity**: não faz parte do retorno de `ApproveProposalHandler.execute()` (§ 3) — portanto nenhum dado de `Opportunity` (`organizationId`, `partyId`, `pipelineId`, `currentStageId`) pode ser exposto por este Response. `Opportunity` permanece inteiramente interna à Application/Domain Layer para este caso de uso.

**Proposal**: fonte exclusiva de todo campo público (§§ 4-6) — `id`, `status`, `createdAt`, `updatedAt` são os únicos dados públicos existentes; `opportunityId`, conteúdo/valor/termos da proposta e qualquer referência a `Party`/`Quotation` permanecem decisões de domínio não tomadas (`proposal.ts`, cabeçalho).

**Shared Kernel**: confirmado que nenhum tipo interno (`Result`, `Option`, `UniqueEntityId`, `DomainError`) atravessa a fronteira externa — todos os 4 campos do Response são primitivos (`string`).

---

## Domain Model Validation

Entity criada? NÃO.

Aggregate criado? NÃO.

Value Object criado? NÃO.

Domain Event criado? NÃO.

Nova regra criada? NÃO.

Repository alterado? NÃO.

Infrastructure alterada? NÃO.

## Relação com Outros Módulos

- [SUBMIT_PROPOSAL_RESPONSE_SPECIFICATION.md](SUBMIT_PROPOSAL_RESPONSE_SPECIFICATION.md) (ENG-0094) — precedente direto de forma e método, mesmo tipo de retorno (`Proposal`)
- [SALES_CONTRACTS_LAYER_ARCHITECTURE.md](SALES_CONTRACTS_LAYER_ARCHITECTURE.md) (ENG-0078), [SALES_CONTRACTS_FREEZE.md](SALES_CONTRACTS_FREEZE.md) (ENG-0087), [SALES_CONTRACTS_ARCHITECTURE_GATE.md](SALES_CONTRACTS_ARCHITECTURE_GATE.md) (ENG-0086) — base normativa
- [services/domains/sales/domain/entities/proposal/proposal.ts](../../../services/domains/sales/domain/entities/proposal/proposal.ts) — fonte exclusiva de todo campo
- [services/domains/sales/application/handlers/approve-proposal/approve-proposal.handler.ts](../../../services/domains/sales/application/handlers/approve-proposal/approve-proposal.handler.ts) — origem do `Result<Proposal, DomainError>` mapeado
- [services/domains/sales/contracts/approve-proposal/approve-proposal.request.ts](../../../services/domains/sales/contracts/approve-proposal/approve-proposal.request.ts) (ENG-0098) — Request correspondente, mesmo par de Contract

## Status

🟢 Especificação congelada (Missão ENG-0099). Nenhum código, DTO, interface, classe, Request, Response, Contract ou Barrel criado. Referência única e vinculante para a implementação futura de `ApproveProposalResponse`. Aguardando aprovação formal do CTO.
