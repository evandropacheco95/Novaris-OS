# Relationship Domain Discovery

Versão: 1.0.0

Missão: ENG-0022 (Relationship Domain Discovery & Foundation)

**Achado registrado, não silencioso — colisão de Mission-ID**: `ENG-0022` já foi usado por uma missão anterior deste repositório ("Automation Domain Confirmation", que produziu `adr/ADR-0013-automation-domain-confirmation.md`, citado dezenas de vezes em `DOMAIN_MODEL.md`, `DOMAIN_OWNERSHIP.md`, `CONTEXT_RELATIONSHIPS.md`, `NOVARIS_PLATFORM_ARCHITECTURE.md`, `ADR-0012`, `ADR-0014`). Diferente do caso de `ENG-0020` (onde o artefato pedido já existia, exigindo parar), aqui o artefato pedido (`knowledge/architecture/discovery/RELATIONSHIP_DOMAIN_DISCOVERY.md`) **não existe** — confirmado por busca antes de escrever qualquer linha. Trata-se de uma colisão de numeração, não de duplicação de trabalho; prossegue-se com o conteúdo, registrando a colisão para correção de numeração futura.

**Achado adicional, não silencioso — inconsistência na própria Ordem de Missão**: a seção "CONTEXTO ATUAL DA NOVARIS" desta missão lista `Relationship`, `Sales`, `Customer`, `Communication`, `Intelligence`, `Analytics` como 6 "Business Domains" paralelos. Isso não corresponde à lista canônica de `DOMAIN_MODEL.md` (confirmada nesta Discovery, § "Current Architecture Context"): `Relationship` e `Customer` são **o mesmo domínio** (nomes conceitual/técnico do mesmo Bounded Context, `ADR-0007`), não dois domínios distintos; `Communication` não existe em nenhuma seção de `DOMAIN_MODEL.md`; `Intelligence` já foi resolvida como camada transversal (`ADR-0014`), não Business Domain. Esta Discovery segue a fonte canônica (`DOMAIN_MODEL.md`), não a lista da Ordem de Missão, pela mesma disciplina já aplicada a toda missão anterior desta engenharia diante de listas divergentes.

**Verify Before Reimplementing**: busca por "RELATIONSHIP_DOMAIN_DISCOVERY", "Relationship Domain Discovery" em todo o repositório — zero resultados antes desta missão. `knowledge/architecture/discovery/` não existe como pasta — todo Discovery anterior (`SALES_DOMAIN_DISCOVERY.md`, `CRM_DOMAIN_DISCOVERY.md`) vive em `knowledge/architecture/analysis/`; esta missão nomeia explicitamente um caminho novo (`discovery/`), divergindo do precedente estrutural sem justificativa própria — seguido literalmente por ser uma instrução explícita e inequívoca do CTO, registrado aqui como desvio de precedente, não como erro a corrigir silenciosamente.

---

## Status

🟢 Discovery concluída — nenhum código, Entity, Aggregate, Value Object ou regra de negócio criada. Achado central: `Relationship` **já é** um domínio canônico confirmado em `DOMAIN_MODEL.md`, com Bounded Context técnico já scaffolded (`services/domains/customer/`) — esta Discovery não descobre um domínio novo, formaliza e consolida evidência já dispersa em 6 fontes distintas, preparando o terreno para uma futura missão de Aggregate Design (mesmo padrão de `SALES_AGGREGATE_DESIGN.md`).

## Executive Summary

`Relationship` não é uma hipótese a validar — é um domínio **já nomeado, já estruturado e já parcialmente scaffolded** na NOVARIS, sob dois nomes que se referem ao mesmo Bounded Context: `Relationship` (nome conceitual em `DOMAIN_MODEL.md`) e `Customer` (nome técnico do Bounded Context, `services/domains/customer/`, decidido por `ADR-0007`). A avaliação dos 5 critérios estruturais (§ "Bounded Context Evaluation") confirma evidência real em 4 de 5 critérios — mais forte que `CRM`/`Automation`/`AI` (que falharam a maioria dos critérios equivalentes), comparável em maturidade textual ao estado em que `Sales` se encontrava antes de `SALES_DOMAIN_DISCOVERY.md` (`ENG-0032`). `Party` já é nomeado como candidato a Aggregate Root em `AGGREGATE_DISCOVERY.md § "Customer (Relationship)"`. A distinção `Relationship` vs. `CRM` já está resolvida por `CRM_DOMAIN_DISCOVERY.md § 5` (linha 24): `Customer` é Bounded Context real, distinto de `CRM` (Product Layer composto por `Customer`+`Sales`+`Activity`).

## Business Problem

A NOVARIS precisa de uma fonte de verdade única para "quem são as pessoas e organizações com quem a plataforma se relaciona" — hoje essa informação está dispersa: `Sales` referencia `partyId` sem possuir `Party`; a definição de `Party`/`Person`/`External Organization`/`Contact` existe em `DOMAIN_MODEL.md`/`UBIQUITOUS_LANGUAGE.md`/`BOM.md`, mas não em código (`services/domains/customer/` é scaffolding vazio). Sem um domínio `Relationship` implementado, qualquer domínio que precise referenciar uma pessoa/organização externa (`Sales.Opportunity.partyId`, futuros `Communication`, `Marketing.Lead`) não tem Aggregate Root real para apontar — apenas um `UniqueEntityId` sem Aggregate correspondente. Este é o mesmo problema estrutural que motivou `SALES_DOMAIN_DISCOVERY.md` antes da implementação real do Sales Domain.

## Current Architecture Context

`DOMAIN_MODEL.md` nomeia exatamente **10 Business Domains ativos** (confirmado por inspeção direta dos cabeçalhos de seção, `Status` do documento, v1.3): `Identity`, `Workspace` (Organization), **`Relationship`**, `Sales`, `Activity`, `Project`, `Marketing`, `Financial`, `Analytics`, `System`. `AI`, `Automation` e `Knowledge` foram formalmente removidos da lista ativa (`ADR-0014`/`ADR-0013`/`ADR-0015`). Não existe seção `CUSTOMER DOMAIN`, `COMMUNICATION DOMAIN` ou `INTELLIGENCE DOMAIN` em `DOMAIN_MODEL.md` — `Customer` é o nome de Bounded Context técnico atribuído a `Relationship` (`ADR-0007`, `PROJECT_RULES.md` linha 135); `Communication` não existe em nenhuma fonte canônica pesquisada; `Intelligence` já foi resolvida como camada transversal de IA (`ADR-0014`), não domínio.

`services/domains/customer/` existe como pasta com um único arquivo (`README.md`), status "🚧 Estrutura criada (Missão ENG-0000.2). Nenhum código" — mesma maturidade que `services/domains/sales/` tinha antes de `ENG-0032`.

`Relationship` já é citado em: `DOMAIN_MODEL.md` § `RELATIONSHIP DOMAIN` (linhas 132-165, "Responsável por": Pessoas, Empresas, Relacionamentos, Contatos, Interações; "Objetos": `Party`, `Person`, `External Organization`, `Relationship`, `Contact`, `Address`, `Phone`, `Email`, `Social Profile`) e § `EVENT BUS` (linha 524, `RelationshipCreated` — um dos 10 eventos oficiais do documento canônico); `UBIQUITOUS_LANGUAGE.md § "Domínio: Relationship"` (linhas 49-58, 4 termos com definição completa); `DOMAIN_OWNERSHIP.md § "Customer / Relationship (candidato, scaffolding)"` (linha 68-72, Owner confirmado: `Customer`); `AGGREGATE_DISCOVERY.md § "Customer (Relationship) — Candidato"` (linhas 56-61, `Party` nomeado candidato a Aggregate Root); `CRM_DOMAIN_DISCOVERY.md` (linhas 23-24, distinção `Customer` vs. `CRM` já avaliada); `PROJECT_RULES.md` (linhas 77, 135-136).

## Domain Candidate Analysis

`Relationship` não é um candidato no sentido de "pode ou não existir" — é um candidato no sentido de "existe textualmente e estruturalmente, mas nunca recebeu uma Discovery formal de mesmo rigor que `Sales`" (mesma lacuna que existia para `Automation`/`AI` antes de `ADR-0013`/`ADR-0014`, mas com resultado esperado oposto: aqui a evidência estrutural é forte, não fraca). O objeto central, `Party`, já tem: nome oficial em `BOM.md`/`UBIQUITOUS_LANGUAGE.md`, 2 especializações nomeadas (`Person`, `External Organization`), um evento de domínio oficial (`RelationshipCreated`), e um candidato a Aggregate Root já apontado por `AGGREGATE_DISCOVERY.md`.

## Why Relationship Exists

1. **Presença estrutural em `DOMAIN_MODEL.md`**: seção própria, com "Responsável por" e "Objetos" nomeados — mesmo formato de `Sales`/`Financial`/`Marketing` (domínios confirmados), diferente do formato de `CRM` (nunca teve seção) ou de `AI`/`Automation` (seções removidas por não passarem no teste estrutural).
2. **Bounded Context técnico já decidido**: `ADR-0007` (Missão ENG-0000.2) já criou `services/domains/customer/` como Bounded Context real — decisão de arquitetura já tomada e nunca revertida.
3. **Linguagem ubíqua própria**: `UBIQUITOUS_LANGUAGE.md § Domínio: Relationship` — 4 termos com definição completa, "quando usar"/"quando não usar", sinônimos proibidos — mesmo rigor aplicado a `Sales`.
4. **Evento de domínio oficial**: `RelationshipCreated` está na lista canônica de 10 eventos de `DOMAIN_MODEL.md § EVENT BUS` — mesmo nível de confirmação que `OpportunityCreated`/`OpportunityWon`.
5. **Candidato a Aggregate Root já identificado**: `Party`, por `AGGREGATE_DISCOVERY.md`, com o mesmo método estrutural (identidade própria, especializações nomeadas) já usado para confirmar `Opportunity` como Aggregate Root de `Sales`.

## Why Relationship Is Not CRM

Já resolvido, não reaberto por esta missão — citado de `CRM_DOMAIN_DISCOVERY.md § 5` (ENG-0015), linhas 23-24:

| Aspecto | `Relationship`/`Customer` | `CRM` |
|---|---|---|
| Natureza | Bounded Context real (scaffolding, `services/domains/customer/`) | Product Layer — nunca teve Bounded Context (`ADR-0011`) |
| Origem do nome | `DOMAIN_MODEL.md § RELATIONSHIP DOMAIN`, renomeado por `ADR-0007` | `PRODUCTS.md`/`NOVARIS_OS.md` — sempre produto, nunca domínio |
| Responsabilidade | Fonte de verdade de `Party`/`Person`/`External Organization`/`Contact` — dados e regras de relacionamento | Interface operacional/experiência do usuário — composição de `Customer` + `Sales` + `Activity` (`ADR-0011`) |
| Ownership de dados | Sim — Owner de Domain Layer confirmado (`DOMAIN_OWNERSHIP.md`) | Não — nunca teve Owner de Domain Layer válido (`ADR-0011`) |
| Evolução | Evolui como qualquer Bounded Context (Aggregate, Repository, Application Layer) | Evolui como composição/orquestração de outros domínios — não tem estado próprio |

A distinção pedida pela Ordem de Missão ("Relationship = fonte de verdade/regras/histórico" vs. "CRM = interface operacional/produtividade") **confirma exatamente** o que `ADR-0011`/`CRM_DOMAIN_DISCOVERY.md` já haviam estabelecido — nenhuma contradição encontrada.

## Bounded Context Evaluation

### Critério 1 — Linguagem ubíqua própria?
**Evidência**: `UBIQUITOUS_LANGUAGE.md § Domínio: Relationship` — 4 termos (`Party`, `Person`, `External Organization`, `Relationship`) com definição, "quando usar"/"quando não usar", sinônimos proibidos e objetos relacionados, mesmo formato de `Sales`/`Financial`. **Conclusão**: SIM — evidência completa, mesmo padrão de domínio confirmado.

### Critério 2 — Regras de negócio próprias?
**Evidência**: nenhuma fonte pesquisada (`DOMAIN_MODEL.md`, `UBIQUITOUS_LANGUAGE.md`, `BOM.md`, `AGGREGATE_DISCOVERY.md`) descreve uma invariante, validação ou transição de estado para `Party`/`Person`/`External Organization`/`Relationship` — `AGGREGATE_DISCOVERY.md` linha 61 confirma explicitamente: "nenhuma fonte cita nenhuma regra de negócio". **Conclusão**: NÃO — mesma lacuna que `Sales` tinha antes de `SALES_AGGREGATE_DESIGN.md` definir `markWon()`/`markLost()`/`approveProposal()`; não é um sinal contra o domínio, é trabalho de design ainda não feito.

### Critério 3 — Ciclo de vida próprio?
**Evidência**: `Relationship` (o vínculo) tem um evento de criação confirmado (`RelationshipCreated`) — sinal de que ao menos uma transição de ciclo de vida (criação) já é reconhecida formalmente. Nenhuma fonte descreve transições adicionais (encerramento, mudança de tipo de vínculo). **Conclusão**: PARCIAL — 1 de possivelmente N transições confirmada; mesmo estágio que `Sales` tinha antes de `ADR` formalizar `markWon`/`markLost`.

### Critério 4 — Dados que devem ser exclusivamente seus?
**Evidência**: `DOMAIN_OWNERSHIP.md` já atribui `Party`, `Person`, `External Organization`, `Relationship`, `Contact`, `Address`, `Phone`, `Email`, `Social Profile` exclusivamente a `Customer` — nenhum desses objetos aparece em nenhuma outra seção de `DOMAIN_MODEL.md` (zero duplicação, diferente do caso histórico `Queue`/`Task`). **Conclusão**: SIM — Ownership de dados já formalmente exclusivo e sem disputa.

### Critério 5 — Precisa evoluir independentemente de outros domínios?
**Evidência**: `Sales.Opportunity` já referencia `partyId: UniqueEntityId` sem embutir nenhum dado de `Party` (confirmado por leitura direta de `opportunity.ts`, `OpportunityProps.partyId: UniqueEntityId`) — mesmo padrão de referência-por-id já usado para `Pipeline`/`Stage`. Isso demonstra que `Sales` já foi projetado assumindo que `Party` evolui em seu próprio Aggregate, não embutido. **Conclusão**: SIM — a arquitetura já implementada do Sales Domain pressupõe essa independência.

**Resultado consolidado**: 3 de 5 critérios SIM, 1 PARCIAL, 1 NÃO (lacuna de regra de negócio, esperada nesta fase, não uma reprovação). Substancialmente mais forte que o resultado de `CRM` (0 de 6) ou `Automation`/`AI` (1 de 6 cada, parcial).

## Domain Boundary

**Pertence ao `Relationship` Domain**: `Party` (supertipo), `Person`, `External Organization`, `Relationship` (o vínculo), `Contact`, `Address`, `Phone`, `Email`, `Social Profile` — os 9 objetos já listados em `DOMAIN_MODEL.md § RELATIONSHIP DOMAIN`.

**NÃO pertence ao `Relationship` Domain**:
- **`Sales`**: `Opportunity`, `Pipeline`, `Stage`, `Proposal` — `Sales` apenas referencia `Party` por `partyId`, nunca o possui.
- **`Customer` (CRM)**: nenhum dado — `CRM` é Product Layer sem estado próprio, composição de `Customer`+`Sales`+`Activity` (`ADR-0011`).
- **`Communication`**: nenhuma fonte canônica confirma este domínio — não pode ter fronteira avaliada sem existir (achado, não resolvido aqui).
- **`Analytics`**: `Dashboard`, `Widget`, `Metric`, `Report` — consome dados de `Relationship` por leitura, nunca possui `Party`.
- **`AI Agents`**: camada transversal (`ADR-0014`) — consome `Relationship` como qualquer outro domínio, não possui dado próprio de `Party`.

## Candidate Concepts

Exclusivamente os 9 já nomeados por `DOMAIN_MODEL.md`/`BOM.md` — nenhum novo conceito inventado por esta Discovery:

| Conceito | Papel Candidato |
|---|---|
| `Party` | Supertipo/possível Aggregate Root |
| `Person` | Especialização de `Party` |
| `External Organization` | Especialização de `Party` |
| `Relationship` | Vínculo entre 2 `Party` |
| `Relationship Type` | *(não nomeado em nenhuma fonte — apenas implícito em "Cliente, Fornecedor, Parceiro, Prospect, Investidor, Colaborador", `UBIQUITOUS_LANGUAGE.md` linha 58)* |
| `Relationship Status` | *(não nomeado em nenhuma fonte — hipótese não confirmada)* |
| `Contact` | Objeto candidato, papel exato não definido |
| `Address`, `Phone`, `Email`, `Social Profile` | Value Object candidatos (dados de contato) |
| `Interaction` | Citado apenas na lista "Responsável por" (Interações) — nenhum objeto correspondente nomeado em "Objetos" |

`Relationship Type`/`Relationship Status`/`Interaction` (como objeto) são hipóteses da própria Ordem de Missão, não confirmadas por nenhuma fonte — registradas aqui como candidatos sem evidência direta, para avaliação de uma futura missão de Aggregate Design, mesma disciplina já aplicada a "Needs Evidence" em `SALES_AGGREGATE_DESIGN.md`.

## Candidate Aggregates

Reafirmação literal de `AGGREGATE_DISCOVERY.md § "Customer (Relationship) — Candidato"` — nenhuma nova conclusão, apenas consolidação:

- **`Party` — candidato mais provável a Aggregate Root.** Sinal estrutural: `Person`/`External Organization` descritas como suas especializações.
- **Pergunta em aberto, não decidida por nenhuma fonte**: `Party` é o próprio Aggregate Root (com `Person`/`External Organization` como Entities internas ou subtipos), ou `Person`/`External Organization` são Aggregates independentes? Idêntica em natureza à pergunta já registrada para `Task` (`AGGREGATE_DISCOVERY.md § 4`), não decidida aqui.
- **Consistência candidata**: se `Party` for o Aggregate Root, ele controlaria a consistência de seus dados de contato (`Address`/`Phone`/`Email`/`Social Profile`) — mesmo padrão já usado por `Opportunity` controlando `Proposal`.
- **Identidade própria**: `Party`/`Person`/`External Organization` têm identidade nomeada (`BOM.md`) — critério estrutural satisfeito.
- **Ciclo de vida**: apenas a criação (`RelationshipCreated`) tem evidência; nenhuma transição adicional confirmada.

Nenhum Aggregate, Entity ou Value Object foi implementado por esta missão — apenas nomeados como candidatos, conforme restrição explícita.

## Candidate Domain Events

| Evento | Status |
|---|---|
| `RelationshipCreated` | **Já oficial** — `DOMAIN_MODEL.md § EVENT BUS`, um dos 10 eventos canônicos |
| `RelationshipEstablished` | Hipótese da Ordem de Missão — não confirmado por nenhuma fonte; possível sinônimo redundante de `RelationshipCreated`, a decidir em Aggregate Design |
| `RelationshipUpdated` | Hipótese — não confirmado |
| `RelationshipClosed` | Hipótese — não confirmado; nenhuma fonte descreve encerramento de vínculo |
| `InteractionRecorded` | Hipótese — não confirmado; depende da confirmação de `Interaction` como objeto (§ Candidate Concepts, não confirmado) |

Apenas `RelationshipCreated` tem evidência documental direta. Os demais são candidatos hipotéticos da própria Ordem de Missão, registrados para avaliação futura, não inventados como fato por esta Discovery.

## External Dependencies

`Relationship` dependeria de: `Organization` (todo `Party` pertence a uma `Organization`/tenant — mesmo padrão de `organizationId` já usado em `Opportunity`); `Identity` (referência a `User` se um `Contact` interno for modelado, hipótese não confirmada).

## Consumers

Quem consumiria `Relationship` (por referência de id, nunca por posse — mesmo padrão já usado por `Sales.Opportunity.partyId`):
- **`Sales`** — já consome `Party` hoje, via `partyId: UniqueEntityId` em `Opportunity` (confirmado em código real, `opportunity.ts`).
- **`Marketing`** — candidato, não confirmado (nenhuma fonte cita `Party`/`Lead` em `MARKETING DOMAIN`).
- **`Communication`** — não avaliável, domínio sem existência confirmada.
- **`Analytics`** — candidato, consumiria `Party` por leitura para relatórios/dashboards.
- **`AI Agents`** — candidato, consumiria `Party` como contexto para qualquer agente que opere sobre relacionamentos.

## Dependencies

Nenhuma dependência de código real existe hoje — `services/domains/customer/` não tem implementação. A única dependência de código já real e observável é a inversa: `Sales.Opportunity` já depende de um `partyId` que hoje não aponta para nenhum Aggregate real (`Party` não implementado) — um risco técnico já existente, independente desta Discovery.

## Risks

| Risco | Severidade |
|---|---|
| `Sales.Opportunity.partyId` já referencia um conceito (`Party`) sem Aggregate real implementado — risco de integridade referencial não imposta em código, hoje mitigado apenas por convenção | Médio |
| Confundir `Relationship`/`Customer` com `CRM` em missões futuras, mesmo com a distinção já documentada 2 vezes (`ADR-0011`, `CRM_DOMAIN_DISCOVERY.md`) — risco de regressão de entendimento já registrado como padrão nesta engenharia (ex.: `Queue`/`Automation`) | Médio |
| `Communication`/`Intelligence`, citados pela própria Ordem de Missão como Business Domains, não têm nenhuma base documental — decisões futuras podem presumir mais sobre eles do que existe hoje, mesmo risco já registrado para `Platform/Engineering` em `CONTEXT_RELATIONSHIPS.md § 8` | Médio |
| Pergunta `Party` = Aggregate Root vs. `Person`/`External Organization` independentes permanece em aberto — implementação prematura sem resolver essa pergunta replicaria o mesmo risco já registrado para `Task` (`AGGREGATE_DISCOVERY.md`) | Alto (se implementação começar sem Aggregate Design) |
| Nova pasta `knowledge/architecture/discovery/` diverge do precedente estrutural (`knowledge/architecture/analysis/`) sem ADR ou justificativa própria — risco de fragmentação de onde Discoveries futuras são procuradas | Baixo |

## Open Questions

1. `Party` é o Aggregate Root, ou `Person`/`External Organization` são Aggregates independentes? (`AGGREGATE_DISCOVERY.md`, não resolvida)
2. `Relationship` (o vínculo) é uma Entity interna de `Party`, um Aggregate próprio, ou um Value Object? Nenhuma fonte decide.
3. `Relationship Type`/`Relationship Status` existem como campos/objetos formais, ou são apenas texto descritivo (`UBIQUITOUS_LANGUAGE.md` linha 58, "Cliente, Fornecedor, Parceiro...")? Não confirmado.
4. `Interaction` é um objeto de `Relationship`, ou pertence a um futuro domínio `Communication` ainda não confirmado?
5. `Communication` deve receber sua própria Discovery formal (mesmo método já usado para `Permission`/`Event Bus`/`CRM`/`Automation`/`AI`/`Relationship`), dado que a própria Ordem de Missão o cita como Business Domain sem nenhuma base em `DOMAIN_MODEL.md`?
6. A pasta `knowledge/architecture/discovery/` deve se tornar o novo padrão para Discoveries futuras, substituindo `knowledge/architecture/analysis/`, ou esta missão introduziu uma exceção pontual? Requer decisão do CTO, não inventada aqui.

## Recommendation

`Relationship` deve prosseguir para uma missão formal de **Aggregate Design** (mesmo padrão de `SALES_AGGREGATE_DESIGN.md`), respondendo às 3 primeiras Open Questions antes de qualquer implementação de código. Recomenda-se citar esta Discovery e `AGGREGATE_DISCOVERY.md § "Customer (Relationship)"` como ponto de partida, não redescobrir. **Recomendação de ADR** (não criada por esta missão, por restrição explícita): considerar uma ADR curta confirmando formalmente `Relationship`/`Customer` como Business Domain ativo com Aggregate Design autorizado — paralelo ao papel que `ADR-0013`/`ADR-0014` cumpriram para `Automation`/`AI`, mas em sentido de confirmação positiva, não negativa. Recomenda-se também registrar formalmente a colisão de numeração `ENG-0022` para correção do índice de missões, e esclarecer com o CTO se `Communication`/`Intelligence` merecem sua própria Discovery ou devem ser removidos da lista de "Business Domains" citada por futuras Ordens de Missão.

## Final Classification

## RELATIONSHIP DOMAIN CONFIRMED
## READY FOR AGGREGATE DESIGN

Justificativa: evidência estrutural já existente (linguagem ubíqua completa, Ownership de dados exclusivo, evento oficial, Bounded Context técnico já criado, candidato a Aggregate Root já nomeado) satisfaz 3 de 5 critérios integralmente e 1 parcialmente — muito acima do padrão que resultou em rejeição para `CRM` e reclassificação para `Automation`/`AI`. A única lacuna real (regras de negócio, ciclo de vida completo, composição interna do Aggregate) é trabalho de design ainda não feito, não uma reprovação do domínio — mesmo estágio em que `Sales` se encontrava antes de `SALES_AGGREGATE_DESIGN.md`.

---

## Domain Model Validation

Entity criada? **NÃO.**

Aggregate criado? **NÃO.**

Value Object criado? **NÃO.**

Regra de negócio criada? **NÃO.**

## Architecture Validation

Bounded Context criado? **NÃO** — já existia (`services/domains/customer/`, `ADR-0007`), apenas documentado/consolidado.

ADR criado? **NÃO** — recomendação registrada em § "Recommendation", não executada.

Ownership alterado? **NÃO** — `DOMAIN_OWNERSHIP.md` não foi alterado, apenas citado.

Contrato alterado? **NÃO.**

Código alterado? **NÃO.**

## Relação com Outros Módulos

- [SALES_DOMAIN_DISCOVERY.md](../analysis/SALES_DOMAIN_DISCOVERY.md) (ENG-0032) — precedente direto de método
- [CRM_DOMAIN_DISCOVERY.md](../analysis/CRM_DOMAIN_DISCOVERY.md) (ENG-0015) — fonte da distinção `Relationship` vs. `CRM`, já resolvida
- [AGGREGATE_DISCOVERY.md](../decisions/AGGREGATE_DISCOVERY.md) — fonte do candidato a Aggregate Root (`Party`)
- [DOMAIN_OWNERSHIP.md](../decisions/DOMAIN_OWNERSHIP.md) — fonte do Ownership já confirmado (`Customer`)
- [knowledge/core/DOMAIN_MODEL.md](../../core/DOMAIN_MODEL.md) — fonte canônica de todo objeto/evento citado
- [knowledge/core/UBIQUITOUS_LANGUAGE.md](../../core/UBIQUITOUS_LANGUAGE.md) — fonte da linguagem ubíqua já existente
- [adr/ADR-0007-domain-boundaries.md](../../../adr/ADR-0007-domain-boundaries.md) — origem do nome de Bounded Context `customer`
- [services/domains/customer/README.md](../../../services/domains/customer/README.md) — estado real do scaffolding

## Status

🟢 Discovery concluída (Missão ENG-0022, com colisão de numeração registrada). Nenhum código, Entity, Aggregate, Value Object, regra de negócio, ADR ou Ownership criado/alterado. Aguardando aprovação formal do CTO.
