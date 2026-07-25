# Sales — Domain Discovery

Versão: 1.1.0

Status: 🟢 Discovery concluída — primeiro domínio de negócio formalmente investigado após `ADR-0019` (Architecture Freeze)

Missão: ENG-0032 (Sales Domain Discovery); atualizado por ENG-0033 (Sales Quotation Resolution) — `Quotation` confirmado conceito distinto de `Proposal` (`ADR-0020`)

Escopo: primeira Fase 1 (Domain Definition) de `KERNEL_DOMAIN_LIFECYCLE_V2.md` aplicada a um Business Domain de negócio desde o Architecture Freeze. Discovery apenas — nenhum código, Entity, Aggregate, service, contract ou migration foi criado. Todo candidato é classificado por nível de confiança (`Confirmed`/`Candidate`/`Rejected`/`Needs Evidence`), nunca apresentado como decisão final.

---

## 1. Purpose

`Sales` é o Business Domain responsável pela negociação comercial da NOVARIS enquanto plataforma B2B: administrar oportunidades de venda desde sua criação até o fechamento (ganho, perdido ou convertido em contrato), through um fluxo configurável de etapas (Pipeline/Stage), documentos formais de oferta (Proposal) e o reconhecimento de receita resultante (Revenue). Escolhido como primeiro domínio de negócio a receber Discovery formal (`ADR-0019`) por ter a evidência estrutural mais forte entre os 7 domínios ativos ainda não modelados — único com eventos de negócio já nomeados em fonte oficial (`OpportunityCreated`, `OpportunityWon`, `OpportunityLost`, `ProposalApproved`) e com relacionamentos explícitos já documentados em `BOM.md`.

## 2. Scope

Cobre: `Opportunity` (oportunidade comercial em negociação), seu ciclo de vida via `Pipeline`/`Stage`, documentos de oferta (`Proposal`), o vínculo formal resultante (`Contract`) e o reconhecimento de valor (`Revenue`).

Não cobre (fronteiras já estabelecidas por decisões anteriores, reafirmadas aqui, não reabertas):
- **`Lead`** — explicitamente fora de escopo, marcado como "conceito de CRM" e proibido como sinônimo de `Opportunity` (`UBIQUITOUS_LANGUAGE.md`, 2 ocorrências, já registrado por `CRM_DOMAIN_DISCOVERY.md`).
- **`Payment`** — pertence a `Financial`, não a `Sales` (`Revenue` é reconhecimento de valor; `Payment` é recebimento efetivo, distinção já explícita em `UBIQUITOUS_LANGUAGE.md`).
- **`Party`/`Person`/`External Organization`** — pertencem a `Customer` (`Relationship` renomeado, `ADR-0007`); `Sales` os referencia por id, nunca os possui.
- **`Task`** — pertence a `Project Domain` (`ADR-0016`); `Opportunity` o referencia por id quando relevante (ex.: tarefas de follow-up de uma negociação).
- **`Activity`** — pertence a `Activity Domain`; relação candidata, não confirmada (ver § 5).
- **`CRM` como um todo** — não é domínio (`ADR-0011`); `Sales` é um dos domínios que compõem o produto `CRM` (junto de `Customer`, `Activity`), nunca o próprio "CRM".

## 3. Business Responsibilities

Reproduzido de `DOMAIN_MODEL.md § SALES DOMAIN`, "Responsável por": Oportunidades, Pipelines, Etapas, Negociação, Propostas, Contratos, Receitas — nenhuma alteração de texto original, apenas confirmação de que a evidência coletada nesta Discovery é consistente com essa responsabilidade declarada.

## 4. Boundaries

- `Sales` não possui dados de identidade de cliente (`Party`/`Person`/`External Organization`) — só referencia por id.
- `Sales` não possui dados financeiros de recebimento (`Payment`, `Invoice`, `Expense`, `Billing`) — esses são `Financial`; `Revenue` é o único conceito monetário nativo de `Sales`, e mesmo assim distinto de `Payment`.
- `Sales` não possui `Task`/`Activity` — apenas referencia (`Opportunity`'s "Tasks"/"Activities" em `BOM.md § Relacionamentos`).
- `Sales` não é `CRM` — é um dos domínios que, compostos com `Customer`/`Activity`, entregam o produto `CRM` (`PRODUCT_DOMAIN_ARCHITECTURE.md § 4`, "`CRM → Customer + Sales + Activity`").
- Nenhuma fonte atribui a `Sales` responsabilidade sobre geração de demanda/`Marketing` — a relação `Marketing → Sales` é um risco arquitetural já registrado (`CONTEXT_RELATIONSHIPS.md § 8`, posição de `Marketing` na cadeia contradiz o fluxo de negócio esperado), não resolvido, não reaberto por esta Discovery.

## 5. External Dependencies

| Origem | Relação | Tipo (DDD) | Status |
|---|---|---|---|
| `Identity` | `Sales` referencia `UserId` (ex.: dono da oportunidade) | Open Host Service | Confirmado (padrão já universal, `CONTEXT_RELATIONSHIPS.md § 5`) |
| `Organization` | `Sales` referencia `organizationId` (raiz de referência universal) | Open Host Service | Confirmado |
| `Customer` (`Relationship`) | `Opportunity` referencia `Party` por id — "negociação em andamento **com um Party**" (`UBIQUITOUS_LANGUAGE.md`) | Customer/Supplier — `Sales` → `Customer` | Confirmado por definição textual, `Customer` ainda não implementado |
| `Activity` | `Opportunity` relaciona-se a `Activities` (`BOM.md`) | Customer/Supplier (candidato) | Candidato — não confirmado por nenhuma fonte além da lista de relacionamento |
| `Projects` (`Task`) | `Opportunity` relaciona-se a `Tasks` (`BOM.md`); `Task` é Entity confirmada de `Projects` (`ADR-0016`) | Referência por id | Confirmado o padrão de referência; relação ainda candidata |
| `Financial` | `Revenue` (Sales) é distinto de `Payment` (Financial) — fronteira já explícita, mas nenhum mecanismo de handoff (ex.: evento) documentado | Não determinado | Needs Evidence |
| `Marketing` | Possível fonte de demanda que alimentaria `Sales` — posição da cadeia de `DOMAIN_MODEL.md` contradiz esse fluxo esperado | Risco arquitetural registrado, não relacionamento confirmado | Não resolvido (`CONTEXT_RELATIONSHIPS.md § 8`, Risco Alto) |
| AI (Transversal Intelligence Layer) | Nenhuma fonte hoje atribui `Recommendation`/`Insight` (`ADR-0014`) especificamente a `Opportunity` | Consumo transversal, hipotético | Needs Evidence — não inventado aqui |

## 6. Candidate Entities, Value Objects, Aggregates, Domain Events, Policies

### Aggregates

| Candidato | Classificação | Evidência |
|---|---|---|
| **`Opportunity`** | **Candidate** (mais forte de todo o domínio) | Único objeto de `Sales` com eventos de negócio nomeados (`OpportunityCreated`, `OpportunityWon`, `OpportunityLost`, `BOM.md`); tem ciclo de vida via `Stage`/`Pipeline`; é o hub de relacionamento de todos os outros objetos do domínio (`Party`, `Pipeline`, `Stage`, `Activities`, `Tasks`, `Proposal`, `Contract`). Fronteira transacional exata (o que entra/sai do Aggregate) **não determinada** — `Needs Evidence` para essa sub-pergunta especificamente. |

### Entities (candidatas a Entity interna de `Opportunity`, ou Aggregate próprio — não determinado)

| Candidato | Classificação | Evidência |
|---|---|---|
| **`Stage`** | **Candidate** | "Etapa de um Pipeline" (`BOM.md`); `UBIQUITOUS_LANGUAGE.md`: "Não usar isolado de um Pipeline" — sugere Entity sem identidade própria fora do contexto de um `Pipeline`, mas isso não é confirmado por nenhuma fonte de modelagem tática |
| **`Proposal`** | **Candidate** | Tem evento próprio nomeado (`ProposalApproved`) — sinal de que pode ter ciclo de vida e identidade própria, não apenas um campo de `Opportunity`. Relação com `Opportunity`: "Não usar como sinônimo de `Contract`" (documento formal distinto) |
| **`Pipeline`** | **Candidate** | "Fluxo de trabalho configurável" — por ser "configurável", sugere ser definido a nível de `Organization` (um template reutilizável por múltiplas `Opportunity`), não uma Entity interna de uma `Opportunity` específica. Natureza exata (Entity vs. configuração de `Organization`) **não determinada** |
| **`Contract`** | **Needs Evidence** | "Vínculo formal já fechado" — pode ser o resultado terminal de `Opportunity` (mesmo Aggregate, estado final) ou um Aggregate/domínio próprio subsequente (ex.: gestão de contrato pós-venda) — nenhuma fonte resolve isso |

### Value Objects

| Candidato | Classificação | Evidência |
|---|---|---|
| **`Revenue`** | **Candidate** | Natureza monetária ("Receita") sugere Value Object (`Money` ou equivalente) — mesmo padrão já inferido para `Invoice`/`Payment` em `Financial` (`AGGREGATE_DISCOVERY.md § Financial`), nunca citado explicitamente como VO em nenhuma fonte |
| **`Quotation`** | **Candidate** (vocabulário resolvido; conteúdo `Needs Evidence`) | **Atualizado (ENG-0033, `ADR-0020`)**: confirmado como conceito distinto de `Proposal` (`UBIQUITOUS_LANGUAGE.md § Domínio: Sales`, "Orçamento" proibido como sinônimo de `Proposal` — mesma convenção usada para conceitos genuinamente diferentes em todo o documento); Owner `Sales` reafirmado. Atributos, ciclo de vida e posição no funil comercial permanecem indefinidos, pendentes de Aggregate Design Freeze |

### Domain Events

| Candidato | Classificação | Evidência |
|---|---|---|
| **`OpportunityCreated`** | **Confirmed** (nomeado) | `BOM.md § Opportunity`, `DOMAIN_MODEL.md § EVENT BUS`, `UBIQUITOUS_LANGUAGE.md` — presente em 3 fontes independentes |
| **`OpportunityWon`** | **Confirmed** (nomeado) | Mesmas 3 fontes |
| **`OpportunityLost`** | **Candidate** | Presente em `BOM.md`/`UBIQUITOUS_LANGUAGE.md`, **ausente de `DOMAIN_MODEL.md § EVENT BUS`** — divergência menor já registrada por `CRM_DOMAIN_DISCOVERY.md § 2`, reafirmada aqui |
| **`ProposalApproved`** | **Candidate** | Nomeado em `UBIQUITOUS_LANGUAGE.md`, ausente de `DOMAIN_MODEL.md § EVENT BUS` e de `BOM.md § Proposal` — presente em só 1 de 3 fontes |
| Payload de qualquer evento acima | **Needs Evidence** | `DomainEvent` (Shared Kernel) não carrega payload em nenhuma implementação real (`EVENT_BUS_EPIC_PLANNING.md § 7`, reafirmado por `ADR-0019 § Evidence`) — pendência de plataforma, não específica de `Sales` |

### Policies / Domain Services

| Candidato | Classificação | Evidência |
|---|---|---|
| Regra de transição `Opportunity` → `Contract`/`Revenue` no fechamento | **Needs Evidence** | `UBIQUITOUS_LANGUAGE.md`: "Não usar [`Opportunity`] após fechamento — nesse ponto vira `Contract`/`Revenue`" — sugere uma regra de transição de estado, mas nenhuma fonte descreve o mecanismo (o próprio Aggregate muda de estado? Um novo Aggregate é criado? Um Domain Service orquestra a transição?) |
| Qualquer outra regra de negócio de `Sales` | **Rejected** (como confirmado) | `AGGREGATE_DISCOVERY.md § Sales` já registrava: "nenhuma regra de negócio de Sales foi citada em nenhuma fonte oficial até agora" — confirmado nesta Discovery, nenhuma nova regra encontrada |

## 7. Rejected Concepts

| Conceito | Razão da Rejeição |
|---|---|
| `Lead` | Explicitamente fora de escopo e proibido como sinônimo (`UBIQUITOUS_LANGUAGE.md`, 2x) — conceito de CRM, não de `Sales` |
| `Deal` | Sinônimo informal aceitável em prosa para `Opportunity`, nunca um objeto próprio — não é um candidato separado |
| `CRM` (como domínio) | Já resolvido definitivamente por `ADR-0011` — não é domínio, não é reaberto aqui |
| `Payment`/`Invoice`/`Billing` | Pertencem a `Financial`, nunca citados como objetos de `Sales` em nenhuma fonte |

## 8. Conclusão

**Sales permanece `🟡 Scaffolding` — Discovery de Fase 1 (Domain Definition) concluída com sucesso, evidência suficiente para prosseguir a Fase 2 (Aggregate & Contract) de `KERNEL_DOMAIN_LIFECYCLE_V2.md`.** `Opportunity` é confirmado como candidato a Aggregate Root com a evidência mais forte de qualquer domínio ainda não implementado nesta engenharia (eventos nomeados em 3 fontes independentes, relacionamentos explícitos documentados). Uma lacuna específica ainda impede avançar diretamente a um Aggregate Design Freeze: a fronteira transacional exata de `Opportunity` (o que é Entity interna vs. Aggregate próprio — `Stage`, `Proposal`, `Contract`, `Quotation`) não está determinada. **Atualizado (ENG-0033)**: a segunda lacuna original (natureza de `Quotation`) foi resolvida por `ADR-0020` — confirmado conceito distinto de `Proposal`, Owner `Sales`, conteúdo ainda pendente de Aggregate Design Freeze junto com os demais.

## 9. Recomendação

Não inventar a fronteira transacional nem o mecanismo de transição `Opportunity → Contract`/`Revenue` — ambos exigiriam uma decisão de modelagem tática (`Aggregate Design Freeze`), próxima fase do processo, não desta Discovery. ~~(a) uma decisão específica sobre `Quotation`~~ — **Resolvido por `ADR-0020` (ENG-0033)**: `Quotation` confirmado como conceito distinto de `Proposal`, Owner `Sales` reafirmado; conteúdo permanece pendente de Aggregate Design Freeze. Recomendação remanescente: (b) confirmar ou descartar `OpportunityLost`/`ProposalApproved` como eventos oficiais (divergência de `DOMAIN_MODEL.md § EVENT BUS`, mesma classe de achado já resolvida para outros domínios em missões anteriores).

---

## Validações

- **Link Checker** (`-Root` explícito): ver ENG-0032 FINAL REPORT.
- **ARG (ENS-0002)**: N/A nos critérios de código — missão de Discovery, sem implementação.
- **Domain Model Validation**: nenhuma Entity/Aggregate/Value Object/Domain Event real criado; todo candidato rotulado por nível de confiança, nunca apresentado como confirmado; `DOMAIN_MODEL.md` não alterado.

## Relação com Outros Módulos

- [DOMAIN_MODEL.md § SALES DOMAIN](../../core/DOMAIN_MODEL.md) — fonte primária de Responsabilidades e Objetos
- [BOM.md § 5 Business Objects](../../core/BOM.md) — definições, relacionamentos e eventos de `Opportunity`/`Pipeline`/`Stage`/`Proposal`/`Contract`/`Revenue`
- [UBIQUITOUS_LANGUAGE.md § Domínio: Sales](../../core/UBIQUITOUS_LANGUAGE.md) — linguagem ubíqua completa, sinônimos proibidos, distinções de uso
- [../decisions/AGGREGATE_DISCOVERY.md § Sales](../decisions/AGGREGATE_DISCOVERY.md) (ENG-0013) — candidato original a `Opportunity`, reafirmado e aprofundado aqui
- [../decisions/DOMAIN_OWNERSHIP.md § Sales](../decisions/DOMAIN_OWNERSHIP.md) (ENG-0012) — Owner confirmado dos 7 objetos originais de `DOMAIN_MODEL.md`
- [../CONTEXT_RELATIONSHIPS.md § 3, § 8](../CONTEXT_RELATIONSHIPS.md) (ENG-0011) — relacionamentos candidatos e risco de posição de `Marketing`
- [CRM_DOMAIN_DISCOVERY.md](CRM_DOMAIN_DISCOVERY.md) (ENG-0015) — origem da proibição de `Lead`, precedente metodológico direto
- [ADR-0016-task-ownership.md](../../../adr/ADR-0016-task-ownership.md), [ADR-0017-task-vocabulary-separation.md](../../../adr/ADR-0017-task-vocabulary-separation.md) — padrão de referência por id aplicado à relação `Opportunity`↔`Task`
- [ADR-0019-architecture-freeze.md](../../../adr/ADR-0019-architecture-freeze.md) — autoridade que selecionou `Sales` como primeiro domínio de implementação

## Status

🟢 Discovery concluída (Missão ENG-0032). Nenhum código, Entity, Aggregate, service, contract ou migration criado. Pronto para avaliação de Fase 2 (`Aggregate & Contract`) de `KERNEL_DOMAIN_LIFECYCLE_V2.md`, condicionado à resolução de `Quotation` e à decisão de fronteira transacional de `Opportunity`.
