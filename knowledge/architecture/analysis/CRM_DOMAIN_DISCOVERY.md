# CRM — Domain Discovery

Versão: 1.0.0

Status: 🔴 Bloqueado para Design Freeze — evidência documental insuficiente

Missão: ENG-0015 (CRM Domain Discovery)

Escopo: investigar, com evidência rastreável e sem inventar nenhuma decisão de domínio, se "CRM" tem base documental suficiente para prosseguir a um Design Freeze tático. Nenhum código, módulo, Aggregate, Entity, Domain Model ou ADR foi criado/alterado. `knowledge/architecture/analysis/` foi criada (não existia); nenhum documento existente foi movido.

---

## 1. Resumo Executivo

**Achado decisivo, encontrado nesta Discovery**: `DOMAIN_MODEL.md` (o documento canônico do Domain Layer, confirmado pelo próprio CTO em `ENG-0011` item 1) **declara textualmente que não existe domínio "CRM"**: *"não há domínio 'CRM' aqui; a funcionalidade de CRM fica distribuída entre Relationship, Sales e Activity"* (`DOMAIN_MODEL.md`, linha 610). Isso está em tensão direta com a decisão do CTO em `ENG-0011` item 9, que atribuiu `Queue` ao domínio `CRM` como se fosse um Bounded Context já existente. Além disso: a especificação de produto `specifications/crm/` tem **9 de 10 arquivos como stub de 3 linhas, 100% `TODO`**; o termo "Lead" — o conceito mais associado a CRM na indústria — é **explicitamente marcado como fora de escopo e proibido como sinônimo** em `UBIQUITOUS_LANGUAGE.md`, duas vezes; "Deal" existe só como sinônimo informal de `Opportunity` em prosa, nunca como objeto próprio; "Interaction" não existe como termo — `Activity` já é definida como o registro de interação. A conclusão desta Discovery é **B) CRM Design Freeze Blocked**.

## 2. Conceitos Encontrados

| Conceito | Documento(s) | Contexto | Descrição | Pertence ao CRM? | Pertence a outro domínio? | Conflito documental? |
|---|---|---|---|---|---|---|
| **CRM** | `SYSTEM_ARCHITECTURE.md § 5`, `PRODUCTS.md`, `NOVARIS_OS.md § 7`, `specifications/crm/`, `ENG-0011` item 9 | Product Layer (nos 3 primeiros); recém-nomeado como suposto Domain Layer (`ENG-0011`) | Nome de produto comercial em toda fonte de Product Layer; nunca um Bounded Context no Domain Layer | Não, como Domain Layer (ver Achado § 1) | Sim — `DOMAIN_MODEL.md` diz explicitamente que a funcionalidade fica em `Relationship`/`Sales`/`Activity` | **Sim — conflito real**: `DOMAIN_MODEL.md` nega a existência do domínio; `ENG-0011` o trata como Owner de `Queue` |
| **Lead** | `UBIQUITOUS_LANGUAGE.md` (2 ocorrências) | Mencionado só para ser **proibido** | "conceito de CRM fora do escopo desta missão" (citação literal, 2x) | Não determinável — nunca modelado | Não — nenhum domínio o reivindica | Não é conflito — é ausência confirmada de modelagem |
| **Contact** | `DOMAIN_MODEL.md` (Relationship Domain) | Objeto candidato | Um dos objetos de `Relationship`/`Customer` | Não — pertence a `Customer` | Sim — `Customer` (`AGGREGATE_DISCOVERY.md`) | Não |
| **Customer** | `services/domains/customer/`, `ADR-0007`, `DOMAIN_MODEL.md` (como "Relationship") | Bounded Context real (scaffolding) | Renomeado de "Relationship" por `ADR-0007` | Não — é seu próprio domínio, distinto de CRM | Sim — domínio próprio | Não |
| **Pipeline** | `DOMAIN_MODEL.md` (Sales), `UBIQUITOUS_LANGUAGE.md` | Objeto de Sales | "Fluxo de trabalho configurável... específico de Sales" (`UBIQUITOUS_LANGUAGE.md`, explicitamente distinto de `Workflow`/Automation) | Não — pertence a `Sales` | Sim — `Sales` | Não |
| **Queue** | `DOMAIN_MODEL.md` (Automation **e** System, duplicado), `ENG-0011` item 9 (Owner: CRM) | Objeto técnico/operacional | Nenhuma fonte descreve atributos, ciclo de vida ou regra de negócio | Sim, por decisão do CTO — mas ver § 5 | Citado também em Automation e System (duplicação original, `DOMAIN_MODEL.md § 6` já registrada) | **Sim** — decisão do CTO atribui a um domínio (`CRM`) que `DOMAIN_MODEL.md` nega existir |
| **Opportunity** | `DOMAIN_MODEL.md` (Sales), `UBIQUITOUS_LANGUAGE.md` | Aggregate candidato de Sales | "Oportunidade comercial... negociação em andamento com um Party"; eventos já nomeados: `OpportunityCreated`, `OpportunityWon`, **`OpportunityLost`** (este terceiro evento só aparece em `UBIQUITOUS_LANGUAGE.md`, ausente de `DOMAIN_MODEL.md § EVENT BUS`) | Não — pertence a `Sales` | Sim — `Sales` | Divergência menor: `OpportunityLost` citado em só 1 das 2 fontes |
| **Deal** | `UBIQUITOUS_LANGUAGE.md` | Sinônimo informal | "`Negócio`, `Deal` são aceitáveis em prosa" para `Opportunity` — nunca um objeto próprio | Não | Sim, como sinônimo de `Opportunity` (Sales) | Não |
| **Interaction** | — | Não existe como termo próprio | `Activity` já é definida como "Registro de interação (ligação, WhatsApp, e-mail, reunião, visita, nota)" — `Interaction` não é um objeto separado | Não determinável — termo não modelado isoladamente | — | Não |
| **Timeline** | `UBIQUITOUS_LANGUAGE.md`, `DOMAIN_MODEL.md` (Activity) | Projeção, não objeto persistente | "Não usar como um objeto persistente próprio — é uma projeção de outros eventos" (citação literal) | Não | `Activity` (domínio) | Não |
| **Activity** | `DOMAIN_MODEL.md`, `UBIQUITOUS_LANGUAGE.md` | Domínio + objeto | Domínio próprio (`AGGREGATE_DISCOVERY.md`); objeto "Registro de interação" distinto de `Task` | Não — é seu próprio domínio | Sim | Não |
| **Task** | `DOMAIN_MODEL.md` (Activity **e** Projects, duplicado), `UBIQUITOUS_LANGUAGE.md`, `ENG-0011` item 8 (Owner: Projects) | Entidade | Já resolvido — Owner confirmado `Projects` | Não | Sim — `Projects` (decisão CTO) | Já resolvido, não reaberto aqui |
| **Campaign** | `DOMAIN_MODEL.md`, `BOM.md` (Marketing) | Objeto de Marketing | Citado em ambas as fontes (dupla confirmação) | Não — pertence a `Marketing` | Sim — `Marketing` | Não |
| **Sales** | `DOMAIN_MODEL.md`, `services/domains/sales/` | Bounded Context real (scaffolding) | Domínio próprio, distinto de CRM | Não — é seu próprio domínio | Sim | Não |
| **Marketing** | `DOMAIN_MODEL.md`, `services/domains/marketing/` | Bounded Context real (scaffolding) | Domínio próprio, distinto de CRM | Não | Sim | Não |
| **Organization** | Todo o EPIC-003 | Bounded Context real (implementado) | Sem relação direta com "CRM" — referência universal (RN001), não específica de CRM | Não | Sim — domínio próprio, já implementado | Não |

## 3. Ownership (Matriz Específica de CRM)

| Conceito atribuído a "CRM" | Fonte | Confiança |
|---|---|---|
| `Queue` | `ENG-0011` item 9 (decisão do CTO) | **Única atribuição existente** — sem nenhuma outra fonte, sem Object Specification, sem atributos |

Nenhum outro conceito, de nenhuma das 16 fontes pesquisadas, foi atribuído a "CRM" como domínio.

## 4. Conflitos

1. **Existência do domínio**: `DOMAIN_MODEL.md` (canônico, `ENG-0011` item 1) nega explicitamente que exista um domínio "CRM" — atribui sua funcionalidade a `Relationship`/`Sales`/`Activity`. `ENG-0011` item 9 trata "CRM" como um domínio já existente, capaz de possuir `Queue`. **Este é o conflito mais significativo encontrado por esta Discovery** — não inventado, não resolvido aqui.
2. **`OpportunityLost`**: citado em `UBIQUITOUS_LANGUAGE.md`, ausente de `DOMAIN_MODEL.md § EVENT BUS` — divergência menor, sem impacto em CRM diretamente (afeta `Sales`).
3. **`Queue` duplicado** entre Automation e System (`DOMAIN_MODEL.md`, já registrado antes desta missão) — resolvido por `ENG-0011` para `CRM`, mas isso **não gera conteúdo novo** sobre o que `Queue` realmente é.

## 5. Lacunas

- Nenhuma Object Specification, atributo, evento ou regra de negócio existe para `Queue` além de sua menção em duas listas de objeto (Automation, System).
- `specifications/crm/` — 9 de 10 arquivos são stub de 3 linhas (`overview.md`, `database.md`, `features.md`, `events.md`, `api.md`, `permissions.md`, `roadmap.md`, `screens.md`, `integrations.md`), todos `**TODO**`.
- Nenhuma fonte define Linguagem Ubíqua, Entidades, Value Objects ou Invariantes para "CRM" como Bounded Context.
- `Lead` — o termo mais associado a CRM na indústria — nunca foi modelado; `UBIQUITOUS_LANGUAGE.md` o marca explicitamente como fora de escopo duas vezes.

## 6. Recomendação

Não prosseguir para Design Freeze. Antes de qualquer modelagem tática de "CRM":

1. Resolver o conflito de existência (§ 4, item 1) — decisão do CTO sobre se "CRM" é, de fato, um Bounded Context novo (o que exigiria reabrir/emendar `DOMAIN_MODEL.md`, plausivelmente via ADR) ou se `Queue` deveria pertencer a `Automation`/`System` como as fontes originais já sugeriam antes de `ENG-0011`.
2. Se "CRM" for confirmado como Bounded Context novo, executar uma Discovery completa (Bounded Context, Linguagem Ubíqua, Object Specification) — o que esta missão não é, por escopo (só investigação de evidência já existente, sem inventar).
3. Preencher `specifications/crm/` com conteúdo real, ou registrar formalmente que esse produto será entregue pelos domínios já existentes (`Customer`, `Sales`, `Activity`), sem pasta própria — mesmo padrão já usado por `Growth` (`ADR-0007`).

## 7. Perguntas da Ordem — Respostas Explícitas

**`Queue` é realmente Aggregate Root, ou apenas um objeto operacional?**
Toda fonte que menciona `Queue` (Automation Domain, System Domain) o faz num contexto técnico/operacional (fila de execução, fila de eventos) — nenhuma fonte descreve identidade de negócio, ciclo de vida com significado de negócio, ou necessidade de ser referenciado por outro domínio de negócio. A evidência aponta para **objeto operacional/técnico**, não Aggregate Root de negócio — mesma natureza já confirmada para o vocabulário do Event Bus (`EVENT_BUS_DISCOVERY.md`). **Não confirmado formalmente** (exigiria a mesma Discovery rigorosa de 6 critérios já aplicada a Permission/Event Bus) — mas a evidência disponível não sustenta a hipótese de Aggregate Root de negócio.

**Existe evidência suficiente para CRM Design Freeze?**
Não. Ver § 8.

## 8. Conclusão

# B) CRM Design Freeze Blocked

**Justificativa, baseada apenas na documentação existente**: (a) o documento canônico do Domain Layer nega explicitamente a existência de um domínio "CRM"; (b) a especificação de produto está 100% vazia (9 de 10 arquivos, `TODO`); (c) o único conceito atribuído a "CRM" (`Queue`) não tem nenhuma definição além de uma menção em lista de objeto de outros dois domínios; (d) o termo mais associado a CRM (`Lead`) foi explicitamente marcado como fora de escopo em outra missão oficial. Prosseguir a um Design Freeze agora exigiria inventar Bounded Context, linguagem ubíqua e Aggregate inteiros sem nenhuma fonte — exatamente o que esta cadeia de missões se recusa a fazer.

---

## Validações

- **Link Checker** (`-Root` explícito): ver ENG-0015 FINAL REPORT.
- **ARG (ENS-0002)**: N/A nos critérios de código; PASS nos demais.
- **Domain Model Validation**: nenhuma Entity/Aggregate/Value Object/Domain Event criado; nenhuma alteração a `DOMAIN_MODEL.md` ou a qualquer ADR; o conflito encontrado (§ 4) é registrado, não resolvido.

## Relação com Outros Módulos

- [DOMAIN_MODEL.md](../../core/DOMAIN_MODEL.md) — fonte do achado decisivo (linha 610, "não há domínio CRM")
- [UBIQUITOUS_LANGUAGE.md](../../core/UBIQUITOUS_LANGUAGE.md) — fonte de `Lead`/`Deal`/`Timeline`/`Activity`/`Opportunity`
- [../CONTEXT_RELATIONSHIPS.md](../CONTEXT_RELATIONSHIPS.md) (ENG-0011) — origem da decisão que atribuiu `Queue` a `CRM`
- [../decisions/DOMAIN_OWNERSHIP.md](../decisions/DOMAIN_OWNERSHIP.md) (ENG-0012), [../decisions/AGGREGATE_DISCOVERY.md](../decisions/AGGREGATE_DISCOVERY.md) (ENG-0013) — registros anteriores de `CRM` como "nomeado, sem Bounded Context", agora aprofundados
- [specifications/crm/](../../../specifications/crm/README.md) — especificação de produto, confirmada vazia

## Status

🔴 **CRM Design Freeze Blocked** (Missão ENG-0015). Nenhum código, Aggregate, Entity ou ADR criado/alterado. Conflito de existência do domínio registrado, não resolvido — aguarda decisão do CTO.
