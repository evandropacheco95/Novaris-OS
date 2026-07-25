# ADR-0011 — CRM Domain Position: Product Capability, Not Bounded Context

Versão: 1.0.0

Status: Aceito

Missão: ENG-0019 (CRM Domain Architecture Resolution)

---

## ⚠️ Nota de Numeração e Localização (registrada, não corrigida silenciosamente)

A Ordem de Missão `ENG-0019` pediu este documento como `knowledge/architecture/decisions/ADR-0008-crm-domain-position.md`. Duas correções foram aplicadas, ambas registradas aqui em vez de executadas silenciosamente — mesma disciplina já usada em `ENG-0000.5` quando a missão pediu `ADR-0009-foundation-freeze.md` e o número real disponível era `ADR-0008`:

1. **Numeração**: `ADR-0008` já existe — [`adr/ADR-0008-foundation-freeze.md`](../../../adr/ADR-0008-foundation-freeze.md), Aceito, sobre Foundation Freeze & Governance Integration, sem nenhuma relação com CRM. `adr/README.md § Convenção de Nomenclatura` é explícito: "Numeração sequencial, sempre crescente, nunca reutilizada". O índice real (`adr/README.md`) vai de `ADR-0001` a `ADR-0010` sem lacunas, mais `ADR-ORG-001` (padrão alternativo, já registrado como não reconciliado). O próximo número sequencial livre é **`ADR-0011`** — usado neste documento.
2. **Localização**: todo ADR até hoje vive em `adr/` (índice único, `adr/README.md`). Este documento foi criado em `knowledge/architecture/decisions/` porque a Ordem de Missão `ENG-0019` especificou esse caminho literalmente, e o escopo desta missão não autoriza mover/criar arquivos em `adr/`. Isso introduz uma **segunda localização com nomenclatura `ADR-NNNN`**, fora do índice único de `adr/README.md` — a mesma classe de fragmentação que `adr/README.md § Convenção` já registrou (não resolvida) para `ADR-ORG-001`. Não reconciliado aqui; registrado como item de governança pendente (ver Consequências e Próxima Missão Recomendada no relatório final).

Nenhum conteúdo de `adr/ADR-0008-foundation-freeze.md` foi lido, alterado ou referenciado além desta nota de desambiguação.

---

## Context

`DOMAIN_MODEL.md` (documento canônico do Domain Layer, confirmado pelo CTO em `ENG-0011` item 1) define 13 domínios de negócio e afirma textualmente, na quinta lista de domínios/produtos desta engenharia: **"não há domínio 'CRM' aqui; a funcionalidade de CRM fica distribuída entre Relationship, Sales e Activity"** (`DOMAIN_MODEL.md`, linha 610).

Em tensão direta com essa afirmação, a decisão formal do CTO em `ENG-0011` (item 9, refletida em `CONTEXT_RELATIONSHIPS.md`) atribuiu o objeto `Queue` ao "domínio CRM", tratando-o implicitamente como um Bounded Context já existente e capaz de possuir um objeto.

Duas missões de investigação, sem autoridade para inventar ou resolver o conflito, já reuniram toda a evidência documental disponível:

- **`CRM_DOMAIN_DISCOVERY.md`** (ENG-0015) — Discovery dedicada a "CRM", usando o mesmo método de 6 critérios/3 perguntas já aplicado a `Permission` (EPIC-004) e `Event Bus` (EPIC-006). Concluiu **B) CRM Design Freeze Blocked**.
- **`PRODUCT_DOMAIN_ARCHITECTURE.md`** (ENG-0016) — reconciliação Product Layer × Domain Layer para os 9 produtos de `PRODUCTS.md`. Concluiu que `CRM` é entregue por `Customer + Sales + Activity` (composição, sem domínio próprio), generalizando o achado de `ENG-0015`.

`NOVARIS_PLATFORM_ARCHITECTURE.md § 12` ("Official Pending Decisions") e § 14 ("Future Evolution Guidelines", item 1) já registram esta questão como a pendência de arquitetura de maior prioridade herdada do EPIC-007, recomendando resolução "antes de qualquer implementação que cite CRM como domínio". `ARCHITECTURE_GOVERNANCE.md` já nomeia dois princípios diretamente aplicáveis: **"Evidence Before Freeze"** (nenhum domínio avança a Design Freeze sem evidência documental suficiente — citando `CRM_DOMAIN_DISCOVERY.md` como o único caso já bloqueado por esse princípio) e **"Product ≠ Domain"** (um produto nunca é, por si, uma fronteira de dados — citando `ADR-0007` e reafirmado por `PRODUCT_DOMAIN_ARCHITECTURE.md`).

Esta ADR não reabre a investigação — consolida a evidência já coletada por `ENG-0015`/`ENG-0016` em uma decisão arquitetural formal e vinculante, encerrando o conflito de existência do domínio "CRM".

## Problem Statement

"CRM" é tratado, em fontes diferentes desta engenharia, como duas coisas incompatíveis:

1. Um **produto comercial** (`PRODUCTS.md`, `NOVARIS_OS.md § 7`, `SYSTEM_ARCHITECTURE.md § 5`) — sentido em que sempre apareceu até `ENG-0011`.
2. Um **Bounded Context do Domain Layer**, implícito na decisão do CTO (`ENG-0011` item 9) de atribuir `Queue` a "CRM" como Owner.

`DOMAIN_MODEL.md`, a fonte canônica confirmada para exatamente essa camada, nega explicitamente o sentido (2). Prosseguir com qualquer implementação, especificação ou modelagem tática que trate "CRM" como domínio — sem resolver essa tensão — significaria construir sobre uma premissa que o próprio documento canônico contradiz.

**Pergunta a decidir**: "CRM" deve ser formalizado como (A) um Bounded Context próprio, com Aggregate, linguagem ubíqua e ciclo de vida a serem modelados; ou (B) permanecer exclusivamente uma capacidade de produto (Product Layer), entregue por composição de Bounded Contexts de negócio já existentes, sem nunca ganhar uma pasta/domínio próprio em `services/domains/`?

## Considered Options

### Option A — CRM as a standalone Bounded Context

Formalizar "CRM" como 14º domínio de `DOMAIN_MODEL.md`, com Aggregate(s), linguagem ubíqua e Repository próprios, absorvendo total ou parcialmente `Relationship`/`Sales`/`Activity`.

**Rejeitada.** Evidência contra, toda já coletada por `ENG-0015`/`ENG-0016`, sem necessidade de nova investigação:

- O documento canônico do Domain Layer nega textualmente sua existência (`DOMAIN_MODEL.md`, linha 610) — adotar Option A exigiria emendar `DOMAIN_MODEL.md`, fora do escopo desta missão (`ENG-0019` proíbe explicitamente alterar domínios existentes) e sem nenhuma evidência nova que justifique a emenda.
- `specifications/crm/` está 100% vazia (9 de 10 arquivos, stub de 3 linhas, `TODO`) — nenhuma Object Specification, Entity, Value Object ou regra de negócio existe para se congelar.
- O único conceito atribuído a "CRM" (`Queue`) não tem nenhuma definição além de menções em listas de objeto de dois *outros* domínios (`Automation`, `System`) — nenhuma identidade de negócio, ciclo de vida ou invariante documentados.
- `Lead` — o termo mais associado a CRM na indústria — está explicitamente marcado como **fora de escopo e proibido** em `UBIQUITOUS_LANGUAGE.md` (2 ocorrências). `Deal` só existe como sinônimo informal de `Opportunity` (Sales). `Interaction` não é um termo modelado — `Activity` já cobre esse conceito.
- Adotar Option A violaria diretamente o princípio **"Evidence Before Freeze"** (`ARCHITECTURE_GOVERNANCE.md`) e a disciplina desta engenharia inteira de nunca inventar Bounded Context, linguagem ubíqua ou Aggregate sem fonte documental.

### Option B — CRM as a Product capability composed by multiple Business Domains

Confirmar "CRM" exclusivamente como item do Product Layer (`PRODUCTS.md`), entregue pela composição de `Customer` (`Relationship`) + `Sales` + `Activity`, sem nunca ganhar Bounded Context, Aggregate ou pasta própria em `services/domains/`.

**Escolhida.** Evidência a favor, toda já coletada:

- Consistente, sem exceção, com o texto canônico de `DOMAIN_MODEL.md` (linha 610).
- Mesmo padrão já estabelecido por `ADR-0007` para `Growth` — outro produto sem domínio próprio, composto por múltiplos Bounded Contexts (`Sales`, `Customer`, `Marketing`, `Analytics`). `ADR-0007 § Impacto Futuro no SaaS` já previa exatamente este tipo de caso para produtos futuros.
- `PRODUCT_DOMAIN_ARCHITECTURE.md § 4` já formaliza a composição: `CRM → Customer + Sales + Activity`.
- Não exige nenhuma invenção de conteúdo — todos os três domínios de composição (`Customer`, `Sales`, `Activity`) já existem em `DOMAIN_MODEL.md` e têm scaffolding real ou candidato a Aggregate já identificado (`AGGREGATE_DISCOVERY.md`).

### Option C — Defer indefinitely, keep the conflict open

Não decidir agora; manter `CRM_DOMAIN_DISCOVERY.md`/`PRODUCT_DOMAIN_ARCHITECTURE.md` como registro de conflito não resolvido, como estavam antes desta missão.

**Rejeitada.** `NOVARIS_PLATFORM_ARCHITECTURE.md § 14` (Future Evolution Guidelines, item 1) já recomendou resolver este conflito "antes de qualquer implementação que cite CRM como domínio" — adiar indefinidamente contradiz a própria recomendação da missão anterior e mantém um risco ativo de implementação incorreta caso qualquer trabalho futuro cite "CRM" sem checar esta ADR primeiro. A Ordem de Missão `ENG-0019` pede explicitamente uma decisão, não mais um registro de conflito.

## Architectural Decision

**Option B.** "CRM" é, e permanece, exclusivamente uma capacidade do Product Layer (`PRODUCTS.md`). Não existe, não existirá por esta decisão, e não deve ser criado nenhum Bounded Context, Aggregate, Repository, pasta em `services/domains/` ou entrada em `DOMAIN_MODEL.md` com o nome "CRM".

O produto comercial "CRM" é entregue pela composição de três Bounded Contexts do Domain Layer já existentes, sem exclusividade nem posse total sobre nenhum deles:

- **`Customer`** (`Relationship` em `DOMAIN_MODEL.md`, renomeado por `ADR-0007`) — Contact e demais objetos de relacionamento.
- **`Sales`** — `Opportunity`/`Pipeline` e o fluxo comercial.
- **`Activity`** — registro de interação (ligação, WhatsApp, e-mail, reunião, visita, nota).

Nenhum destes três domínios é "dono" do produto CRM; cada um mantém seu próprio Bounded Context, Aggregate(s) e ciclo de vida, servindo também a outros produtos (`Growth`, por exemplo, já composto pelos mesmos `Sales`/`Customer` mais `Marketing`/`Analytics`, por `ADR-0007`).

## Consequences

**Positivas:**

- Encerra formalmente o conflito de existência levantado por `ENG-0015`/`ENG-0016` — qualquer trabalho futuro que cite "CRM" deve tratá-lo como Product Layer, nunca como domínio.
- Nenhuma invenção de conteúdo foi necessária — a decisão segue exatamente a evidência já coletada, sem modelar nada novo.
- Reforça o precedente de `ADR-0007` (Product ≠ Domain) para o segundo caso real da plataforma, tornando o princípio mais robusto para os próximos produtos ainda não avaliados (`Studio`, `Marketplace`, `AI`, `Automation` — ver `PRODUCT_DOMAIN_ARCHITECTURE.md § 8`).

**Negativas / pendências reabertas, não resolvidas por esta ADR:**

- **A atribuição de `Queue` a "CRM"** (`ENG-0011` item 9, refletida em `CONTEXT_RELATIONSHIPS.md § 5`, `DOMAIN_OWNERSHIP.md`, e `NOVARIS_PLATFORM_ARCHITECTURE.md § 11` linha "`Queue` pertence a `CRM`") **deixa de ser uma atribuição de Domain Layer válida** — "CRM" não é mais (nunca foi, por esta ADR) um Owner possível no sentido de `DOMAIN_MODEL.md`. Isso **reabre**, sem resolver aqui, a pergunta de qual é o verdadeiro Owner de `Queue`. As únicas duas fontes que efetivamente descrevem `Queue` como objeto técnico/operacional são `Automation` e `System` (`DOMAIN_MODEL.md`, onde já aparece duplicado nos dois). Esta ADR **não decide** entre os dois — essa é uma nova decisão do CTO, fora da autoridade desta missão (ver Domain Impact).
- Os documentos que registram "`Queue` pertence a `CRM`" (`CONTEXT_RELATIONSHIPS.md`, `DOMAIN_OWNERSHIP.md`, `NOVARIS_PLATFORM_ARCHITECTURE.md`) **não foram alterados** por esta missão — `ENG-0019` restringe o escopo à criação deste documento de decisão, sem autorização para editar domínios/decisões já existentes. Essas três referências ficam **stale** (contradizem esta ADR) até uma missão de reatribuição de `Queue` ser formalmente executada. Registrado, não corrigido silenciosamente — mesma disciplina de toda esta engenharia.
- `specifications/crm/` permanece vazia; esta ADR não a preenche (fora de escopo — nenhum conteúdo de especificação de produto foi criado ou alterado).

## Domain Impact

- **Nenhuma Entity, Aggregate, Value Object ou Domain Event foi criado ou alterado.** `DOMAIN_MODEL.md` permanece exatamente como estava — esta ADR confirma sua leitura literal, não a contradiz nem a emenda.
- **Nenhum domínio existente foi modificado.** `Customer`, `Sales` e `Activity` continuam com o status que já tinham (`Scaffolding`/`Future`, por `PRODUCT_DOMAIN_ARCHITECTURE.md § 3`) — esta ADR não avança nem regride a maturidade de nenhum dos três.
- **Owner de `Queue` fica formalmente indeterminado** a partir desta ADR (era "CRM", que deixa de ser um Owner válido). Não é atribuído a `Automation` nem a `System` por esta ADR — essa reatribuição exigiria uma nova decisão do CTO, não inferível apenas da evidência já reunida (ambos os domínios têm exatamente o mesmo grau de evidência: uma menção em lista de objeto, sem atributo, ciclo de vida ou regra de negócio).
- **Nenhum impacto sobre os 3 Kernel Domain Capabilities** (`Identity`, `Organization`, `Audit`) — nenhum dos três participa da composição de CRM.

## Future Implications

1. **Reatribuição de `Queue`** deve ser o objeto de uma missão dedicada e estreita (ex.: `ENG-0020`), decidindo entre `Automation` e `System` com a mesma disciplina de evidência já usada aqui — ou, alternativamente, elevando `Queue` a um Discovery completo (linguagem ubíqua, Aggregate, ciclo de vida) caso exista razão de negócio para tratá-lo como Aggregate real, não apenas objeto técnico.
2. **Atualização de referências stale** — uma missão futura, com escopo explícito para editar `CONTEXT_RELATIONSHIPS.md`, `DOMAIN_OWNERSHIP.md` e `NOVARIS_PLATFORM_ARCHITECTURE.md § 11`, deve substituir "`Queue` pertence a `CRM`" pela reatribuição real, uma vez decidida.
3. **Precedente para os demais produtos pendentes** (`Studio`, `Marketplace`, `AI`, `Automation`) — `PRODUCT_DOMAIN_ARCHITECTURE.md § 8` já lista essas confirmações como pendentes; esta ADR é o primeiro caso completo (Discovery → Reconciliação → ADR) e deve servir de modelo de processo para os demais, especialmente `Studio` (o único produto sem nenhuma composição sequer hipotética).
4. **Fragmentação de nomenclatura `ADR-NNNN`** (nota de abertura deste documento) — a existência de ADRs em `adr/` (índice único) e agora também em `knowledge/architecture/decisions/` (por instrução literal de `ENG-0019`) é um item de governança pendente, não resolvido aqui. Recomenda-se que uma futura missão decida se `knowledge/architecture/decisions/` deve (a) migrar seus documentos "ADR-style" para `adr/` sob a sequência única, ou (b) ser formalmente reconhecida como uma segunda categoria de decisão (não-ADR, "Architecture Decision" de domínio/produto), com nomenclatura própria distinta de `ADR-NNNN` para não competir com o índice de `adr/README.md`.
5. **`specifications/crm/`** — permanece vazia; uma missão futura pode registrar formalmente, no próprio `specifications/crm/overview.md`, que o produto é entregue por composição (`Customer + Sales + Activity`), sem pasta de domínio própria — mesmo tratamento já recomendado para `Growth` por `ADR-0007`.

## Responsável

Decisão de arquitetura: Engenheiro Principal, por delegação da Ordem de Missão `ENG-0019`, com base exclusiva na evidência já reunida e aprovada implicitamente pelo CTO em `ENG-0015`/`ENG-0016` (nenhuma missão de aprovação intermediária rejeitou suas conclusões). Execução: Engenheiro Principal.

## Data

2026-07-16

## Status

Aceito

---

## Relação com Outros Módulos

- [DOMAIN_MODEL.md](../../core/DOMAIN_MODEL.md) — fonte canônica, linha 610, base decisiva desta ADR
- [../analysis/CRM_DOMAIN_DISCOVERY.md](../analysis/CRM_DOMAIN_DISCOVERY.md) (ENG-0015) — evidência primária, conclusão B) reafirmada aqui
- [PRODUCT_DOMAIN_ARCHITECTURE.md](PRODUCT_DOMAIN_ARCHITECTURE.md) (ENG-0016) — evidência de composição, matriz § 4
- [NOVARIS_PLATFORM_ARCHITECTURE.md](NOVARIS_PLATFORM_ARCHITECTURE.md) (ENG-0017) — § 12/§ 14, pendência agora resolvida por esta ADR
- [../governance/ARCHITECTURE_GOVERNANCE.md](../governance/ARCHITECTURE_GOVERNANCE.md) (ENG-0018) — princípios "Evidence Before Freeze" e "Product ≠ Domain" aplicados
- [adr/ADR-0007-domain-boundaries.md](../../../adr/ADR-0007-domain-boundaries.md) — precedente direto (Growth como Product Layer sem domínio próprio)
- [adr/ADR-0008-foundation-freeze.md](../../../adr/ADR-0008-foundation-freeze.md) — **sem relação de conteúdo**; citado apenas para desambiguar a numeração (ver Nota de Numeração e Localização)
- [../CONTEXT_RELATIONSHIPS.md](../CONTEXT_RELATIONSHIPS.md) (ENG-0011) — origem da atribuição `Queue → CRM`, agora reaberta (ver Consequências)
- [../decisions/DOMAIN_OWNERSHIP.md](DOMAIN_OWNERSHIP.md) (ENG-0012) — referência stale de `Queue`, registrada não corrigida
