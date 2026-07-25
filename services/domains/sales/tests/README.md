# sales / tests

## Purpose

Local futuro dos testes de `Sales` — unitários de Aggregate (`domain/`), de Repository Contract, e de integração — quando existir código a testar.

## Responsibilities

Validar Aggregates, Value Objects e Repository Contracts de `Sales` sem depender de infraestrutura real onde um teste unitário for suficiente (mesmo padrão de `Identity`/`Organization`/`Audit`).

## Allowed Dependencies

`node:test`/`node:assert` (padrão já usado no monorepo); `domain/`, `application/`, `infrastructure/` (o que estiver sendo testado).

## Forbidden Dependencies

Nenhuma — testes podem depender de qualquer camada que estejam validando, mas nunca o inverso (nenhuma camada de produção depende de `tests/`).

## Implementation Status

🟡 `domain/repositories/` implementado (Missão ENG-0052): 14 testes de contrato de Repository, via `InMemoryOpportunityRepository`/`InMemoryPipelineRepository` (`infrastructure/`, `ENG-0050`) — ver [tests/domain/repositories/README.md](domain/repositories/README.md). `domain/aggregates/opportunity/` implementado (Missão ENG-0053): 24 testes unitários do Aggregate `Opportunity` — ver [tests/domain/aggregates/opportunity/README.md](domain/aggregates/opportunity/README.md). `domain/aggregates/pipeline/` implementado (Missão ENG-0054): 21 testes unitários do Aggregate `Pipeline` e da Entity `Stage` — ver [tests/domain/aggregates/pipeline/README.md](domain/aggregates/pipeline/README.md). `domain/entities/proposal/` implementado (Missão ENG-0055): 16 testes unitários isolados da Entity `Proposal` — ver [tests/domain/entities/proposal/README.md](domain/entities/proposal/README.md). `domain/entities/stage/` implementado (Missão ENG-0056): 14 testes unitários isolados da Entity `Stage` — ver [tests/domain/entities/stage/README.md](domain/entities/stage/README.md). **Cobertura unitária isolada do Domain Layer de `Sales` encerrada** — `Opportunity`, `Pipeline`, `Proposal` e `Stage` têm suíte própria.

`application/handlers/` implementado (Missão ENG-0073): 28 testes de orquestração dos 6 Handlers da Application Layer (`CreateOpportunityHandler`, `AdvanceOpportunityStageHandler`, `SubmitProposalHandler`, `ApproveProposalHandler`, `MarkOpportunityWonHandler`, `MarkOpportunityLostHandler`) — um arquivo por Handler em `tests/application/handlers/<nome>/`. Objetivo: validar a orquestração (Command → Handler → Repository interface → Aggregate → `save()`), nunca uma regra de negócio própria — toda regra permanece exclusivamente no Domain Layer, já coberto acima. Padrão usado: `node:test`/`node:assert`, mesmo runner do Domain Layer; nenhum framework de teste externo (Jest/Vitest), nenhuma biblioteca de mock. Cada arquivo define seu próprio `FakeOpportunityRepository` local (Fake em memória, não compartilhado entre arquivos, não é entregável de produção) — diferente da suíte de contrato de Repository (`ENG-0052`, que exercita a `InMemoryOpportunityRepository` real), esta suíte isola a orquestração do Handler de qualquer Infrastructure real. Cobertura por Handler: `CreateOpportunityHandler` (7 testes), `AdvanceOpportunityStageHandler` (4), `SubmitProposalHandler` (4), `ApproveProposalHandler` (5), `MarkOpportunityWonHandler` (4), `MarkOpportunityLostHandler` (4).

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Corresponde à camada `Tests` de `§ 12 (Future Implementation Order)` de [`SALES_TECHNICAL_BLUEPRINT.md`](../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md), última fase da ordem recomendada.

`infrastructure/repositories/` implementado (Fase "Sales de ponta a ponta", pós-`ENG-0119`): 6 testes de **integração real**, contra o Postgres real (Supabase), via `PrismaOpportunityRepository`/`PrismaPipelineRepository` (`@novaris/database`) — ver [tests/infrastructure/repositories/](infrastructure/repositories/). Diferente de todas as suítes acima (100% em memória/tempo de compilação), esta suíte cria, lê, atualiza e apaga (soft delete) linhas reais, e limpa tudo que cria em `after()`. Requer `packages/database/.env` com `DATABASE_URL`/`DIRECT_URL` reais — carregado automaticamente por `@novaris/database`.

## Status

🟢 Estrutura criada (Missão ENG-0037). 14 testes em `domain/repositories/` (Missão ENG-0052). 24 testes em `domain/aggregates/opportunity/` (Missão ENG-0053). 21 testes em `domain/aggregates/pipeline/` (Missão ENG-0054). 16 testes em `domain/entities/proposal/` (Missão ENG-0055). 14 testes em `domain/entities/stage/` (Missão ENG-0056). 28 testes em `application/handlers/` (Missão ENG-0073). 6 testes de integração real em `infrastructure/repositories/` (Fase "Sales de ponta a ponta"). Total: 123 testes, todos passando.

| Camada | Testes | Status |
|---|---|---|
| Domain (Aggregates + Entities) | 75 | 🟢 100% cobertura unitária isolada (`Opportunity` 24, `Pipeline` 21, `Proposal` 16, `Stage` 14) |
| Domain (Repository Contracts) | 14 | 🟢 `OpportunityRepository`/`PipelineRepository`, via implementação real (`InMemoryOpportunityRepository`/`InMemoryPipelineRepository`) |
| Application (Handlers) | 28 | 🟢 6 de 6 Handlers cobertos, via Fake Repository local |
| Infrastructure (Integração real) | 6 | 🟢 `PrismaOpportunityRepository`/`PrismaPipelineRepository`, contra Postgres real (Supabase) |
| **Total** | **123** | 🟢 123/123 passando |
