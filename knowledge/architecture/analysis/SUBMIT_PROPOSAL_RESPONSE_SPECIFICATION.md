# SubmitProposal — Response Specification

Versão: 1.0.0

Status: 🟢 Especificação arquitetural congelada — nenhum código criado

Missão: ENG-0094 (SubmitProposal Response Specification)

Escopo: congelar o payload público de `SubmitProposalResponse` antes de qualquer implementação — mesmo processo já usado para `CreateOpportunityResponse` (`ENG-0080`) e `AdvanceOpportunityStageResponse` (`ENG-0089`). Esta missão é **exclusivamente documental** — nenhum DTO, interface, classe, Request, Response, Contract ou Barrel é criado. Toda decisão de campo cita exclusivamente `proposal.ts` (código real, já congelado), `submit-proposal.handler.ts`, `SALES_CONTRACTS_LAYER_ARCHITECTURE.md` ou `SALES_CONTRACTS_FREEZE.md` — nenhum campo é inferido sem essa citação.

**Verify Before Reimplementing**: busca executada por "SUBMIT_PROPOSAL_RESPONSE_SPECIFICATION", "SubmitProposal Response Specification", "SubmitProposalResponse", "submit-proposal.response", "SubmitProposal DTO" em todo o repositório. Único resultado: uma citação de referência futura já existente em `CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md § 7` (linha 64: "...pertence a um futuro `SubmitProposalResponse`, não a este documento"), não uma especificação real. Confirmado, por listagem direta de `services/domains/sales/contracts/submit-proposal/`, que só existia `submit-proposal.request.ts` (`ENG-0093`) — **nenhuma Specification prévia, nenhum Response implementado, nenhum documento equivalente.**

---

## 1. Objetivo

`SubmitProposalResponse` é o payload público devolvido ao Cliente após a execução bem-sucedida do caso de uso `SubmitProposal` — a tradução, na fronteira externa da Contracts Layer, do valor de sucesso de `Result<Proposal, DomainError>` já devolvido por `SubmitProposalHandler.execute()` (`ENG-0064`). Seu único propósito é comunicar ao Cliente que `Proposal` foi criada e em que estado ela se encontra.

## 2. Fluxo do Handler

Confirmado por leitura direta de `submit-proposal.handler.ts` (`ENG-0064`): `execute(command: SubmitProposalCommand): Promise<Result<Proposal, DomainError>>` — o método localiza a `Opportunity` via `OpportunityRepository.findById()`, chama `opportunity.submitProposal()`, persiste via `save()`, e retorna `Result.ok(submitResult.getValue()!)`, onde `submitResult.getValue()!` é a instância de `Proposal` devolvida por `Opportunity.submitProposal()`.

**Achado decisivo, análise obrigatória desta missão**: o Handler devolve `Result<Proposal, DomainError>` — a `Proposal` em si — e **não** `Result<Opportunity, DomainError>`. Diferente de `CreateOpportunityResponse`/`AdvanceOpportunityStageResponse` (que representam o Aggregate `Opportunity` inteiro), `SubmitProposalResponse` deve representar exclusivamente a Entity `Proposal`.

## 3. Fonte das Evidências

Toda decisão de campo desta especificação deriva exclusivamente de:
- `services/domains/sales/domain/entities/proposal/proposal.ts` — única fonte de getters públicos de `Proposal`.
- `services/domains/sales/application/handlers/submit-proposal/submit-proposal.handler.ts` — confirma o tipo de retorno (`Result<Proposal, DomainError>`).
- `SALES_CONTRACTS_LAYER_ARCHITECTURE.md §§ 4, 10, 13` — tipos de artefato autorizados, Response Pattern, uso do Shared Kernel.
- `SALES_CONTRACTS_FREEZE.md §§ 5-8` — DTO Freeze, Contracts Freeze, Rule Ownership Freeze, Shared Kernel Freeze.

**Getters públicos de `Proposal`, confirmados por leitura direta de `proposal.ts` (linhas 62-118), citados um a um**:

| Getter | Linha | Tipo de domínio |
|---|---|---|
| `id` (herdado de `Entity`) | — | `UniqueEntityId` |
| `status` | linha 107-109 | `ProposalStatus` (`"pending" \| "approved"`) |
| `createdAt` | linha 111-113 | `Date` |
| `updatedAt` | linha 115-117 | `Date` |

Nenhum outro getter existe em `Proposal` — confirmado por leitura integral do arquivo. Em particular, `Proposal` **não possui** um getter `opportunityId` — a classe nunca guarda referência de volta à `Opportunity` que a possui (`proposal.ts`, cabeçalho: "uma Entity interna não guarda backreference ao Aggregate que a contém, é apenas contida em sua coleção").

## 4. Campos Públicos Permitidos

Exatamente os 4 campos com getter público confirmado em § 3 — nenhum a mais, nenhum a menos:

| Campo | Tipo | Obrigatório/Opcional | Origem | Justificativa |
|---|---|---|---|---|
| `id` | `string` | Obrigatório | `Entity.id` (herdado) | Identidade da `Proposal` — sem ele, nenhuma operação futura (`ApproveProposal`) pode referenciá-la |
| `status` | `"pending" \| "approved"` | Obrigatório | `proposal.ts` linha 107 | Sempre presente; `Proposal.create()` sempre define `"pending"` (`proposal.ts` linha 78) |
| `createdAt` | `string` (ISO 8601) | Obrigatório | `proposal.ts` linha 111 | Sempre presente, gerado internamente em `create()` |
| `updatedAt` | `string` (ISO 8601) | Obrigatório | `proposal.ts` linha 115 | Sempre presente; igual a `createdAt` no momento da criação (`submitProposal()` não chama `approve()`) |

`createdAt`/`updatedAt` tipados como `string` (ISO 8601), não `Date` — mesma decisão já tomada em `ENG-0081`/`ENG-0090`, por segurança de serialização JSON (`SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 13`).

## 5. Campos Opcionais

**Nenhum.** Todos os 4 campos de `ProposalProps` são sempre definidos por `Proposal.create()` (`proposal.ts` linhas 75-83) — nenhum é opcional em `ProposalProps`, diferente de `Opportunity` (`pipelineId`/`currentStageId`). Não inventar um campo opcional que não existe.

## 6. Campos Proibidos

| Campo/Dado | Por que nunca pode ser exposto |
|---|---|
| `Opportunity` (objeto) | `Proposal` nunca embute nem referencia a `Opportunity` que a possui — nenhum campo, nenhum getter |
| `organizationId`, `partyId`, `pipelineId`, `currentStageId` | Campos de `Opportunity`, não de `Proposal` — `Proposal` não os possui |
| `opportunityId` | **Achado registrado**: não existe como getter em `Proposal` hoje (§ 3) — mesmo sendo intuitivamente útil ao Cliente para saber a qual `Opportunity` a `Proposal` pertence, incluí-lo inventaria um campo que o Aggregate não expõe; permanece `Needs Evidence` para uma futura decisão de domínio, não resolvida por esta especificação |
| `Quotation`, `Contract`, `Revenue` | Não existem em `Proposal` nem em `Opportunity` hoje (`SALES_DOMAIN_COMPLETION_AUDIT.md § 10`) |
| `Task`/`Activity`/`User` | Não existem em `Proposal` |
| Dado de Repository/Infrastructure | A Contracts Layer nunca conhece a forma de persistência |
| Domain Events | `Proposal` nunca publica evento diretamente (`Entity<T>`, sem `addDomainEvent`) — `ProposalApproved` é disparado pelo Aggregate `Opportunity`, não pela `Proposal` |
| Coleções internas / objetos internos (`props`) | Estado interno protegido, nunca acessado fora da própria classe |
| `Result`, `Option`, `UniqueEntityId`, hierarquia de erros | Nenhum tipo do Shared Kernel atravessa a fronteira da Contracts Layer (`SALES_CONTRACTS_FREEZE.md § 8`) |
| `Factory`, `Service`, `Mapper` | Fora do escopo de um DTO público |
| Qualquer campo futuro não evidenciado | Nenhuma antecipação de decisão de domínio ainda não tomada |

## 7. Justificativa Arquitetural

Cada um dos 4 campos permitidos (§ 4) cita a linha exata do getter correspondente em `proposal.ts` — nenhum campo foi incluído por inferência ou por analogia com `CreateOpportunityResponse`/`AdvanceOpportunityStageResponse`. A diferença de forma entre esta especificação e as duas anteriores (4 campos aqui vs. 7-8 campos naquelas) é uma consequência direta e honesta de `Proposal` ser uma Entity deliberadamente mínima (`proposal.ts`, "Estado deliberadamente mínimo"), não uma redução arbitrária.

## 8. Dependency Boundary

Mesma fronteira já congelada em `SALES_CONTRACTS_FREEZE.md §§ 4, 6, 8`: `SubmitProposalResponse` não pode depender de `domain/`, `application/`, `infrastructure/` ou `@novaris/shared-kernel` — todo campo é primitivo (`string`), toda conversão de tipo (`UniqueEntityId → string`, `Date → string`) é responsabilidade da implementação futura do Response, nunca desta especificação.

## 9. Rule Ownership

Reafirmação de `SALES_CONTRACTS_FREEZE.md § 7`: 0% Contracts, 100% Aggregate/Entity. Esta especificação não introduz nenhuma regra de negócio — apenas nomeia os campos já existentes e sua origem.

## 10. Freeze Result

Esta especificação é considerada congelada a partir de sua aprovação — qualquer alteração em §§ 4-6 exige nova ADR ou nova Ordem de Missão explícita. A implementação futura (`SubmitProposalResponse`) só poderá ser incluída no Contracts Freeze geral quando corresponder exatamente a este documento, confirmado por auditoria — mesmo critério já usado em `CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md § 14`/`ADVANCE_OPPORTUNITY_STAGE_RESPONSE_SPECIFICATION.md § 11`.

## 11. Próximas Implementações

1. `SubmitProposalResponse` (interface, 4 campos, mesmo padrão de `CreateOpportunityResponse`/`AdvanceOpportunityStageResponse`).
2. Barrel local (`submit-proposal/index.ts`).
3. Sincronização do Root Barrel (`contracts/index.ts`).

## 12. Conclusion

`SubmitProposalResponse` deve conter exatamente 4 campos obrigatórios (`id`, `status`, `createdAt`, `updatedAt`), todos derivados diretamente dos getters já públicos de `Proposal` — nenhum campo opcional, nenhuma referência a `Opportunity` ou a qualquer outro conceito do domínio. A ausência de um campo `opportunityId` é um achado explícito e honesto desta especificação, não uma omissão: `Proposal` simplesmente não guarda essa referência hoje.

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

- [CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md](CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md) (ENG-0080), [ADVANCE_OPPORTUNITY_STAGE_RESPONSE_SPECIFICATION.md](ADVANCE_OPPORTUNITY_STAGE_RESPONSE_SPECIFICATION.md) (ENG-0089) — precedentes diretos de forma e método
- [SALES_CONTRACTS_LAYER_ARCHITECTURE.md](SALES_CONTRACTS_LAYER_ARCHITECTURE.md) (ENG-0078), [SALES_CONTRACTS_FREEZE.md](SALES_CONTRACTS_FREEZE.md) (ENG-0087) — base normativa
- [services/domains/sales/domain/entities/proposal/proposal.ts](../../../services/domains/sales/domain/entities/proposal/proposal.ts) — fonte exclusiva de todo campo
- [services/domains/sales/application/handlers/submit-proposal/submit-proposal.handler.ts](../../../services/domains/sales/application/handlers/submit-proposal/submit-proposal.handler.ts) (ENG-0064) — origem do `Result<Proposal, DomainError>` mapeado
- [services/domains/sales/contracts/submit-proposal/submit-proposal.request.ts](../../../services/domains/sales/contracts/submit-proposal/submit-proposal.request.ts) (ENG-0093) — Request correspondente, mesmo par de Contract

## Status

🟢 Especificação congelada (Missão ENG-0094). Nenhum código, DTO, interface, classe, Request, Response, Contract ou Barrel criado. Referência única e vinculante para a implementação futura de `SubmitProposalResponse`. Aguardando aprovação formal do CTO.
