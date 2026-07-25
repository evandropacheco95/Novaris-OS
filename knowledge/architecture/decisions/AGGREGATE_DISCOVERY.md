# NOVARIS — Aggregate Discovery (Tactical Design)

Versão: 1.0.0

Status: 🟢 Oficial — candidatos a Aggregate Root por Bounded Context, nenhum código, nenhuma modelagem formal

Missão: ENG-0013 (Aggregate Discovery)

Escopo: identificar candidatos a Aggregate Root de cada Bounded Context já consolidado (`DOMAIN_OWNERSHIP.md`, ENG-0012). Nenhum código, Entity, Value Object, Repository ou Domain Event foi criado/alterado. Onde a fonte não permite determinar um Aggregate com confiança, o campo é marcado **"Aggregate Pending Discovery"** — nunca inferido.

## 1. Resumo Executivo

Dos 13 Bounded Contexts + `CRM`/`Platform/Engineering` catalogados em `DOMAIN_OWNERSHIP.md`, **3 já têm Aggregate Root real, implementado e congelado** (`Identity`: `User`, `Role`; `Organization`: `Organization`; `Audit`: `AuditEntry`). Para os **7 contextos com scaffolding mas zero implementação** (`Customer`, `Sales`, `Activity`, `Projects`, `Marketing`, `Financial`, `Analytics`), este documento nomeia um **candidato mais provável** a Aggregate Root — nunca uma confirmação — usando o mesmo critério estrutural (identidade própria, ciclo de vida, necessidade de referência independente) já aplicado com rigor em `Permission`/`Audit`/`Organization`. Para **3 contextos sem nenhuma base suficiente** (`Knowledge` — bloqueado; `AI`/`Automation` — não confirmados como Business Domain), nenhum Aggregate é nomeado — marcados integralmente `Aggregate Pending Discovery`. `CRM`/`Platform/Engineering` têm candidato provisório baseado no único objeto que já possuem (`Queue`, `Release`).

**Nível de confiança, explícito em cada seção**: "Confirmado" (implementado), "Candidato" (nomeado com critério estrutural, não confirmado por Discovery formal), "Aggregate Pending Discovery" (nenhuma base suficiente).

## 2. Critérios

Aplicados a todo contexto sem implementação, mesmo critério já usado para `Organization`/`AuditEntry` (confirmados) e para descartar `Permission` como Aggregate:

1. **Identidade própria com significado de negócio** — o objeto precisa ser distinguível por algo além de seu valor.
2. **Ciclo de vida próprio** — estados, transições, ou ao menos uma criação com significado de negócio independente.
3. **Necessidade de ser referenciado por id por outro objeto/domínio** — se nada precisa apontar para ele independentemente, é candidato a Value Object ou Entity interna, não a Aggregate Root.

Um objeto que atende aos 3 critérios, mesmo sem confirmação formal, é nomeado "Candidato". Um contexto onde nenhum objeto tem informação suficiente para avaliar os 3 critérios é marcado `Aggregate Pending Discovery` por inteiro — Entities internas, Value Objects e Invariantes seguem a mesma regra: só são preenchidos quando a fonte já sugere algo específico, nunca por analogia genérica com outro domínio.

## 3. Aggregates por Contexto

### Identity — Confirmado (implementado)

- **Aggregate Roots**: `User`, `Role` (`IDENTITY_AGGREGATE_DESIGN_FREEZE.md`).
- **Entities internas**: nenhuma (confirmado, "nem `User` nem `Role` têm filhos com identidade própria").
- **Value Objects**: `Permission`, `Email`.
- **Invariantes conhecidas**: `email` obrigatório e validado por formato; `status` de `User` segue transições definidas; `Role.name` obrigatório; multi-tenancy (`organizationId` obrigatório em ambos, nunca cross-Organization).
- **Responsabilidades**: autenticação, autorização, ciclo de vida de usuário e papel.
- **Fronteira transacional**: `User` e `Role` são fronteiras independentes entre si — nenhuma transação cruza os dois Aggregates.

### Organization — Confirmado (implementado)

- **Aggregate Root**: `Organization` (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md`).
- **Entities internas**: nenhuma.
- **Value Objects**: `Slug`, `Document`, `Address`, `BrandingTheme` — candidatos avaliados e **bloqueados** (`ENG-0003.8`), agrupamento de campos congelado, validação nunca definida.
- **Invariantes conhecidas**: `name`/`slug` obrigatórios; `status` restrito a 5 valores (`ADR-ORG-001`); `Deleted` representado por `deletedAt`, nunca por `status`.
- **Responsabilidades**: identidade única da Organization, dados cadastrais, ciclo de vida (`status`), raiz de referência de `organizationId` para toda a plataforma.
- **Fronteira transacional**: própria — nenhuma mutação cruza outro Aggregate (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 12`).

### Audit — Confirmado (implementado)

- **Aggregate Root**: `AuditEntry` (`AUDIT_AGGREGATE_DESIGN_FREEZE.md`).
- **Entities internas**: nenhuma.
- **Value Objects**: nenhum — `Target`/`Actor` são referências simples (`UniqueEntityId` + tipo/string), forma de Value Object explicitamente bloqueada (Freeze §§ 13-14).
- **Invariantes conhecidas**: todos os 8 campos obrigatórios presentes na criação; imutabilidade total (write-once), nenhum método de mutação.
- **Responsabilidades**: registro imutável de auditoria, consulta por `Target`.
- **Fronteira transacional**: própria, write-once — nunca há uma segunda transação sobre a mesma instância.

### Customer (Relationship) — Candidato

- **Aggregate Root candidato**: `Party` — sinal estrutural: `BOM.md`/`objects/` descrevem `Party` com "Especializações: Person, Organization (externa)", sugerindo `Party` como supertipo. **Não confirmado** se `Party` é o próprio Aggregate Root (com `Person`/`External Organization` como Entities internas ou subtipos) ou se `Person`/`External Organization` são Aggregates independentes — pergunta em aberto, não decidida aqui.
- **Entities internas**: `Aggregate Pending Discovery` — nenhuma fonte detalha a composição interna de `Party`.
- **Value Objects**: `Contact`, `Address`, `Phone`, `Email`, `Social Profile` são candidatos citados (`DOMAIN_MODEL.md`), mas sua forma real (VO vs. Entity vs. campo simples) não é determinável sem Discovery.
- **Invariantes conhecidas**: `Aggregate Pending Discovery` — nenhuma fonte cita nenhuma regra de negócio para `Party`/`Person`/`External Organization`.
- **Responsabilidades**: pessoas, empresas, relacionamentos, contatos (`DOMAIN_MODEL.md`, descrição geral do domínio).
- **Fronteira transacional**: `Aggregate Pending Discovery`.

### Sales — Candidato

- **Aggregate Root candidato**: `Opportunity` — critério: tem `Stage` (ciclo de vida via pipeline), é o objeto mais citado como central em `DOMAIN_MODEL.md § EVENT BUS` (`OpportunityCreated`, `OpportunityWon`, únicos eventos de Sales já nomeados em qualquer fonte).
- **Entities internas**: `Stage` — candidato razoável (ciclo de vida de uma `Opportunity` específica, provavelmente sem existência independente da oportunidade) — **não confirmado**.
- **Value Objects**: `Aggregate Pending Discovery` para forma exata; `Revenue` sugere um Value Object monetário (`Money` ou equivalente), inferido pela natureza do campo, não citado explicitamente como VO em nenhuma fonte.
- **Invariantes conhecidas**: `Aggregate Pending Discovery` — nenhuma regra de negócio de Sales foi citada em nenhuma fonte oficial até agora.
- **Responsabilidades**: oportunidades, pipelines, negociação, propostas, contratos, receitas (`DOMAIN_MODEL.md`).
- **Fronteira transacional**: `Aggregate Pending Discovery`.

### Activity — Candidato (Future Domain, sem scaffolding)

- **Aggregate Root candidato**: `Activity` — mesmo padrão já observado em `Organization`/`Audit` (nome do Aggregate coincide com o nome do domínio).
- **Entities internas**: `Aggregate Pending Discovery`.
- **Value Objects**: `Aggregate Pending Discovery`.
- **Invariantes conhecidas**: `Aggregate Pending Discovery`.
- **Responsabilidades**: agenda, atividades, tarefas, calendário, follow-up, timeline (`DOMAIN_MODEL.md`) — nota: `Task` pertence a `Projects` (decisão CTO, `ENG-0011`), não a este domínio, apesar de citado aqui em `DOMAIN_MODEL.md`.
- **Fronteira transacional**: `Aggregate Pending Discovery`.

### Projects — Candidato

- **Aggregate Root candidato**: `Project` (mesmo padrão nome-do-Aggregate = nome-do-domínio).
- **Entities internas**: `Task` — candidato razoável a Entity interna de `Project` (ou Aggregate Root próprio — **não determinável** sem Discovery); `Sprint`, `Milestone` — mesma incerteza.
- **Value Objects**: `Aggregate Pending Discovery`.
- **Invariantes conhecidas**: `Aggregate Pending Discovery`.
- **Responsabilidades**: projetos, sprints, roadmap, backlog, kanban (`DOMAIN_MODEL.md`); posse confirmada de `Task` (decisão CTO, `ENG-0011` item 8).
- **Fronteira transacional**: `Aggregate Pending Discovery` — inclui a pergunta não resolvida se `Task` cruza a fronteira de `Project` ou é seu próprio Aggregate.

### Marketing — Candidato

- **Aggregate Root candidato**: `Campaign` — citado tanto em `DOMAIN_MODEL.md` quanto em `BOM.md` (dupla confirmação, diferente dos demais objetos deste domínio).
- **Entities internas**: `Aggregate Pending Discovery`.
- **Value Objects**: `Aggregate Pending Discovery`.
- **Invariantes conhecidas**: `Aggregate Pending Discovery`.
- **Responsabilidades**: campanhas, landing pages, SEO, conteúdo, social media (`DOMAIN_MODEL.md`).
- **Fronteira transacional**: `Aggregate Pending Discovery`.

### Financial — Candidato (2 candidatos, não reconciliados)

- **Aggregate Root candidato 1**: `Invoice` — citado em `DOMAIN_MODEL.md` e `BOM.md`, ciclo de vida de faturamento plausível.
- **Aggregate Root candidato 2**: `Subscription` — posse confirmada por decisão do CTO (`ENG-0011` item 7); tem identidade e ciclo de vida distintos de `Invoice` (vínculo a um plano vs. transação de pagamento) — **não determinado** se são dois Aggregates separados ou se um contém o outro.
- **Entities internas**: `Aggregate Pending Discovery`.
- **Value Objects**: `Money` (ou equivalente) inferido pela natureza monetária de `Invoice`/`Payment`/`Expense`/`Revenue` — mesma ressalva de Sales, não citado explicitamente como VO em nenhuma fonte.
- **Invariantes conhecidas**: `Aggregate Pending Discovery`.
- **Responsabilidades**: receitas, despesas, pagamentos, faturamento (`DOMAIN_MODEL.md`); `Subscription` (posse confirmada).
- **Fronteira transacional**: `Aggregate Pending Discovery`.

### Analytics — Candidato

- **Aggregate Root candidato**: `Dashboard` — citado em `DOMAIN_MODEL.md` e `BOM.md` (dupla confirmação), referenciado por `Widget` (sugere fronteira de composição).
- **Entities internas**: `Widget` — candidato razoável a Entity interna de `Dashboard` — **não confirmado**.
- **Value Objects**: `Aggregate Pending Discovery`.
- **Invariantes conhecidas**: `Aggregate Pending Discovery`.
- **Responsabilidades**: KPIs, métricas, dashboards, forecast (`DOMAIN_MODEL.md`).
- **Fronteira transacional**: `Aggregate Pending Discovery`.

### Knowledge — `Aggregate Pending Discovery` (bloqueado por inteiro)

Nenhum Aggregate Root, Entity, Value Object ou invariante é nomeado. `IMPLEMENTATION_ROADMAP.md § 6`, Risco R5, já confirma: "não tem nenhum objeto do BOM mapeável" — a base é insuficiente até para nomear um candidato com o critério mínimo desta missão.

### AI — `Aggregate Pending Discovery` (domínio não confirmado)

Nenhum Aggregate nomeado — decisão do CTO (`ENG-0011` item 6) confirma que `AI` não é um Business Domain hoje. Nomear um candidato a Aggregate para um domínio que ainda não existe formalmente inventaria uma decisão de escopo, não apenas de modelagem tática.

### Automation — `Aggregate Pending Discovery` (domínio não confirmado)

Mesma razão de `AI` (`ENG-0011` item 6).

### CRM — Candidato provisório (mínimo)

- **Aggregate Root candidato**: `Queue` — única posse confirmada (`ENG-0011` item 9); nenhuma outra informação existe sobre este domínio.
- **Entities internas, Value Objects, Invariantes, Responsabilidades além de `Queue`, Fronteira transacional**: `Aggregate Pending Discovery` — o domínio `CRM` tem, hoje, exatamente um objeto conhecido e nenhuma Discovery.

### Platform/Engineering — Candidato provisório (mínimo)

- **Aggregate Root candidato**: `Release` — única posse confirmada (`ENG-0011` item 10).
- **Demais campos**: `Aggregate Pending Discovery` — mesma razão de `CRM`.

## 4. Itens Pendentes

- ~~Confirmar se `Party` é o Aggregate Root de `Customer` ou se `Person`/`External Organization` são Aggregates independentes.~~ **Resolvido**: `Party` é Aggregate Root único, `Person`/`External Organization` são especializações internas discriminadas por `partyType` (`RELATIONSHIP_AGGREGATE_DESIGN.md § 2`, `ENG-0119`).
- ~~Confirmar se `Task` é Entity interna de `Project` ou Aggregate Root próprio.~~ **Resolvido**: `Task` é Internal Entity de `Project` (`ADR-0026`).
- ~~Confirmar se `Widget` é Entity interna de `Dashboard` ou Aggregate Root próprio.~~ **Resolvido**: `Widget` é Internal Entity de `Dashboard` — "não usar isolado de um Dashboard" (`UBIQUITOUS_LANGUAGE.md`), mesmo critério de reuso já usado para `Stage`/`Proposal` (`ANALYTICS_AGGREGATE_DESIGN.md § 2`, `ENG-0132`).
- ~~Reconciliar `Invoice` vs. `Subscription` como um ou dois Aggregates em `Financial`.~~ **Resolvido**: dois Aggregate Roots independentes, `Invoice.subscriptionId?` como única referência (`ADR-0027`).
- Toda Discovery formal de `Sales`, `Customer`, `Marketing`, `Projects`, `Financial`, `Analytics`, `Activity` — nenhum candidato desta missão é uma confirmação. `Sales`/`Customer`/`Project`/`Financial` já concluíram Discovery formal em missões posteriores; `Marketing`/`Analytics`/`Activity` tiveram Aggregate Design concluído (`ENG-0132`: `ACTIVITY_AGGREGATE_DESIGN.md`, `MARKETING_AGGREGATE_DESIGN.md`, `ANALYTICS_AGGREGATE_DESIGN.md`), mas aguardam decisão do CTO sobre campos mínimos antes de implementação real — diferente de `Sales`/`Customer`/`Project`/`Financial`, nenhum tem evidência de campo suficiente para uma ADR equivalente a `ADR-0025`/`ADR-0030`/`ADR-0031` sem inventar conteúdo.
- `Knowledge`, `AI`, `Automation` — nenhum Aggregate pode ser discutido antes das decisões já pendentes em `DOMAIN_OWNERSHIP.md § 7` serem resolvidas.
- `CRM`/`Platform/Engineering` — precisam de uma Discovery completa (Bounded Context, linguagem ubíqua, objetos) antes de qualquer Aggregate real ser considerado, mesmo o candidato mínimo aqui nomeado.

## 5. Riscos

| Risco | Classificação |
|---|---|
| Nomear `Opportunity`/`Campaign`/`Dashboard`/`Project`/`Activity`/`Invoice`/`Party` como candidatos pode ser lido, por uma missão futura apressada, como confirmação — nenhum passou por Aggregate Design Freeze | **Alto** |
| `Invoice` vs. `Subscription` como Aggregates concorrentes em `Financial`, sem nenhuma fonte que resolva a relação entre os dois | **Alto** |
| `CRM`/`Platform/Engineering` com candidato baseado em um único objeto — risco real de uma implementação prematura assumir mais modelagem do que existe | **Alto** — já registrado em `ENG-0011 § 8`, reafirmado |
| Value Objects monetários (`Money`) inferidos por padrão comum de DDD, não por citação — risco de a inferência não corresponder à decisão real quando a Discovery acontecer | **Médio** |
| Nenhuma invariante de negócio foi confirmada para nenhum dos 7 contextos candidatos — qualquer implementação futura precisa de Discovery completa antes de `create()` ter qualquer validação real | **Médio** — esperado nesta fase |

---

## Validações

- **Link Checker** (`-Root` explícito): ver ENG-0013 FINAL REPORT.
- **ARG (ENS-0002)**: N/A nos critérios de código; PASS nos demais.
- **Domain Model Validation**: nenhuma Entity/Aggregate/Value Object real criado; todo candidato rotulado como tal, nunca apresentado como confirmado; 3 contextos (`Knowledge`, `AI`, `Automation`) integralmente `Aggregate Pending Discovery`.

## Relação com Outros Módulos

- [DOMAIN_OWNERSHIP.md](DOMAIN_OWNERSHIP.md) (ENG-0012) — base da lista de conceitos e Owners
- [../CONTEXT_RELATIONSHIPS.md](../CONTEXT_RELATIONSHIPS.md) (ENG-0011) — decisão formal do CTO usada para `Task`/`Queue`/`Release`/`Subscription`
- [../../../services/kernel/audit/AUDIT_AGGREGATE_DESIGN_FREEZE.md](../../../services/kernel/audit/AUDIT_AGGREGATE_DESIGN_FREEZE.md), [../../../services/kernel/organizations/ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](../../../services/kernel/organizations/ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md), [../../../services/kernel/identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md](../../../services/kernel/identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md) — os 3 Aggregate Freezes reais, padrão de rigor seguido para os candidatos

## Status

🟢 Candidatos a Aggregate Root identificados (Missão ENG-0013) para 7 contextos scaffolded + 2 mínimos; 3 contextos integralmente `Aggregate Pending Discovery`; 3 contextos confirmados (já implementados). Nenhum código, Entity, Value Object ou Repository criado.
