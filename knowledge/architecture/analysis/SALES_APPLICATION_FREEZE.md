# Sales — Application Freeze

Versão: 1.0.0

Status: 🟢 Application Layer formalmente congelada

Missão: ENG-0077 (Sales Application Freeze)

Escopo: registrar formalmente o congelamento arquitetural da Application Layer do Sales Domain, implementada entre `ENG-0059` e `ENG-0076` e já verificada por `SALES_APPLICATION_COMPLETION_AUDIT.md` (`ENG-0075`, `APPLICATION VERIFIED`) e pelo Architecture Review Gate (`ENG-0076`, `ARG PASS`, 12/12 critérios). Esta missão **não implementa código, não cria teste, não altera Command, Handler, Aggregate, Entity, Repository, Infrastructure, README da Application, `package.json`, `DOMAIN_MODEL.md`, nenhum ADR ou nenhuma Blueprint**. É o equivalente direto, para a Application Layer, do Freeze já registrado para o Shared Kernel (confirmado por 3 reutilizações empíricas independentes, `ADR-0019 § Evidence`) e para o Domain Layer (`ENG-0058`, ARG PASS).

**Verify Before Reimplementing**: confirmado, antes de escrever qualquer linha, que nenhum documento de Freeze equivalente para uma Application Layer já existe em todo o repositório (busca direta: apenas `IDENTITY_AGGREGATE_DESIGN_FREEZE.md`, `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md`, `AUDIT_AGGREGATE_DESIGN_FREEZE.md` e `IDENTITY_DESIGN_FREEZE.md` existem, todos sobre Domain Layer/Aggregate Design, nenhum sobre Application Layer) — nenhuma duplicação.

---

## 1. Objetivo

Declarar formalmente que a Application Layer do Sales Domain — 6 Commands, 6 Handlers, 28 testes de orquestração — está **congelada**: nenhuma alteração em sua estrutura, comportamento, regras arquiteturais ou dependências pode ocorrer sem uma nova ADR ou Ordem de Missão explícita que cite este documento. O Freeze não impede evolução — impede que a evolução ocorra silenciosamente, sem registro e sem revisão, mesmo princípio já aplicado ao Shared Kernel e ao Domain Layer desta engenharia.

## 2. Escopo Congelado

### Commands (6)
- `CreateOpportunityCommand` (`ENG-0059`)
- `AdvanceOpportunityStageCommand` (`ENG-0061`)
- `SubmitProposalCommand` (`ENG-0063`)
- `ApproveProposalCommand` (`ENG-0065`)
- `MarkOpportunityWonCommand` (`ENG-0067`)
- `MarkOpportunityLostCommand` (`ENG-0069`)

### Handlers (6)
- `CreateOpportunityHandler` (`ENG-0060`)
- `AdvanceOpportunityStageHandler` (`ENG-0062`)
- `SubmitProposalHandler` (`ENG-0064`)
- `ApproveProposalHandler` (`ENG-0066`)
- `MarkOpportunityWonHandler` (`ENG-0068`)
- `MarkOpportunityLostHandler` (`ENG-0070`)

### Queries
**Nenhuma implementada.** `application/queries/` permanece vazio — nenhuma Query foi nomeada por `SALES_TECHNICAL_BLUEPRINT.md` ou por qualquer Discovery anterior. O Freeze não cria uma Query inexistente; registra corretamente sua ausência.

## 3. Estrutura Congelada

```
services/domains/sales/application/
├── README.md
├── commands/
│   ├── README.md
│   ├── create-opportunity/create-opportunity.command.ts
│   ├── advance-opportunity-stage/advance-opportunity-stage.command.ts
│   ├── submit-proposal/submit-proposal.command.ts
│   ├── approve-proposal/approve-proposal.command.ts
│   ├── mark-opportunity-won/mark-opportunity-won.command.ts
│   └── mark-opportunity-lost/mark-opportunity-lost.command.ts
├── handlers/
│   ├── README.md
│   ├── create-opportunity/create-opportunity.handler.ts
│   ├── advance-opportunity-stage/advance-opportunity-stage.handler.ts
│   ├── submit-proposal/submit-proposal.handler.ts
│   ├── approve-proposal/approve-proposal.handler.ts
│   ├── mark-opportunity-won/mark-opportunity-won.handler.ts
│   └── mark-opportunity-lost/mark-opportunity-lost.handler.ts
└── queries/
    └── README.md   (vazio)

services/domains/sales/tests/application/handlers/
├── create-opportunity/create-opportunity.handler.test.ts        (7 testes)
├── advance-opportunity-stage/advance-opportunity-stage.handler.test.ts (4 testes)
├── submit-proposal/submit-proposal.handler.test.ts               (4 testes)
├── approve-proposal/approve-proposal.handler.test.ts             (5 testes)
├── mark-opportunity-won/mark-opportunity-won.handler.test.ts     (4 testes)
└── mark-opportunity-lost/mark-opportunity-lost.handler.test.ts   (4 testes)
```

`contracts/` permanece vazio — fora do escopo deste Freeze, fase futura autorizada (§ 9).

## 4. Regras Arquiteturais Congeladas

**Commands**:
- Imutáveis — todo campo `readonly`.
- Congelados em runtime — `Object.freeze(this)` ao fim de todo construtor.
- Campos exclusivamente primitivos (`string`) — nunca `UniqueEntityId` ou qualquer tipo de domínio.
- Zero lógica, zero validação, zero import de `domain/`, `infrastructure/` ou `@novaris/shared-kernel` (4 dos 6 Commands têm zero import algum; os outros 2 seguem a mesma disciplina de não depender de camada inferior).

**Handlers**:
- Um único Repository injetado via construtor (`OpportunityRepository`) — nunca instanciado internamente, nunca via Factory ou Service Locator.
- Conversão `string → UniqueEntityId` é a única lógica própria permitida.
- Delegação total ao Aggregate — exatamente 1 método público de `Opportunity` chamado por `execute()`.
- Persistência exclusivamente via `OpportunityRepository.save()` — nunca acesso direto a Mapper, Record ou Infrastructure concreta.

## 5. Rule Ownership Freeze

**0% Application, 100% Aggregate.** Toda regra de negócio do Sales Domain reside exclusivamente em `Opportunity`/`Proposal` (`domain/aggregates/`, `domain/entities/`). Nenhum Handler valida, decide ou infere regra de negócio própria — confirmado por `SALES_APPLICATION_COMPLETION_AUDIT.md § 7` (tabela Handler→método do Aggregate responsável) e reconfirmado pelo ARG (`ENG-0076`, critério 6).

**A partir deste Freeze, nenhuma regra de negócio pode migrar para a Application Layer sem uma nova ADR** que explicitamente revise este documento.

## 6. Dependency Freeze

Permanece proibido, sem exceção, em `services/domains/sales/application/`:

`Prisma`, `ORM`, `HTTP`, `Express`, `NestJS`, `Controller`, `Queue`, `Mediator`, `CommandBus`, `EventBus`, `Service Locator`, qualquer framework externo, qualquer driver de banco de dados.

Confirmado por `SALES_APPLICATION_COMPLETION_AUDIT.md § 6` e pelo ARG (`ENG-0076`, critério 8) — zero ocorrência real de qualquer um destes em código, hoje.

## 7. Repository Boundary Freeze

A Application Layer depende exclusivamente das interfaces `OpportunityRepository`/`PipelineRepository` (`domain/repositories/`) — nunca de `InMemoryOpportunityRepository`/`InMemoryPipelineRepository` ou de qualquer implementação concreta futura. Este limite permanece congelado independentemente de qual tecnologia de persistência real venha a substituir a implementação interina em memória.

## 8. Shared Kernel Freeze

Reutilização obrigatória e exclusiva, sem reimplementação, de: `Result`, `Option`, `UniqueEntityId`, e a hierarquia de erros do Shared Kernel (`NotFoundError`, `DomainError`, `ConflictError` — este último apenas via propagação do Aggregate, nunca instanciado na Application Layer). Nenhum tipo equivalente pode ser criado dentro de `services/domains/sales/application/` — mesma regra já congelada para o Domain Layer, agora explicitamente estendida à Application Layer.

## 9. Evolução Futura Autorizada

Podem ser adicionados, sem reabrir este Freeze:
- Novos Commands (ex.: para `Quotation`/`Contract`/`Revenue`, quando essas decisões de domínio forem resolvidas).
- Novos Handlers correspondentes.
- Novas Queries (nenhuma nomeada até hoje).

**Condição**: nenhuma adição pode alterar os 6 Commands ou 6 Handlers já congelados (§ 2). Se uma adição futura exigir alterar um artefato já congelado, isso só pode ocorrer mediante: nova ADR + nova Ordem de Missão explícita + nova auditoria de conformidade (mesmo padrão de 3 camadas de aprovação já usado para o Domain Layer).

## 10. Alterações Proibidas

Exigem obrigatoriamente uma nova ADR antes de qualquer execução:
- Qualquer alteração nos 6 Commands ou 6 Handlers já implementados.
- Qualquer alteração na Repository Boundary (§ 7).
- Qualquer alteração no Rule Ownership (§ 5) — mover regra de negócio para a Application Layer.
- Qualquer alteração na Dependency Rule (§ 6) — introduzir framework, banco ou biblioteca externa.
- Qualquer alteração no Result Pattern (nunca lançar exceção, nunca adaptar erro).
- Qualquer alteração na Aggregate Delegation (Handler chamando mais de um método do Aggregate, ou decidindo por si).

## 11. Estado da Camada

**Application Freeze**

Status: **CONGELADA**

## 12. Linha do Tempo

```
ENG-0059 (primeiro Command)
  ↓
ENG-0060 → ENG-0070 (6 Commands + 6 Handlers implementados)
  ↓
ENG-0071 (Application Layer Readiness Audit)
  ↓
ENG-0072 (Documentation Sync)
  ↓
ENG-0073 (28 testes de orquestração)
  ↓
ENG-0074 (Test Inventory Sync)
  ↓
ENG-0075 (Sales Application Completion Audit — APPLICATION VERIFIED)
  ↓
ENG-0076 (Architecture Review Gate — ARG PASS, 12/12)
  ↓
ENG-0077 — FREEZE (este documento)
  ↓
[futuro, não autorizado por este documento] Contracts
  ↓
[futuro] Controllers
  ↓
[futuro] API
```

## 13. Conclusão

Declara-se formalmente encerrada a engenharia da **primeira versão** da Application Layer do Sales Domain. Os 6 Commands, 6 Handlers e sua suíte de 28 testes constituem uma unidade arquitetural estável, verificada (`ENG-0075`) e aprovada em Gate formal (`ENG-0076`) — a partir deste documento, congelada. Qualquer evolução futura segue as regras de §§ 9-10, nunca uma alteração silenciosa.

---

## Domain Model Validation

- Entity criada? **NÃO.**
- Aggregate criado? **NÃO.**
- Value Object criado? **NÃO.**
- Domain Event criado? **NÃO.**
- Nova regra criada? **NÃO.**
- Repository alterado? **NÃO.**
- Infrastructure alterada? **NÃO.**

## Validações

- **Link Checker** (`-Root` explícito): ver ENG-0077 FINAL REPORT.
- **Build/Lint/Test**: ver ENG-0077 FINAL REPORT — nenhum código alterado por esta missão, validações confirmam que o estado herdado de `ENG-0076` permanece íntegro.

## Relação com Outros Módulos

- [SALES_APPLICATION_COMPLETION_AUDIT.md](SALES_APPLICATION_COMPLETION_AUDIT.md) (ENG-0075, atualizado ENG-0076) — base de evidência integral deste Freeze, incluindo a seção "Architecture Review Gate (ARG)"
- [SALES_DOMAIN_COMPLETION_AUDIT.md](SALES_DOMAIN_COMPLETION_AUDIT.md) (ENG-0057) — Freeze equivalente do Domain Layer, precedente de forma
- [../../../adr/ADR-0019-architecture-freeze.md](../../../adr/ADR-0019-architecture-freeze.md) — precedente do conceito de "Freeze with documented exceptions", aplicado aqui à Application Layer
- [services/domains/sales/application/](../../../services/domains/sales/application/README.md), [services/domains/sales/tests/application/](../../../services/domains/sales/tests/README.md) — código e testes reais, escopo integral deste Freeze

## Status

🟢 Application Freeze declarado (Missão ENG-0077). Nenhum código, teste, Command, Handler, Aggregate, Entity, Repository, Infrastructure, ADR ou Blueprint criado/alterado. Estado: **CONGELADA**. Aguardando aprovação formal do CTO.
