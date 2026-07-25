# Sales — Contracts Freeze

Versão: 1.0.0

Status: 🟢 Contracts Layer formalmente congelada

Missão: ENG-0087 (Sales Contracts Freeze)

Escopo: registrar formalmente o congelamento arquitetural da Contracts Layer do Sales Domain, implementada entre `ENG-0078` e `ENG-0086` — 1 Request DTO, 1 Response DTO, 1 Barrel local, 1 Root Barrel — já verificada por `SALES_CONTRACTS_COMPLETION_AUDIT.md` (`ENG-0084`, `CONTRACTS VERIFIED WITH CONDITIONS`), com sua única divergência resolvida por `SALES_CONTRACTS_ALIGNMENT_DECISION.md` (`ENG-0085`), e aprovada em Gate formal por `SALES_CONTRACTS_ARCHITECTURE_GATE.md` (`ENG-0086`, `CONTRACTS ARG PASS`, 8/8 critérios). Esta missão **não implementa código, não cria DTO, Request, Response, Contract, Handler, Command, Aggregate, Entity, Repository, Mapper, Record, Controller, API, teste, Query, Factory ou Service**. É o equivalente direto, para a Contracts Layer, do Freeze já registrado para a Application Layer (`SALES_APPLICATION_FREEZE.md`, `ENG-0077`).

**Verify Before Reimplementing**: busca executada, antes de escrever qualquer linha, por "Contracts Freeze", "Freeze", "Architecture Freeze", "Contracts Layer Freeze", "Public API Freeze" em todo o repositório — nenhum `SALES_CONTRACTS_FREEZE.md` prévio, nenhuma duplicação. **Achado registrado, não silencioso**: a Ordem de Missão cita `SALES_DOMAIN_FREEZE.md` como precedente de qualidade — esse documento **não existe** no repositório (confirmado por busca direta); o Domain Layer nunca recebeu um documento de Freeze próprio e persistido — sua auditoria (`SALES_DOMAIN_COMPLETION_AUDIT.md`, `ENG-0057`) e seu ARG (`ENG-0058`) foram entregues, este último, apenas como relatório de conversa, nunca como arquivo. O precedente estrutural real e persistido usado aqui é `SALES_APPLICATION_FREEZE.md` (`ENG-0077`), citado corretamente pela mesma Ordem de Missão.

---

## 1. Objetivo do Freeze

Declarar formalmente que a Contracts Layer do Sales Domain — `CreateOpportunityRequest`, `CreateOpportunityResponse`, e seus 2 barrels — está **congelada**: nenhuma alteração em sua estrutura, campos, regras arquiteturais ou dependências pode ocorrer sem uma nova ADR, nova Ordem de Missão explícita, nova Auditoria e novo ARG. O Freeze não impede a expansão para os 5 casos de uso restantes — impede que essa expansão, ou qualquer alteração ao que já existe, ocorra silenciosamente.

## 2. Escopo Congelado

- **Request DTOs**: `CreateOpportunityRequest`.
- **Response DTOs**: `CreateOpportunityResponse`.
- **Exports/Barrels**: `create-opportunity/index.ts` (Barrel local), `contracts/index.ts` (Root Barrel).
- **Naming Convention**: `SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 12` (pastas `kebab-case` sob `contracts/<use-case>/`, sufixos `Request`/`Response`/`Error`).
- **Dependency Rule**: `Contracts → Application → Domain → Shared Kernel`, nunca o contrário.
- **DTO Philosophy**: DTO não é Entity, não é Aggregate, não conhece Domain além do vocabulário mínimo de nomeação.
- **Rule Ownership**: 0% Contracts, 100% Aggregate.
- **Estrutura de diretórios**: `contracts/<use-case>/` como padrão oficial (`SALES_CONTRACTS_ALIGNMENT_DECISION.md`, `ENG-0085`) — `contracts/api/` preservada, reservada para evolução futura por protocolo, não removida.

## 3. Arquitetura Congelada

```
Cliente
  ↓
API                (transporte — ainda não implementado)
  ↓
Contracts          (esta camada — CONGELADA)
  ↓
Application        (congelada, ENG-0077)
  ↓
Domain              (congelado, ENG-0058)
  ↓
Repository          (congelado, ENG-0045)
  ↓
Infrastructure      (interina, ENG-0050)
```

Reafirmação literal de `SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 2` — nenhuma camada pula a seguinte, nenhuma dependência inversa é permitida.

## 4. Dependency Freeze

**Permitido, sem exceção**: `domain/` (apenas tipos públicos para nomear campo, nunca comportamento — hoje nem isso é usado, os 2 DTOs existentes têm zero import); barrels de subpasta (Root Barrel → Barrel local).

**Proibido, sem exceção, reafirmado de `SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 5` e confirmado por `ENG-0086` critério 4**: `Prisma`, `ORM`, `HTTP`, `Express`, `NestJS`, `Controller`, `Queue`, `Mediator`, `CommandBus`, `EventBus`, `Service Locator`, qualquer framework externo, qualquer driver de banco, `Repository` concreto, `Mapper`, `Record`, `Infrastructure`, tipos do Shared Kernel (`Result`/`Option`/`UniqueEntityId`/hierarquia de erros) importados diretamente em um DTO público.

## 5. DTO Freeze

Todo DTO da Contracts Layer (`CreateOpportunityRequest`, `CreateOpportunityResponse`, e todo futuro Request/Response):
- **Não possui regra** — zero validação, zero cálculo, zero decisão.
- **Não conhece domínio** — nenhum import de `domain/`, nenhum tipo de domínio (`UniqueEntityId`, `Opportunity`) em sua assinatura.
- **Não conhece infraestrutura** — nenhum import de `infrastructure/`, `Repository` ou `Mapper`.
- **Não possui comportamento** — é sempre uma `interface` pura, nunca uma classe com método, construtor ou lógica.

## 6. Contracts Freeze

Contracts representam exclusivamente a API pública do Sales Domain — nunca comportamento interno. Nenhum Contract pode expor `Aggregate`, `Entity`, `Domain Event`, dado de `Repository`/`Infrastructure`, ou qualquer campo que o Aggregate correspondente não exponha publicamente hoje (`CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md §§ 3-4, 7`).

## 7. Rule Ownership Freeze

**0% Contracts, 100% Aggregate.** Confirmado por `SALES_CONTRACTS_COMPLETION_AUDIT.md § 8` e reconfirmado por `ENG-0086` critério 5 — nenhuma regra de negócio pode migrar para a Contracts Layer sem nova ADR que explicitamente revise este Freeze.

## 8. Shared Kernel Freeze

Reafirmação literal de `SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 13`: `Result`, `Option`, `UniqueEntityId` e a hierarquia de erros do Shared Kernel **nunca atravessam a fronteira da Contracts Layer** — todo id trafega como `string`, toda falha é traduzida para um Error DTO próprio (quando implementado), nunca a classe de erro do Shared Kernel é reexportada diretamente.

## 9. Artefatos Congelados (Inventário)

| Artefato | Arquivo | Missão |
|---|---|---|
| `CreateOpportunityRequest` | `contracts/create-opportunity/create-opportunity.request.ts` | ENG-0079 |
| `CreateOpportunityResponse` | `contracts/create-opportunity/create-opportunity.response.ts` | ENG-0081 |
| Barrel local | `contracts/create-opportunity/index.ts` | ENG-0082 |
| Root Barrel | `contracts/index.ts` | ENG-0083 |

Documentos normativos congelados junto: `SALES_CONTRACTS_LAYER_ARCHITECTURE.md` (ENG-0078, corrigida ENG-0085), `CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md` (ENG-0080), `SALES_CONTRACTS_COMPLETION_AUDIT.md` (ENG-0084), `SALES_CONTRACTS_ALIGNMENT_DECISION.md` (ENG-0085), `SALES_CONTRACTS_ARCHITECTURE_GATE.md` (ENG-0086, `CONTRACTS ARG PASS`).

## 10. Critérios para Alteração Futura

Qualquer alteração em `Request`, `Response`, `Contract`, `Exports`, `Naming` ou `Barrels` já congelados exige, obrigatoriamente e em conjunto: **nova ADR** + **nova Ordem de Missão explícita** + **nova Auditoria de conformidade** + **novo ARG**. Nenhuma dessas quatro etapas pode ser pulada — mesmo padrão de 4 camadas de aprovação já exigido para alterações ao Application Freeze (`SALES_APPLICATION_FREEZE.md § 9`).

## 11. Roadmap Futuro

Próxima fase autorizada por este Freeze: expansão da Contracts Layer para os 5 casos de uso restantes (`AdvanceOpportunityStage`, `SubmitProposal`, `ApproveProposal`, `MarkOpportunityWon`, `MarkOpportunityLost` — mesmo padrão Request→Response Specification→Response→Barrel já demonstrado). A **API Layer** (Controllers, endpoints HTTP) permanece a fase seguinte à conclusão dos 6 Contracts, não autorizada por este documento — exigirá sua própria arquitetura, mesma disciplina já aplicada à Contracts Layer em `ENG-0078`.

## 12. Status Final

**Contracts Layer**

Status: **ARCHITECTURALLY FROZEN**

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

- [SALES_CONTRACTS_LAYER_ARCHITECTURE.md](SALES_CONTRACTS_LAYER_ARCHITECTURE.md) (ENG-0078, corrigida ENG-0085) — base normativa integral deste Freeze
- [SALES_CONTRACTS_COMPLETION_AUDIT.md](SALES_CONTRACTS_COMPLETION_AUDIT.md) (ENG-0084), [SALES_CONTRACTS_ALIGNMENT_DECISION.md](SALES_CONTRACTS_ALIGNMENT_DECISION.md) (ENG-0085), [SALES_CONTRACTS_ARCHITECTURE_GATE.md](SALES_CONTRACTS_ARCHITECTURE_GATE.md) (ENG-0086) — cadeia de evidência completa
- [SALES_APPLICATION_FREEZE.md](SALES_APPLICATION_FREEZE.md) (ENG-0077) — precedente estrutural direto, mesmo formato
- [services/domains/sales/contracts/](../../../services/domains/sales/contracts/README.md) — código real, escopo integral deste Freeze

## Status

🟢 Contracts Freeze declarado (Missão ENG-0087). Nenhum código, DTO, Request, Response, Contract, Handler, Command, Aggregate, Entity, Repository, Mapper, Controller, API, teste ou Blueprint existente criado/alterado. Estado: **ARCHITECTURALLY FROZEN**. Aguardando aprovação formal do CTO.
