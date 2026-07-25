# Analytics — Aggregate Design

Versão: 1.0.0

Status: 🟢 Design tático concluído — nenhum código criado

Missão: ENG-0132 (continuação do roteiro de resolução de domínios — Analytics).

Escopo: resolver a pergunta já registrada em `AGGREGATE_DISCOVERY.md § 4` ("Confirmar se `Widget` é Entity interna de `Dashboard` ou Aggregate Root próprio"), exclusivamente com base em evidência já existente.

**Verify Before Reimplementing**: busca por "ANALYTICS_AGGREGATE_DESIGN" — zero resultados.

---

## 1. Fonte das Evidências

- `DOMAIN_MODEL.md § ANALYTICS DOMAIN` — responsabilidade: "KPIs, métricas, dashboards, forecast". Objetos: `Dashboard`, `Widget`, `Metric`, `Report`, `Forecast`, `Snapshot`, `Benchmark`.
- `BOM.md § Dashboard`/`§ Widget`/`§ Metric`/`§ Report`/`§ Snapshot`/`§ Forecast` — todos one-liners, sem `Tipos:`/`Estados:`/`Eventos:`.
- `UBIQUITOUS_LANGUAGE.md § Domínio: Analytics`:
  - `Dashboard`: "Para composição visual de Widgets" — Objetos Relacionados: `Widget`.
  - `Widget`: "Para elemento individual dentro de um Dashboard — **Não usar isolado de um Dashboard**" — Objetos Relacionados: `Dashboard`, `Metric`.
  - `Metric`: "Para valor quantitativo mensurável — Não usar como sinônimo de `KPI`" — Objetos Relacionados: `Widget`.
  - `Report`, `Snapshot`, `Forecast`, `Benchmark` — definições one-liner, todas as colunas restantes `TODO`.
- `AGGREGATE_DISCOVERY.md § "Analytics — Candidato"` já nomeia `Dashboard` como Aggregate Root candidato e `Widget` como candidato a Entity interna, com a pergunta explicitamente em aberto.

## 2. Achado Decisivo — `Dashboard` é o Aggregate Root; `Widget` é Internal Entity

`UBIQUITOUS_LANGUAGE.md` é explícito: "**Não usar [`Widget`] isolado de um Dashboard**" — mesma classe de evidência decisiva já usada para `Stage` (Pipeline) e `Proposal` (Opportunity): um `Widget` não existe, não é referenciado nem tem sentido de negócio fora de exatamente um `Dashboard` pai. Diferente de `Asset` (Marketing) ou `Pipeline` (Sales), não há nenhuma indicação de reuso de um `Widget` entre múltiplos `Dashboard`s.

**Conclusão**: `Widget` é **Internal Entity de `Dashboard`** — mesmo padrão estrutural de `Stage`/`Proposal`, resolvendo a pergunta pendente de `AGGREGATE_DISCOVERY.md § 4`.

## 3. Achado — `Metric` relaciona-se com `Widget`, forma ainda não definida

`Metric` só se relaciona com `Widget` (não diretamente com `Dashboard`) — "valor quantitativo mensurável". Duas leituras possíveis, nenhuma confirmada:
(a) `Metric` é um Value Object embutido dentro de `Widget` (o "valor" que o Widget exibe); ou
(b) `Metric` é seu próprio conceito, referenciado por `Widget` por id (ex.: um catálogo de métricas reutilizáveis entre Widgets).

Nenhuma fonte resolve qual — permanece `Needs Evidence`, não decidido aqui. Advertência de `UBIQUITOUS_LANGUAGE.md` ("Não usar como sinônimo de `KPI`") reforça que `Metric` é um conceito técnico (o dado bruto), não a apresentação em si.

## 4. Estrutura Proposta — `Dashboard` (Aggregate Root)

| Campo | Tipo candidato | Obrigatório/Opcional | Evidência |
|---|---|---|---|
| `id` | `UniqueEntityId` (herdado) | Obrigatório | Padrão de todo Aggregate Root |
| `organizationId` | `UniqueEntityId` | Obrigatório | Regra transversal de multi-tenancy |
| `createdAt`, `updatedAt` | `Date` | Obrigatório | Padrão `Timestamped` |

**Campo de conteúdo (nome) — `Needs Evidence`, não incluído**: mesma classe de bloqueio de `Party`/`Campaign` — nenhuma fonte nomeia um campo `name`/`title` para `Dashboard`.

## 5. Estrutura Proposta — `Widget` (Internal Entity de `Dashboard`)

| Campo | Tipo candidato | Obrigatório/Opcional | Evidência |
|---|---|---|---|
| `id` | `UniqueEntityId` (herdado) | Obrigatório | Padrão de toda Entity |

**Nenhum outro campo definível** — nem tipo de visualização (gráfico/número/tabela), nem posição/layout, nem a forma de `Metric` que exibe têm qualquer evidência documental. Diferente de `Task` (que ao menos tinha `status` pronto), `Widget` está inteiramente bloqueado além de sua existência estrutural.

## 6. Domain Events Candidatos

Nenhum — nenhum evento relacionado a `Dashboard`/`Widget`/`Metric` está na lista de 10 eventos oficiais (`DOMAIN_MODEL.md § EVENT BUS`), e nenhum tem seção `Eventos:` própria em `BOM.md` (diferente de `Activity`). Nenhum evento é inventado.

## 7. Objetos Bloqueados

| Objeto | Status |
|---|---|
| `Metric` | Relação com `Widget` confirmada, forma (VO embutido vs. referência) não resolvida (§ 3) |
| `Report` | Sem relação documentada com `Dashboard`/`Widget` — bloqueado |
| `Snapshot` | Idem |
| `Forecast` | Idem |
| `Benchmark` | Idem |

## 8. Perguntas Remanescentes

1. Campo `name`/`title` de `Dashboard` — não definido.
2. Forma de `Widget` além de sua existência (tipo de visualização, layout) — totalmente bloqueada.
3. `Metric`: Value Object embutido em `Widget` ou referência a um catálogo próprio? Não resolvido.
4. `Report`/`Snapshot`/`Forecast`/`Benchmark` — nenhuma relação com `Dashboard` documentada; podem ser Aggregates próprios, futuros, ou nunca implementados — não avaliado aqui.

## 9. Recomendação

A pergunta estrutural original (`Widget`: Entity ou Aggregate Root?) está **resolvida** — Internal Entity de `Dashboard`. Diferente de `Project`/`Task` e `Invoice`/`Subscription`, porém, `Analytics` não tem evidência suficiente para uma ADR de campos mínimos equivalente a `ADR-0030`/`ADR-0031` — mesmo o campo `name` de `Dashboard` e a forma de `Widget` exigiriam decisões majoritariamente inventadas, não apenas preenchendo uma lacuna óbvia. Recomenda-se aguardar um caso de uso de negócio real (ex.: um cliente pedindo dashboards de vendas) antes de forçar essas decisões.

---

## Domain Model Validation

Entity criada? **NÃO.** Aggregate criado? **NÃO.** Value Object criado? **NÃO.** Domain Event criado? **NÃO.**

## Relação com Outros Módulos

- [AGGREGATE_DISCOVERY.md § 4](../decisions/AGGREGATE_DISCOVERY.md) — origem da pergunta resolvida aqui
- [ADR-0021](../../../adr/ADR-0021-pipeline-nature.md), [ADR-0026](../../../adr/ADR-0026-project-task-structure.md) — precedentes diretos do critério "reuso entre múltiplos pais" usado para confirmar `Widget` como Entity

## Status

🟢 Design tático concluído. Pergunta estrutural resolvida (`Widget` = Internal Entity). Implementação real requer decisões de campo ainda mais especulativas que os domínios anteriores — recomendado aguardar caso de uso concreto.

> **Nota de Resolução (`ADR-0049`, `ENG-0154`)**: o caso de uso concreto chegou — o CTO confirmou 4 tipos de visualização (`kpi`/`list`/`donut`/`bar`). `Metric` (§ 3, "Value Object embutido vs. referência a catálogo próprio, não resolvido") foi resolvido de forma diferente do que este documento antecipava: em vez de um Value Object `Metric` estruturado, `Widget` guarda uma string opaca (`metricKey`) que só o Frontend interpreta — evita que o Analytics Domain precise conhecer/validar dados de Sales/Activity/outros domínios, mantendo a regra de dependência entre Business Domains intacta. `Report` (linha 67) segue sem relação documentada — não resolvido por esta missão.
