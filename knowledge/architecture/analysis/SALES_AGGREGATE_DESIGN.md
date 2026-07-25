# Sales — Opportunity Aggregate Design (Fase 2, Tactical)

Versão: 1.1.0

Status: 🟡 Design tático do candidato a Aggregate `Opportunity` — evidência de Discovery, não Freeze vinculante completo

Missão: ENG-0034 (Opportunity Aggregate Design Freeze) — Fase 2 de `KERNEL_DOMAIN_LIFECYCLE_V2.md` para `Sales`; atualizado por ENG-0035 (Pipeline Ownership & Nature Resolution) — `Pipeline` confirmado Aggregate Root próprio (Configuration Aggregate), `Stage` confirmado Entity interna de `Pipeline` (`ADR-0021`)

Escopo: definir a fronteira transacional candidata do Aggregate `Opportunity`, a partir de [SALES_DOMAIN_DISCOVERY.md](SALES_DOMAIN_DISCOVERY.md) (ENG-0032) e [ADR-0020](../../../adr/ADR-0020-sales-quotation-position.md) (ENG-0033). Nenhum código, Entity class, Aggregate implementation, service, contract ou schema de banco foi criado. Nenhum payload de evento ou contrato de API é definido — só nomes candidatos.

**O que "Freeze tático" significa aqui, diferente de `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md`**: `Sales` não tem nenhum Object Specification prévio (`objects/Organization.md` equivalente não existe para `Sales`) — toda a base de evidência vem de `BOM.md` (definições de 1 frase + relacionamentos + eventos) e `UBIQUITOUS_LANGUAGE.md` (linguagem ubíqua). Por isso, mais itens permanecem `Candidate`/`Needs Evidence` do que estavam disponíveis no mesmo estágio do Organization Domain — refletido honestamente item a item, nunca apresentado com confiança maior que a fonte sustenta.

---

## 1. Aggregate Root

**`Opportunity`** — candidato definitivo, único Aggregate Root avaliado por este documento com evidência suficiente para a posição. Critério: identidade implícita (objeto central referenciado por todos os outros termos do domínio), ciclo de vida com eventos nomeados em 3 fontes independentes (`BOM.md`, `UBIQUITOUS_LANGUAGE.md`, `DOMAIN_MODEL.md § EVENT BUS` — 2 dos 3 eventos), e é o único objeto de `Sales` com relacionamentos explicitamente documentados (`BOM.md § Opportunity`, "Relacionamentos": `Party`, `Pipeline`, `Stage`, `Activities`, `Tasks`, `Proposal`, `Contract`).

**Atualizado (ENG-0035, `ADR-0021`)**: `Pipeline` **é** um segundo Aggregate Root de `Sales` — não transacional como `Opportunity`, mas um "Configuration Aggregate" (mesmo padrão estrutural de `Role` em `Identity`): identidade e persistência próprias, referenciado por id por múltiplas `Opportunity`s, nunca embutido. `Organization` foi descartada como dona de `Pipeline` — nenhuma fonte a associa a ela. `Stage` é Entity interna de `Pipeline`, não de `Opportunity` (ver §§ 3-4, atualizados por `ADR-0021`).

## 2. Limites Transacionais (Transactional Boundary)

**Candidato, não confirmado por nenhuma fonte de regra de negócio explícita** (mesma situação já registrada por `AGGREGATE_DISCOVERY.md § Sales`: "Fronteira transacional: Aggregate Pending Discovery"). Leitura estrutural mais defensável, a partir dos relacionamentos de `BOM.md`:

- **Dentro da fronteira transacional de `Opportunity`** (candidato): seu estado atual (`Stage` corrente), seus documentos de oferta (`Proposal`), e o valor reconhecido no fechamento (`Revenue`).
- **Fora da fronteira, referenciados por id** (candidato): `Party` (Customer), `Pipeline` (configuração, possivelmente de `Organization`), `Activity`/`Task` (outros domínios), `User` (Identity, dono da oportunidade).
- **Posição incerta, `Needs Evidence`**: `Quotation` (natureza desconhecida, `ADR-0020`) e `Contract` (pode ser estado terminal do mesmo Aggregate ou um Aggregate/domínio subsequente — nenhuma fonte resolve).

Nenhuma tabela de transição de estado é definida aqui (§ 6).

## 3. Classificação dos 6 Conceitos

| Conceito | Classificação | Confiança | Evidência |
|---|---|---|---|
| **`Opportunity`** | **Aggregate Root** | Candidate (mais forte do domínio) | § 1 |
| **`Pipeline`** | **Aggregate Root** (Configuration Aggregate, resolvido por `ADR-0021`) | Candidate | Referenciado por `Opportunity` por id, nunca embutido; mesmo padrão de `Role` em `Identity` |
| **`Stage`** | **Internal Entity de `Pipeline`** (resolvido por `ADR-0021`) | Candidate | "Etapa de um Pipeline" (`BOM.md`); `Opportunity` mantém apenas referência à etapa corrente, nunca possui `Stage` |
| **`Proposal`** | **Internal Entity** (candidato) | Candidate | Tem evento próprio nomeado (`ProposalApproved`), sugerindo identidade e ciclo de vida próprios — mas sempre no contexto de uma `Opportunity` específica ("documento formal de oferta a um Party", `UBIQUITOUS_LANGUAGE.md`); nenhuma fonte sugere que `Proposal` exista independentemente de uma `Opportunity` |
| **`Quotation`** | **Needs Evidence** | Needs Evidence | `ADR-0020` confirmou apenas que é conceito distinto de `Proposal`, Owner `Sales` — não sua forma (Entity, Value Object, ou documento externo). Não classificável além disso sem inventar |
| **`Contract`** | **Needs Evidence** (Internal Entity/estado terminal, ou Aggregate/domínio subsequente) | Needs Evidence | "Vínculo formal já fechado"; "Não usar antes do fechamento — nesse estágio é Opportunity/Proposal" (`UBIQUITOUS_LANGUAGE.md`) sugere transição terminal, mas não resolve se é um novo objeto ou uma renomeação de estado do mesmo Aggregate |
| **`Revenue`** | **Value Object** (candidato) | Candidate | Natureza monetária ("Receita", `BOM.md`); "valor reconhecido de negócio fechado" (`UBIQUITOUS_LANGUAGE.md`) — sem identidade própria, comportamento de cálculo/reconhecimento, mesmo padrão já inferido para valores monetários em `Financial` (`AGGREGATE_DISCOVERY.md § Financial`) |

## 4. Internal Entities (candidatas)

### De `Opportunity`
- **`Proposal`** — candidato mais confiável (evento próprio nomeado).

### De `Pipeline` (Aggregate separado, `ADR-0021`)
- **`Stage`** — Entity interna de `Pipeline`, não de `Opportunity`. `Opportunity` referencia sua etapa corrente, nunca possui um `Stage`.

## 5. Value Objects (candidatos)

- **`Revenue`** — candidato a Value Object monetário (`Money` ou equivalente), sem forma de campos definida (nenhuma fonte especifica moeda, precisão, ou regras de arredondamento).

Nenhum outro Value Object é candidato com confiança suficiente para listar — `Quotation`/`Contract` permanecem `Needs Evidence` (§ 3), não posicionados nem como VO nem como Entity.

## 6. Invariantes do Aggregate

**Nenhuma invariante confirmada por fonte de regra de negócio explícita** — mesmo achado já registrado por `AGGREGATE_DISCOVERY.md § Sales` ("nenhuma regra de negócio de Sales foi citada em nenhuma fonte oficial até agora"), reafirmado nesta missão. As candidatas abaixo são **inferências estruturais**, rotuladas como tal, nunca como regra de negócio confirmada:

| Invariante candidata | Confiança | Base da inferência |
|---|---|---|
| Uma `Opportunity` tem exatamente um `Stage` corrente a qualquer momento | Candidate, inferido | Estrutura comum de pipelines de vendas; nenhuma fonte NOVARIS o afirma explicitamente |
| Uma vez `Won` ou `Lost`, uma `Opportunity` não retorna a um estado aberto | Candidate, inferido | Convenção comum de DDD para estados terminais; nenhuma fonte NOVARIS o confirma |
| `Revenue` só é reconhecido quando `Opportunity` está `Won` | Candidate, inferido | "valor reconhecido de negócio **fechado**" (`UBIQUITOUS_LANGUAGE.md`) — leitura direta do texto, mas nunca formalizada como invariante |

Nenhuma dessas três pode ser codificada como regra protegida pelo Aggregate sem uma decisão explícita futura (mesmo padrão de restrição já usado em `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16`).

## 7. Allowed State Transitions

**Não coberto por este documento** — nenhuma fonte descreve uma tabela de transição de estados para `Opportunity` (quais `Stage`s existem, em que ordem, se retrocesso é permitido, o que dispara `Won`/`Lost`). Mesmo tratamento já dado à tabela de transições de `status` de `Organization` (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 8`) — não inventada aqui.

## 8. External References (by id only)

| Referência | Domínio de Origem | Status |
|---|---|---|
| `Party` (via `Opportunity`) | `Customer` (`Relationship`) | Confirmado pelo padrão de referência (`UBIQUITOUS_LANGUAGE.md`: "negociação em andamento **com um Party**") — `Customer` ainda não implementado |
| `User` (dono da oportunidade) | `Identity` | Candidato — nenhuma fonte nomeia o campo explicitamente, mas é o padrão universal já confirmado (`CONTEXT_RELATIONSHIPS.md § 5`, Open Host Service) |
| `organizationId` | `Organization` | Confirmado — raiz de referência universal (RN001) |
| `Task` (via `Opportunity`) | `Projects` | Confirmado o padrão de referência (`ADR-0016`); a relação em si é candidata (`BOM.md § Opportunity`, "Relacionamentos": `Tasks`) |
| `Activity` (via `Opportunity`) | `Activity` | Candidato — `BOM.md § Opportunity`, "Relacionamentos": `Activities`; não confirmado por nenhuma outra fonte |
| `Pipeline` (via `Opportunity`) | `Sales` (Configuration Aggregate próprio, `ADR-0021`) | Confirmado o padrão de referência por id; possível referência adicional de `Pipeline` a `organizationId` — candidato, não confirmado |

Nenhuma referência acima é embutida por objeto — todas por id, mesmo princípio já congelado para `Identity`/`Organization`/`Audit`.

## 9. Candidate Commands

Nomes candidatos apenas — nenhum payload definido, por instrução explícita da Ordem de Missão:

- `CreateOpportunity`
- `AdvanceOpportunityStage`
- `MarkOpportunityWon`
- `MarkOpportunityLost`
- `SubmitProposal`
- `ApproveProposal`

Nenhum comando para `Quotation`/`Contract` é nomeado — sua forma não está determinada (§ 3).

## 10. Candidate Domain Events

| Evento | Confiança | Fonte |
|---|---|---|
| `OpportunityCreated` | Candidate (confirmado em 3 fontes) | `BOM.md`, `UBIQUITOUS_LANGUAGE.md`, `DOMAIN_MODEL.md § EVENT BUS` |
| `OpportunityWon` | Candidate (confirmado em 3 fontes) | Idem |
| `OpportunityLost` | Candidate (2 de 3 fontes — ausente de `DOMAIN_MODEL.md § EVENT BUS`) | `BOM.md`, `UBIQUITOUS_LANGUAGE.md` |
| `ProposalApproved` | Candidate (1 de 3 fontes) | `UBIQUITOUS_LANGUAGE.md` |

Nenhum payload é definido — mesma pendência de plataforma já registrada (`DomainEvent` sem payload, `ADR-0019 § Evidence`), não específica de `Sales`.

## 11. Candidate Policies

| Candidata | Confiança | Observação |
|---|---|---|
| Transição `Opportunity` (fechada) → geração de `Contract`/reconhecimento de `Revenue` | Needs Evidence | Mecanismo não descrito por nenhuma fonte — pode ser mutação interna do próprio Aggregate ou um Domain Service, não determinado (mesma pendência já registrada por `SALES_DOMAIN_DISCOVERY.md § 6`) |

Nenhuma outra Policy/Domain Service é candidata — nenhuma regra de negócio de `Sales` envolve múltiplos Aggregates ou Repository de forma confirmada.

## 12. Relações Proibidas

- `Opportunity` nunca embute `Party`/`User`/`Task`/`Activity` — sempre por id (§ 8), mesmo princípio já congelado no Kernel.
- `Opportunity` nunca acessa tabelas de outro domínio diretamente — **Citada**, `DOMAIN_MODEL.md § REGRAS`.
- `Opportunity` nunca implementa reconhecimento de `Payment`/cobrança — território de `Financial` (`Revenue` ≠ `Payment`, distinção já explícita em `UBIQUITOUS_LANGUAGE.md`).

## 13. Restrições Permanentes (Needs Evidence)

Não coberto por este documento, exige decisão explícita futura antes de qualquer código:

- ~~Se `Pipeline` é Aggregate próprio, configuração de `Organization`, ou outra forma~~ — **Resolvido por `ADR-0021` (ENG-0035)**: Aggregate Root próprio de `Sales` (Configuration Aggregate).
- ~~Se `Stage` é Entity interna de `Opportunity` ou referência externa a `Pipeline`~~ — **Resolvido por `ADR-0021` (ENG-0035)**: Entity interna de `Pipeline`.
- Mecanismo exato de criação/edição de `Pipeline` (quem pode, quando) — `Needs Evidence`, não resolvido por `ADR-0021`.
- Forma exata de `Quotation` — Entity, Value Object, ou documento externo (`ADR-0020`, não resolvido).
- Se `Contract` é estado terminal do mesmo Aggregate `Opportunity` ou um Aggregate/domínio subsequente (§ 3).
- Tabela completa de transições de `Stage` (§ 7).
- Mecanismo exato de geração de `Contract`/reconhecimento de `Revenue` no fechamento (§ 11).
- Forma de campos de `Revenue` (moeda, precisão) (§ 5).

Decidir qualquer item desta lista pela primeira vez não exige ADR por si só — mas se a decisão contrariar algo já classificado como candidato/confirmado neste documento (§§ 1-12), exige ADR, mesmo padrão já em vigor para `Organization` (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16`).

## 14. Declaração

Este documento **não é um Freeze vinculante completo** no mesmo sentido de `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md`/`IDENTITY_AGGREGATE_DESIGN_FREEZE.md` — é o produto tático de uma Fase 2 conduzida inteiramente sobre evidência de Discovery (`BOM.md`/`UBIQUITOUS_LANGUAGE.md`), sem um Object Specification prévio equivalente a `objects/Organization.md`. `Opportunity` como Aggregate Root (§ 1) e a exigência de referência por id (§§ 8, 12) são as únicas conclusões tratadas com confiança suficiente para orientar uma futura Blueprint técnica. Todo o restante permanece candidato ou `Needs Evidence`, explicitamente listado em § 13 — nenhuma implementação deve presumir esses itens como decididos.

---

## Validações

- **Link Checker** (`-Root` explícito): ver ENG-0034 FINAL REPORT.
- **ARG (ENS-0002)**: N/A nos critérios de código — missão de design tático, sem implementação.
- **Domain Model Validation**: nenhuma Entity/Aggregate/Value Object/Domain Event real criado; nenhum código, service, contract ou schema de banco criado; `DOMAIN_MODEL.md` não alterado.

## Relação com Outros Módulos

- [SALES_DOMAIN_DISCOVERY.md](SALES_DOMAIN_DISCOVERY.md) (ENG-0032) — base direta desta missão
- [ADR-0020-sales-quotation-position.md](../../../adr/ADR-0020-sales-quotation-position.md) (ENG-0033) — origem da classificação `Needs Evidence` de `Quotation`
- [knowledge/core/BOM.md § 5](../../core/BOM.md), [UBIQUITOUS_LANGUAGE.md § Domínio: Sales](../../core/UBIQUITOUS_LANGUAGE.md) — única fonte de campos/relacionamentos/eventos
- [../decisions/AGGREGATE_DISCOVERY.md § Sales](../decisions/AGGREGATE_DISCOVERY.md) (ENG-0013) — candidato original, aprofundado aqui
- [services/kernel/organizations/ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](../../../services/kernel/organizations/ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md) — padrão estrutural de rigor seguido (forma, não conteúdo)
- [ADR-0016-task-ownership.md](../../../adr/ADR-0016-task-ownership.md) — padrão de referência por id aplicado a `Opportunity`↔`Task`
- [ADR-0019-architecture-freeze.md](../../../adr/ADR-0019-architecture-freeze.md) — autoridade que autorizou esta Fase 2

## Status

🟡 Design tático concluído (Missão ENG-0034). Nenhum código, Entity class, Aggregate implementation, service, contract ou schema criado. Múltiplos itens permanecem `Needs Evidence` (§ 13) — uma Blueprint técnica completa não deve começar sem resolvê-los, mesmo padrão já exigido para `Organization`/`Audit` antes de sua implementação real.
