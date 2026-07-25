# ADR-0020 — Sales Quotation Position: Distinct Concept, Owner Confirmed, Content Pending

## Context

`SALES_DOMAIN_DISCOVERY.md` (ENG-0032) identificou `Quotation` como o único dos 7 objetos originais de `DOMAIN_MODEL.md § SALES DOMAIN` sem nenhuma correspondência em `BOM.md` ou `UBIQUITOUS_LANGUAGE.md § Domínio: Sales`, classificando-o como `Needs Evidence` e recomendando resolução antes de avançar à Fase 2 (`Aggregate Design Freeze`) de `Opportunity`. Esta ADR é essa resolução.

## Evidence

- `DOMAIN_MODEL.md § SALES DOMAIN`, "Objetos": `Opportunity`, `Pipeline`, `Stage`, `Proposal`, **`Quotation`**, `Contract`, `Revenue` — presente na versão original, nunca alterado.
- `BOM.md § 5 Business Objects`: lista `Opportunity`, `Pipeline`, `Stage`, `Proposal`, `Contract`, `Revenue` — **`Quotation` ausente**, confirmado por busca direta nesta missão.
- `UBIQUITOUS_LANGUAGE.md § Domínio: Sales`: mesma lista de 6 termos que `BOM.md`, sem entrada própria para `Quotation` e sem nota residual do tipo já usada para outros objetos divergentes (comparar com `§ Domínio: Financial`: *"`Billing`, `Commission` — nomeados em `DOMAIN_MODEL.md § FINANCIAL DOMAIN`, não são objetos do BOM"* — `Quotation` não recebe nem esse reconhecimento mínimo).
- **`PROJECT_RULES.md`** (fonte independente, anterior a `UBIQUITOUS_LANGUAGE.md`): já registrava, desde a missão original que produziu `DOMAIN_MODEL.md`, que o documento "nomeia ~25 objetos (`Epic`, `Story`, `Contact`, **`Quotation`**, `Commission`, entre outros) que não constam no BOM" — confirma que a divergência é estrutural e antiga, não um esquecimento desta engenharia.
- **Achado decisivo**: `UBIQUITOUS_LANGUAGE.md § Domínio: Sales`, entrada de `Proposal`, campo "Sinônimos Proibidos": **`"Orçamento" é proibido como sinônimo`** — sem a qualificação "aceitável em prosa" usada para sinônimos informais do mesmo conceito (comparar com `Opportunity`: *"`Negócio`, `Deal` são aceitáveis em prosa"*). Em todo outro uso desse padrão no documento (`Stage`/`"Fase"`, `Pipeline`/`"Workflow"`, `Revenue`/`"Faturamento"`, `Workspace`/`"Tenant"`), o termo proibido sempre se refere a um **conceito genuinamente diferente**, nunca ao mesmo conceito com nome errado. "Orçamento" é a tradução literal de "Quotation" — a mesma convenção sugere que `Quotation`/`Orçamento` foi deliberadamente entendido, por quem escreveu `UBIQUITOUS_LANGUAGE.md`, como **algo diferente de `Proposal`**, não um sinônimo a ser corrigido para o mesmo conceito.
- **Documentação de `Financial`**: `DOMAIN_MODEL.md § FINANCIAL DOMAIN`, "Objetos": `Invoice`, `Expense`, `Payment`, `Subscription`, `Billing`, `Commission` — nenhuma menção a `Quotation`, `Orçamento` ou qualquer conceito de estimativa de preço pré-venda. `Quotation` nunca foi listado em `Financial` em nenhuma fonte.
- `specifications/` — não existe pasta dedicada a `Sales` nem a `Financial` com conteúdo real (ambas fora dos 9 produtos de `PRODUCTS.md`, que é uma lista de Product Layer, não de Domain Layer); nenhuma especificação funcional cita `Quotation`.

## Vocabulary Comparison

| Aspecto | `Proposal` | `Quotation` |
|---|---|---|
| **Definição própria** | "Proposta comercial" (`BOM.md`) | Nenhuma — nunca definido em nenhuma fonte |
| **Momento típico no funil comercial** (inferido da definição de `Proposal`) | "Documento formal de oferta a um Party" — momento de oferta já estruturada | Não determinável — nenhuma fonte posiciona `Quotation` no funil |
| **Evento nomeado** | `ProposalApproved` (`UBIQUITOUS_LANGUAGE.md`) | Nenhum |
| **Tratamento como sinônimo** | N/A (é o termo oficial) | Explicitamente **proibido como sinônimo** de `Proposal` — não "aceitável em prosa" |
| **Presença em `BOM.md`** | Sim, com relacionamentos e eventos | Não |
| **Presença em `PROJECT_RULES.md`** | Não citado como divergente | Citado nominalmente como um dos objetos divergentes do BOM, desde a missão original |

**Leitura**: a proibição explícita de usar "Orçamento" como sinônimo de `Proposal`, seguindo a mesma convenção usada em todo o resto do documento para apontar conceitos genuinamente distintos, é o único sinal de conteúdo real sobre `Quotation` existente em qualquer fonte — e ele aponta para **distinção**, não identidade.

## Options

### Option A — Quotation is the same concept as Proposal

**Rejeitada.** Contradiria diretamente a convenção de "Sinônimos Proibidos" já em uso — se `Quotation`/`Orçamento` fosse o mesmo conceito que `Proposal`, a entrada correta seria listá-lo como sinônimo "aceitável em prosa" (mesmo tratamento de `Negócio`/`Deal` para `Opportunity`), não como proibido.

### Option B — Quotation is a separate Sales concept

**Escolhida.** Único resultado consistente com a evidência: nomeado desde a versão original de `DOMAIN_MODEL.md`; citado como termo próprio (não como erro) por `PROJECT_RULES.md` desde a missão que produziu o documento; distinguido explicitamente de `Proposal` pela convenção de Sinônimos Proibidos. Seu conteúdo (atributos, ciclo de vida, posição no funil) permanece **não modelado** — a distinção é confirmada, a modelagem não.

### Option C — Quotation belongs to Financial Domain

**Rejeitada.** Nenhuma fonte, em nenhum momento, associa `Quotation` a `Financial` — `DOMAIN_MODEL.md § FINANCIAL DOMAIN` não o lista; nenhuma definição o compara a `Invoice`/`Billing`/`Payment`. Diferente do caso `Subscription` (que tinha citação dupla real em `Workspace`/`Financial`, resolvida por `ENG-0011` item 7), `Quotation` nunca teve nenhuma citação em `Financial` para se reatribuir.

### Option D — Quotation should be removed as obsolete terminology

**Rejeitada.** A ausência de conteúdo não é evidência de obsolescência — é evidência de **não modelado ainda**, distinção já estabelecida por esta engenharia desde `CRM_DOMAIN_DISCOVERY.md § 8` ("prosseguir exigiria inventar... exatamente o que esta cadeia de missões se recusa a fazer" — o inverso, remover sem evidência de que é erro, seria o mesmo tipo de decisão não sustentada). A proibição de sinônimo em `UBIQUITOUS_LANGUAGE.md` é evidência ativa de que o termo foi tratado como significativo, não como resíduo a descartar.

## Decision

**Option B.** `Quotation` é confirmado como um conceito de `Sales` **distinto** de `Proposal` — mesma leitura já embutida na convenção de "Sinônimos Proibidos" de `UBIQUITOUS_LANGUAGE.md`, elevada agora a decisão de arquitetura rastreável. **Owner: `Sales`** (reafirma `DOMAIN_OWNERSHIP.md`, nunca esteve em disputa — `Quotation` sempre esteve listado sob `Sales`, nunca sob outro domínio).

O **conteúdo** de `Quotation` (atributos, campos, ciclo de vida, se é Entity própria ou Value Object, sua posição exata em relação a `Opportunity`/`Proposal` no funil comercial) **não é definido por esta ADR** — permanece `Needs Evidence`/bloqueado para modelagem tática, a ser resolvido junto com a Fase 2 (`Aggregate Design Freeze`) de `Opportunity`, já recomendada por `SALES_DOMAIN_DISCOVERY.md`. Não inventar hoje seria repetir o erro que esta engenharia já se recusou a cometer para `CRM`.

## Consequences

**Positivas:**
- Resolve a única lacuna que impedia `SALES_DOMAIN_DISCOVERY.md` de recomendar avanço direto à Fase 2 — `Quotation` deixa de ser uma incógnita indeterminada (sinônimo? domínio errado? erro?) e passa a ser um conceito confirmado, apenas ainda não modelado.
- Demonstra que a convenção "Sinônimos Proibidos" de `UBIQUITOUS_LANGUAGE.md`, criada para uso cotidiano de linguagem, também serve como evidência arquitetural válida quando aplicada com o mesmo rigor de outras fontes — precedente reutilizável.
- Não força modelagem prematura — respeita "Evidence Before Freeze".

**Negativas / pendências:**
- `Quotation` permanece sem Object Specification — nenhuma tabela, API ou tela pode referenciá-lo até uma Aggregate Design Freeze de `Sales` resolver sua forma exata.
- `BOM.md` e `UBIQUITOUS_LANGUAGE.md § Domínio: Sales` não foram alterados por esta ADR — poderiam, em missão futura de manutenção, ganhar uma entrada mínima "`Quotation` — conceito confirmado, conteúdo pendente, ver `ADR-0020`" (mesmo padrão já usado para `Billing`/`Commission` em `Financial`), não executado aqui por disciplina de escopo.
- `DOMAIN_MODEL.md` não é alterado — `Quotation` continua listado sem anotação no documento canônico.

## Responsável

Decisão de arquitetura: Engenheiro Principal, por delegação da Ordem de Missão `ENG-0033`, resolvendo a lacuna explicitamente identificada por `SALES_DOMAIN_DISCOVERY.md` (ENG-0032). Execução: Engenheiro Principal.

## Data

2026-07-16

## Impactos

Criado: `adr/ADR-0020-sales-quotation-position.md`. Nenhum código, Entity, Aggregate, service ou contract criado/alterado. `DOMAIN_MODEL.md`, `BOM.md`, `UBIQUITOUS_LANGUAGE.md` não alterados.

## Plano de Migração

Não aplicável — nenhum código ou dado real referenciava `Quotation` antes desta decisão.

## Status

Aceito

---

## Relação com Outros Módulos

- [knowledge/architecture/analysis/SALES_DOMAIN_DISCOVERY.md](../knowledge/architecture/analysis/SALES_DOMAIN_DISCOVERY.md) — origem direta da lacuna resolvida por esta ADR
- [knowledge/core/DOMAIN_MODEL.md § SALES DOMAIN](../knowledge/core/DOMAIN_MODEL.md) — fonte original de `Quotation`, não alterada
- [knowledge/core/BOM.md § 5](../knowledge/core/BOM.md) — confirmação de ausência
- [knowledge/core/UBIQUITOUS_LANGUAGE.md § Domínio: Sales](../knowledge/core/UBIQUITOUS_LANGUAGE.md) — fonte do achado decisivo (Sinônimos Proibidos de `Proposal`)
- [PROJECT_RULES.md](../PROJECT_RULES.md) — confirmação independente e anterior da divergência
- [ADR-0017-task-vocabulary-separation.md](ADR-0017-task-vocabulary-separation.md) — precedente metodológico direto (resolução de ambiguidade de nome por análise de vocabulário)
- [ADR-0016-task-ownership.md](ADR-0016-task-ownership.md) — precedente de reafirmar Owner já correto sem reabrir a decisão original
