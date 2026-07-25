# Sales — Implementation Readiness Audit

Versão: 1.0.0

Status: 🟢 Oficial — auditoria de prontidão, sem código, sem nova decisão de domínio

Missão: ENG-0047 (Sales Implementation Readiness Audit) — gate de Fase 3/4 de `KERNEL_DOMAIN_LIFECYCLE_V2.md`

Escopo: auditar, sem produzir nenhuma decisão nova, se o Sales Domain está pronto para uma implementação real de Infrastructure (Schema, Mapper, Repository concreto, Application Layer). Consolida exclusivamente o que já foi decidido, implementado ou explicitamente bloqueado nas missões anteriores (`ENG-0032`–`ENG-0046`). Nenhum código, Entity, Value Object, Repository concreto, Mapper, Schema, Migration, teste, Command ou Handler foi criado. Nenhum documento existente foi alterado, exceto o inventário de `analysis/README.md`.

**Regra de método**: toda afirmação abaixo cita a seção exata do documento-fonte ou o arquivo de código real de onde vem. Nenhuma lacuna identificada é preenchida por inferência — cada uma recebe classificação **READY**, **BLOCKED** ou **NEEDS DECISION**, herdada das missões anteriores, nunca inventada aqui.

---

## 1. Executive Summary

O Sales Domain tem **dois Aggregates totalmente implementados e conectados** — `Opportunity` (`create()`/`markWon()`/`markLost()`/`advanceStage()`/`addProposal()`/`findProposal()`/`getProposals()`/`approveProposal()`, `opportunity.ts`, `ENG-0039`/`ENG-0044`) e `Pipeline` (`create()`/`addStage()`/`findStage()`/`getStages()`, `pipeline.ts`, `ENG-0041`/`ENG-0043`) — com suas Internal Entities (`Proposal`, `proposal.ts`, `ENG-0040`; `Stage`, `stage.ts`, `ENG-0042`), 4 Domain Events implementados (`OpportunityCreated`/`Won`/`Lost`, `ProposalApproved`), Repository Contracts sem método próprio (`ENG-0045`) e um Blueprint de persistência completo (`ENG-0046`).

Ao mesmo tempo, **uma parte substancial do domínio permanece formalmente bloqueada** desde a própria Discovery (`SALES_DOMAIN_DISCOVERY.md`) e o Aggregate Design (`SALES_AGGREGATE_DESIGN.md § 13`): a forma de `Quotation`/`Contract`/`Revenue`, a referência a `User`/`Task`/`Activity` em `Opportunity`, a ordem de `Stage` dentro de `Pipeline`, e o payload de todo Domain Event (pendência de plataforma). Nenhuma dessas lacunas é resolvida por esta auditoria.

**Decisão desta auditoria: READY WITH CONDITIONS** (§ 7) — pronto para implementar Infrastructure real exclusivamente sobre o subconjunto já implementado; explicitamente não pronto para o restante.

## 2. Domain Boundary Audit

| Item | Status | Fonte |
|---|---|---|
| `Sales` continua Business Domain válido | ✅ **READY** | `DOMAIN_MODEL.md § SALES DOMAIN`; confirmado ativo em `NOVARIS_PLATFORM_ARCHITECTURE.md § 7`; camada macro congelada por `ADR-0019` |
| Nenhum conflito com `CRM`/Product Layer | ✅ **READY** | `ADR-0011`: `CRM` é Product Layer, nunca Bounded Context; `Sales` é um dos domínios que o compõe (`PRODUCT_DOMAIN_ARCHITECTURE.md § 4`, `CRM → Customer + Sales + Activity`) — nenhuma sobreposição de Ownership |
| Nenhuma dependência proibida | ✅ **READY** | Toda referência externa de `Opportunity`/`Pipeline` é por id (`organizationId`, `partyId`, `pipelineId`, `currentStageId`) — confirmado por leitura direta de `opportunity.ts`/`pipeline.ts`; nenhum import de Infrastructure, Application ou outro domínio além de tipos (`Proposal`/`Stage`, mesmo domínio) |

**Conclusão da seção**: fronteira de domínio íntegra, sem nenhum achado novo.

## 3. Aggregate Completeness Audit

### Opportunity

| Item | Status | Fonte |
|---|---|---|
| Aggregate Root | ✅ **READY** | `opportunity.ts` (`ENG-0039`) — `extends AggregateRoot<OpportunityProps>`, `Result<T, DomainError>`, zero setter público |
| `Proposal` (Internal Entity, wiring) | ✅ **READY** | `addProposal()`/`findProposal()`/`getProposals()`/`approveProposal()` (`ENG-0044`) — coleção interna, cópia defensiva, `Proposal` nunca publica evento |
| Events (`OpportunityCreated`/`Won`/`Lost`/`ProposalApproved`) | ✅ **READY** estruturalmente / ⚠️ **NEEDS DECISION** (payload) | 4 eventos implementados (`domain/events/`); payload de negócio **ausente em todos** — pendência de plataforma (`ADR-0019 § Evidence`), não específica de `Sales` |
| References (`organizationId`, `partyId`, `pipelineId`, `currentStageId`) | ✅ **READY** | Todas por id, implementadas em `OpportunityProps` |
| Referência a `User` (dono da oportunidade) | ❌ **BLOCKED** | `SALES_AGGREGATE_DESIGN.md § 8`: "candidato, nenhuma fonte nomeia o campo explicitamente" — não implementado, TODO no código |
| Referência a `Task`/`Activity` | ❌ **BLOCKED** | Forma de referência não definida (`SALES_AGGREGATE_DESIGN.md § 8`) — não implementado |
| `Quotation`/`Contract`/`Revenue` | ❌ **BLOCKED** | `Needs Evidence` (`ADR-0020`, `SALES_AGGREGATE_DESIGN.md § 3`) — nenhuma forma estrutural, não implementado |

### Pipeline

| Item | Status | Fonte |
|---|---|---|
| Aggregate Root | ✅ **READY** | `pipeline.ts` (`ENG-0041`) — Configuration Aggregate, `ADR-0021` |
| `Stage` (Internal Entity, wiring) | ✅ **READY** | `addStage()`/`findStage()`/`getStages()` (`ENG-0043`) — coleção interna, cópia defensiva, `Stage` nunca publica evento |
| Configuration nature | ✅ **READY** | Confirmada: mutação rara, sem transação de negócio, sem Domain Event (`ADR-0021`; nenhum `PipelineCreated` existe) |
| Ordem/posição de `Stage` | ❌ **NEEDS DECISION** | Nenhum campo `order`/`position` existe (`stage.ts`); array em memória ou campo persistido não decidido (`SALES_AGGREGATE_DESIGN.md § 13`) |
| Nome/label do `Pipeline` | ❌ **BLOCKED** | Nenhuma fonte define campo de identificação textual (`SALES_AGGREGATE_DESIGN.md § 13`) |

**Conclusão da seção**: ambos os Aggregates estão prontos para persistência **exatamente nos comportamentos e campos já implementados**. Nenhum método/campo bloqueado tem — ou pode ter — Infrastructure implementada até que a decisão correspondente exista.

## 4. Repository Readiness Audit

| Item | Status | Fonte |
|---|---|---|
| `OpportunityRepository extends ReadRepository<Opportunity>, WriteRepository<Opportunity>` | ✅ **READY** | `opportunity-repository.ts` (`ENG-0045`), zero método próprio |
| `PipelineRepository extends ReadRepository<Pipeline>, WriteRepository<Pipeline>` | ✅ **READY** | `pipeline-repository.ts` (`ENG-0045`), zero método próprio |
| Ausência de queries inventadas | ✅ **READY** | Confirmado: nenhum `findByCustomer`/`findByStage`/`findByPipeline`/`findByStatus` existe — `ENG-0045` os rejeitou explicitamente por ausência de fonte |
| Aggregate Boundary respeitada | ✅ **READY** | Nenhum Repository para `Proposal`/`Stage` (Internal Entities) — confirmado, `ENG-0045` |
| Suíte de testes de contrato | ❌ **BLOCKED** | Não criada — fora do escopo de toda missão de `Sales` até agora; nenhuma restrição impede, mas nenhuma missão a executou |

**Conclusão da seção**: os dois contratos de Repository estão **totalmente prontos** para uma implementação concreta seguir literalmente — nenhuma decisão pendente do lado do contrato em si, exceto a ausência (não bloqueio) de uma suíte de testes de contrato.

## 5. Persistence Readiness Audit

| Item | Status | Fonte |
|---|---|---|
| Todos os campos possuem origem citada | ✅ **READY** | `SALES_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 4-7` — cada campo de `Opportunity`/`Pipeline`/`Proposal`/`Stage` cita `opportunity.ts`/`pipeline.ts`/`proposal.ts`/`stage.ts` diretamente |
| Campos bloqueados identificados | ✅ **READY** (como registro) | `SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 14` (Fora do Escopo) — `Revenue`, `Quotation`/`Contract`, referências de `User`/`Task`/`Activity`, ordem de `Stage` |
| `OpportunityMapper`/`PipelineMapper` definidos conceitualmente | ✅ **READY** | `SALES_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 10-11` — `toPersistence()`/`toDomain()`, sem assinatura final, sem regra de negócio |
| `ProposalRecord`/`StageRecord` (linha própria vs. embutido) | ❌ **NEEDS DECISION** | `SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 12` — decisão de tecnologia, deliberadamente fora de escopo até agora |
| Tratamento de dado inválido/corrompido no Mapper | ❌ **NEEDS DECISION** | Não abordado em nenhum documento de `Sales` — mesma lacuna já identificada para `Organization` (`ORGANIZATION_IMPLEMENTATION_READINESS.md § 5`), nunca resolvida aqui |

**Conclusão da seção**: a fronteira de persistência é segura para o subconjunto de campos já implementado — nenhum campo de nenhum Blueprint "vazou" para uma expectativa de persistência sem estar realmente implementado no Aggregate.

## 6. Application Readiness Audit

| Item | Status | Fonte |
|---|---|---|
| `CreateOpportunity` pode ser definido | ✅ **READY** | Mapeia 1:1 para `Opportunity.create()`, já implementado |
| `AdvanceOpportunityStage` pode ser definido | ✅ **READY** | Mapeia 1:1 para `Opportunity.advanceStage()`, já implementado |
| `MarkOpportunityWon`/`MarkOpportunityLost` podem ser definidos | ✅ **READY** | Mapeiam 1:1 para `markWon()`/`markLost()`, já implementados |
| `ApproveProposal` pode ser definido | ✅ **READY** | Mapeia 1:1 para `Opportunity.approveProposal(proposalId)`, já implementado |
| `SubmitProposal` pode ser definido | ⚠️ **NEEDS DECISION** | **Achado desta auditoria**: nenhum método `submitProposal()` existe em `opportunity.ts` — o que existe é `addProposal(proposal: Proposal)`, que recebe uma `Proposal` **já construída** (via `Proposal.create()`, fora do Aggregate). Um Command `SubmitProposal` precisaria, hoje, orquestrar dois passos (`Proposal.create()` então `Opportunity.addProposal()`) na Application Layer — ou uma futura missão precisaria decidir se `Opportunity` ganha um método `submitProposal(input)` que constrói a `Proposal` internamente. Não decidido aqui. |
| Queries (leitura de `Opportunity`/`Pipeline`) | ❌ **NEEDS DECISION** | Nenhuma Query foi nomeada por nenhuma fonte (`SALES_TECHNICAL_BLUEPRINT.md` não lista Queries) — `application/queries/README.md` (`ENG-0037`) já registra isso como pasta sem decisão prévia |
| Handlers dependem de decisão ainda aberta? | ⚠️ **Sim, parcialmente** | Handlers de `CreateOpportunity`/`AdvanceOpportunityStage`/`MarkOpportunityWon`/`MarkOpportunityLost`/`ApproveProposal` podem ser implementados hoje sem decisão pendente; um Handler de `SubmitProposal` depende do achado acima; qualquer Handler que precise de payload de evento depende da pendência de plataforma (`ADR-0019 § Evidence`) |

**Conclusão da seção**: 5 dos 6 Commands candidatos podem ser implementados hoje sem nenhuma decisão pendente. `SubmitProposal` tem uma lacuna de design genuína, identificada por esta auditoria, não resolvida aqui.

## 7. Missing Decisions Register

Registro consolidado — nenhuma decisão nova, apenas agregação das lacunas já citadas:

| # | Decisão Pendente | Fonte do Bloqueio |
|---|---|---|
| 1 | Forma exata de `Quotation` (Entity, VO, documento externo) | `ADR-0020`; `SALES_AGGREGATE_DESIGN.md § 13` |
| 2 | Se `Contract` é estado terminal de `Opportunity` ou Aggregate/domínio subsequente | `SALES_AGGREGATE_DESIGN.md § 3` |
| 3 | Forma de campos de `Revenue` (moeda, precisão) | `SALES_AGGREGATE_DESIGN.md § 5` |
| 4 | Referência a `User` (dono da oportunidade) em `Opportunity` | `SALES_AGGREGATE_DESIGN.md § 8` |
| 5 | Forma de referência a `Task`/`Activity` em `Opportunity` | `SALES_AGGREGATE_DESIGN.md § 8` |
| 6 | Ordem/posição de `Stage` dentro de `Pipeline` | `SALES_AGGREGATE_DESIGN.md § 13`; `pipeline.ts` |
| 7 | Nome/label do `Pipeline` | `SALES_AGGREGATE_DESIGN.md § 13` |
| 8 | Mecanismo de criação/edição de `Pipeline` (quem pode, quando) | `ADR-0021 § Consequências` |
| 9 | `ProposalRecord`/`StageRecord` — linha própria vs. embutido | `SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 12` |
| 10 | Tratamento de dado inválido/corrompido no Mapper | Não abordado em nenhuma fonte de `Sales` |
| 11 | **(novo achado desta auditoria)** Desenho de `SubmitProposal` — orquestração em 2 passos vs. método único em `Opportunity` | `opportunity.ts` (`ENG-0044`) vs. `SALES_TECHNICAL_BLUEPRINT.md § 6` |
| 12 | Payload de todo Domain Event (`OpportunityCreated`/`Won`/`Lost`/`ProposalApproved`) | Pendência de plataforma, `ADR-0019 § Evidence` — não específica de `Sales` |

## 8. ADR Necessity Analysis

| # (§ 7) | Decisão | Exige ADR quando resolvida? |
|---|---|---|
| 1, 2, 3 | Forma de `Quotation`/`Contract`/`Revenue` | **Provável** — mesma categoria de `ADR-0020`/`ADR-0021`, decisões estruturais vinculantes para o domínio inteiro |
| 4, 5 | Referência a `User`/`Task`/`Activity` | **Não, provavelmente** — mesma categoria de decisão de modelagem de campo já resolvida sem ADR para outros domínios (ex.: campos de `Organization`) |
| 6, 7, 8 | Ordem de `Stage`, nome de `Pipeline`, mecanismo de edição | **Não** — decisões de modelagem tática de um Aggregate já classificado (`ADR-0021` já resolveu a natureza; isso é detalhe de implementação) |
| 9, 10 | Decisões de Mapper/Record | **Não** — resolvidas dentro de uma missão de implementação de Repository, mesmo critério já usado em `ORGANIZATION_IMPLEMENTATION_READINESS.md § 8` item 15 |
| 11 | Desenho de `SubmitProposal` | **Não** — decisão de Application Layer/Aggregate design tático, não uma decisão de arquitetura cross-domain |
| 12 | Payload de `DomainEvent` | **Provável** — decisão vinculante para toda a plataforma (Shared Kernel), não só `Sales`; mesma classe de `ADR-0010` |

## 9. Implementation Risks

1. **Persistir `Opportunity`/`Pipeline` sem resolver `SubmitProposal`** — uma implementação de Application Layer poderia inventar ad-hoc a orquestração de 2 passos, inconsistente entre desenvolvedores. Mitigação recomendada, não decidida aqui: documentar o padrão de 2 passos como interino até uma decisão explícita.
2. **Persistir `ProposalRecord`/`StageRecord` sem decidir linha própria vs. embutido** — decisão de tecnologia que, se tomada ad-hoc durante a implementação, pode divergir entre `Proposal` e `Stage` sem razão. Mitigação: decidir ambos juntos, mesma missão.
3. **Nenhum teste de contrato de Repository existe** — diferente de `Organization`, que teve `ENG-0003.10` dedicada. Risco de a implementação concreta (`ENG-0048`+) não ter uma suíte de referência para validar conformidade estrutural antes do Prisma/ORM real.
4. **Ausência de payload em todo Domain Event** — mesmo risco já registrado para toda a plataforma (`ADR-0019`); não específico de `Sales`, mas bloqueia qualquer consumidor real dos 4 eventos já implementados.

## 10. Implementation Readiness Decision

# READY WITH CONDITIONS

O Sales Domain está pronto para uma implementação real de Infrastructure, **exclusivamente** dentro das seguintes condições:

**Liberado para implementação**:
- `Opportunity.create()`/`markWon()`/`markLost()`/`advanceStage()`/`addProposal()`/`findProposal()`/`getProposals()`/`approveProposal()` — todos já implementados e cobertos por `SALES_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 4-5`.
- `Pipeline.create()`/`addStage()`/`findStage()`/`getStages()` — já implementados e cobertos por `§§ 6-7` do mesmo Blueprint.
- `OpportunityRepository`/`PipelineRepository` — implementação concreta exclusivamente dos 5 métodos já congelados (`findById`, `findAll`, `exists`, `save`, `delete`), sem método de conveniência adicional.
- `Mapper` — exclusivamente conforme `SALES_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 10-11`, reconstrução só via `reconstitute()`.
- Commands `CreateOpportunity`/`AdvanceOpportunityStage`/`MarkOpportunityWon`/`MarkOpportunityLost`/`ApproveProposal`.

**Não liberado — permanece BLOCKED/NEEDS DECISION**:
- `Quotation`/`Contract`/`Revenue` — § 7 itens 1-3.
- Referências a `User`/`Task`/`Activity` em `Opportunity` — § 7 itens 4-5.
- Ordem de `Stage`, nome de `Pipeline`, mecanismo de edição — § 7 itens 6-8.
- Forma de `ProposalRecord`/`StageRecord` — § 7 item 9.
- `SubmitProposal` como Command — § 7 item 11, até uma decisão de design explícita.
- Payload de qualquer Domain Event — § 7 item 12.

Uma futura missão de implementação que respeitar exatamente este escopo liberado pode prosseguir sem nova ADR. Qualquer implementação que precise tocar um item bloqueado deve, primeiro, resolver a decisão correspondente em § 7.

---

## Validações

- **Link Checker**: executado com `-Root` explícito, ver ENG-0047 FINAL REPORT.
- **Build/Lint/Test**: não aplicável — nenhum código criado ou alterado nesta missão; este módulo ainda não é buildável no monorepo (achado já registrado em `ENG-0039 FINAL REPORT`).

## Self Review

1. **Alguma decisão de domínio foi inventada nesta auditoria?** Não — toda linha cita a seção exata de um documento ou arquivo de código já existente; o único achado novo (`SubmitProposal`, § 7 item 11) é uma observação estrutural sobre o código real, não uma decisão.
2. **A decisão final ("READY WITH CONDITIONS") é consistente com o conteúdo do documento?** Sim — deriva diretamente de §§ 2-6 (comportamentos prontos) vs. § 7 (12 itens pendentes).
3. **Algum documento existente foi alterado?** Não, exceto o inventário de `analysis/README.md`, conforme escopo explícito.
4. **A "ADR Necessity Analysis" inventou algum critério novo?** Não — reaplicou o mesmo critério já usado em `ORGANIZATION_IMPLEMENTATION_READINESS.md § 8`.

## Relatório Final

**Decisão de prontidão**: **READY WITH CONDITIONS** — 2 Aggregates + 2 Internal Entities + 4 Domain Events + 2 Repository Contracts + 1 Persistence Blueprint prontos; 12 decisões pendentes registradas (§ 7), 4 riscos identificados (§ 9), nenhum resolvido por esta auditoria.

---

## Relação com Outros Módulos

- [SALES_DOMAIN_DISCOVERY.md](SALES_DOMAIN_DISCOVERY.md) (ENG-0032), [SALES_AGGREGATE_DESIGN.md](SALES_AGGREGATE_DESIGN.md) (ENG-0034/ENG-0035) — base de §§ 3, 6-7
- [../blueprints/SALES_TECHNICAL_BLUEPRINT.md](../blueprints/SALES_TECHNICAL_BLUEPRINT.md) (ENG-0036) — base de § 6
- [../blueprints/SALES_PERSISTENCE_MAPPING_BLUEPRINT.md](../blueprints/SALES_PERSISTENCE_MAPPING_BLUEPRINT.md) (ENG-0046) — base de § 5
- [adr/ADR-0020](../../../adr/ADR-0020-sales-quotation-position.md), [ADR-0021](../../../adr/ADR-0021-pipeline-nature.md) — base de §§ 2-3, 7-8
- [services/domains/sales/domain/aggregates/](../../../services/domains/sales/domain/aggregates/README.md), [domain/entities/](../../../services/domains/sales/domain/entities/README.md), [domain/repositories/](../../../services/domains/sales/domain/repositories/README.md) — código real auditado
- [services/kernel/organizations/ORGANIZATION_IMPLEMENTATION_READINESS.md](../../../services/kernel/organizations/ORGANIZATION_IMPLEMENTATION_READINESS.md) — padrão estrutural de forma seguido

## Status

🟢 Auditoria concluída (Missão ENG-0047). Nenhum código, Entity, Repository concreto, Mapper, Schema, teste, Command ou Handler criado. Nenhum documento existente alterado, exceto inventário de `analysis/README.md`. Aguardando aprovação formal do CTO antes de qualquer missão de Infrastructure real.
