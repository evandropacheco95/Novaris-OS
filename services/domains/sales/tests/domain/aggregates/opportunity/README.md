# sales / tests / domain / aggregates / opportunity

## Purpose

Testes unitários do Aggregate Root `Opportunity` — espelha [domain/aggregates/](../../../../domain/aggregates/README.md) (`opportunity/opportunity.ts`).

## Conteúdo (Missão ENG-0053)

- [opportunity.test.ts](opportunity.test.ts) — 24 testes: `create()` (criação válida, campos opcionais, `OpportunityCreated`, nunca lança exceção), `reconstitute()` (sem validação, sem eventos, restauração de `proposals`), `submitProposal()` (cria e adiciona `Proposal`, nenhum evento novo, ids distintos), `approveProposal()` (aprova, dispara `ProposalApproved`, rejeita id inexistente/`Proposal` já aprovada), `advanceStage()` (altera `currentStageId`, nenhum evento, rejeita em estado fechado), `markWon()`/`markLost()` (transição, evento correspondente, rejeita repetição).

Segue exatamente o padrão já em uso em `organization.test.ts` (Organization, Kernel) e `user.test.ts` (Identity, Kernel) — `describe`/`it` por método, checagem de `domainEvents` por `instanceof`/`aggregateId`/`eventName`, `getValue()!`/`getError()`. Cobertura de invariante violada (além dos "casos mínimos" da Ordem de Missão) exigida pelo checklist de `AGGREGATE_IMPLEMENTATION_STANDARD.md § 11` (ENS-0001), citado como leitura obrigatória pela própria missão — não é regra nova, apenas exercita `ConflictError`/`NotFoundError` já implementados.

Nenhum método, regra, evento, campo ou validação nova foi criada. `opportunity.ts`, `proposal.ts`, `pipeline.ts`, `stage.ts`, Repositories, Mappers e Infrastructure Layer permanecem inalterados.

## Status

🟢 24 testes implementados (Missão ENG-0053). Comportamento atual do Aggregate `Opportunity` congelado por teste.
