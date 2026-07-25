# ADR-0012 — Queue Ownership Resolution

## Problema

`ENG-0011` (decisão formal do CTO, item 9) atribuiu o objeto `Queue` ao domínio "`CRM`". `ADR-0011` (missão `ENG-0019`), analisando `DOMAIN_MODEL.md`, confirmou que "`CRM`" nunca foi, e nunca será, um Bounded Context — é exclusivamente uma capacidade do Product Layer, entregue por composição de `Customer` + `Sales` + `Activity`. Consequência direta, registrada mas não resolvida por `ADR-0011`: "`CRM`" deixou de ser um Owner válido de Domain Layer, e a atribuição de `Queue` ficou órfã. Esta ADR resolve exclusivamente essa órfandade — não reabre nenhuma outra questão de `ADR-0011`.

## Contexto

`Queue` aparece em exatamente duas seções de `DOMAIN_MODEL.md`, ambas como item de uma lista de objetos, nunca como Aggregate documentado com atributos, ciclo de vida ou regra de negócio própria:

- **`AUTOMATION DOMAIN`** — a seção "Responsável por" lista textualmente `Workflows`, `Triggers`, `Queues`, `Execuções`: "Filas" (Queues) é uma das quatro responsabilidades explicitamente declaradas do domínio, no mesmo nível de `Workflow`/`Trigger`/`Execution`. `Queue` também aparece na lista de "Objetos" da mesma seção.
- **`SYSTEM DOMAIN`** — a seção "Responsável por" lista `Logs`, `Integrações`, `Eventos`, `Deploy`, `Observabilidade` — **não menciona filas/queues como responsabilidade**. `Queue` aparece apenas na lista de "Objetos" (`Audit Log`, `Event Log`, `Integration`, `Webhook`, `Job`, `Queue`, `Release`, `Migration`), sem nenhuma correspondência na seção "Responsável por".

`DOMAIN_MODEL.md` já registra esta duplicação como uma "violação da própria regra do documento" ("Todo objeto pertence a exatamente um domínio"), no mesmo parágrafo onde nega a existência de "CRM" (linha 608). A duplicação nunca foi resolvida antes de `ENG-0011` — a decisão do CTO a resolveu atribuindo a um terceiro domínio ("CRM") que não figurava em nenhuma das duas listas originais, sem citar nenhuma das duas como base.

`DOMAIN_OWNERSHIP.md` (ENG-0012), antes da decisão do CTO chegar, já classificava os demais 6 objetos de `Automation` (`Workflow`, `Automation`, `Execution`, `Trigger`, `Action`, `Condition`) como "Ownership Pending CTO Decision — pendem de `Automation` ser confirmado como Business Domain" — o mesmo tratamento que `Queue` teria recebido, por pertencer à mesma lista de objetos, se a decisão do CTO não o tivesse movido para "CRM".

`Automation`, diferente de "CRM", **é** um dos 13 domínios nomeados e estruturados em `DOMAIN_MODEL.md` (seção própria, "Responsável por" e "Objetos" definidos) — sua pendência (`ENG-0011` item 6, reafirmada em `CONTEXT_RELATIONSHIPS.md`/`NOVARIS_PLATFORM_ARCHITECTURE.md`) é de **confirmação como Business Domain** (maturidade/implementação), não de **existência textual** — distinção já estabelecida por esta engenharia entre "domínio nomeado e estruturado, ainda não confirmado" e "domínio cuja existência o próprio documento canônico nega" (o segundo caso era exclusivo de "CRM", resolvido por `ADR-0011`).

## Alternativas

### Option A — Automation Domain

Atribuir `Queue` a `Automation`, com base na seção "Responsável por" de `DOMAIN_MODEL.md`, que cita "Filas" como responsabilidade explícita.

**Escolhida.** Evidência:
- É a única das duas seções candidatas em que "filas" aparece como responsabilidade declarada do domínio (`Responsável por: ... Queues ...`), não apenas como item avulso de lista de objeto.
- Restaura o agrupamento que `DOMAIN_OWNERSHIP.md` já aplicava, antes de `ENG-0011`, aos outros 6 objetos da mesma lista de "Objetos" de `Automation`.
- Não inventa nenhum conteúdo novo — usa exclusivamente o texto já existente em `DOMAIN_MODEL.md`.

### Option B — System Domain

Atribuir `Queue` a `System`, com base em sua presença na lista de "Objetos" dessa seção.

**Rejeitada.** A seção "Responsável por" de `System` (`Logs`, `Integrações`, `Eventos`, `Deploy`, `Observabilidade`) não cita filas/queues em nenhum grau — a presença de `Queue` na lista de "Objetos" de `System` tem exatamente o mesmo peso evidencial que sua presença na lista de "Objetos" de `Automation`, mas `Automation` tem o reforço adicional, decisivo, da seção "Responsável por". Escolher `System` exigiria desconsiderar essa evidência mais específica sem nenhuma justificativa documental para fazê-lo.

### Option C — Other existing Domain

Nenhuma fonte pesquisada (`DOMAIN_MODEL.md`, `DOMAIN_OWNERSHIP.md`, `CONTEXT_RELATIONSHIPS.md`, `AGGREGATE_DISCOVERY.md`, `BOM.md`) atribui `Queue`, mesmo tangencialmente, a qualquer um dos outros 11 domínios (`Identity`, `Organization`, `Customer`, `Sales`, `Activity`, `Projects`, `Marketing`, `Knowledge`, `AI`, `Financial`, `Analytics`).

**Rejeitada por ausência de evidência** — nenhuma opção a considerar além de A e B.

## Evidência

| Fonte | Cita `Queue` em "Responsável por"? | Cita `Queue` em "Objetos"? |
|---|---|---|
| `DOMAIN_MODEL.md` — `AUTOMATION DOMAIN` | **Sim** — "Queues" listado entre as 4 responsabilidades do domínio | Sim |
| `DOMAIN_MODEL.md` — `SYSTEM DOMAIN` | Não — "Logs, Integrações, Eventos, Deploy, Observabilidade", sem menção a filas | Sim |
| `DOMAIN_MODEL.md`, linha 608 | Registra a duplicação `Automation`/`System` como violação da própria regra do documento, não resolvida até esta ADR | — |
| `DOMAIN_OWNERSHIP.md` § 3 (pré-`ENG-0011`) | Já agrupava os demais 6 objetos de `Automation` sob "Ownership Pending CTO Decision" | — |
| `ADR-0011` (ENG-0019) | Confirma que "CRM" nunca foi Owner válido de Domain Layer, invalidando a atribuição de `ENG-0011` item 9 | — |

Nenhuma Object Specification, atributo, evento ou regra de negócio existe para `Queue` em nenhuma das duas fontes — a decisão se apoia exclusivamente na correspondência textual entre "Responsável por" e o objeto, o critério mais forte disponível sem inventar conteúdo novo.

## Decisão Arquitetural

**Option A.** `Queue` pertence ao domínio **`Automation`**.

Esta atribuição permanece sujeita à mesma pendência já registrada para os outros 6 objetos de `Automation` (`Workflow`, `Automation`, `Execution`, `Trigger`, `Action`, `Condition`): `Automation` ainda não é um Business Domain confirmado (`ENG-0011` item 6) — hoje existe apenas `automation-runtime` como Infrastructure Capability. `Queue` entra no mesmo grupo `Ownership Pending Business Domain Confirmation` que seus 6 objetos irmãos — o Owner está decidido, mas nenhum código pode referenciá-lo até que `Automation` seja formalmente confirmado como Business Domain (regra já congelada em `DOMAIN_OWNERSHIP.md § 6`).

## Consequências

**Positivas:**
- Encerra a órfandade de `Queue` criada pela invalidação de "CRM" (`ADR-0011`), sem inventar nenhum conteúdo novo — a decisão segue exclusivamente o texto já existente de `DOMAIN_MODEL.md`.
- Restaura consistência com o tratamento que `DOMAIN_OWNERSHIP.md` já dava aos demais objetos de `Automation`, antes da decisão de `ENG-0011` ter introduzido uma exceção sem base textual.
- Resolve, de forma rastreável e não arbitrária, a duplicação `Automation`/`System` que o próprio `DOMAIN_MODEL.md` já registrava como violação de sua regra ("todo objeto pertence a exatamente um domínio").

**Negativas / pendências:**
- `Queue` **não passa a ser referenciável por código real** — a confirmação de `Automation` como Business Domain (`ENG-0011` item 6) continua em aberto, e nenhuma missão até agora tem autoridade para resolvê-la unilateralmente.
- A duplicação de `Queue` na lista de "Objetos" de `System` em `DOMAIN_MODEL.md` **não foi removida** — `DOMAIN_MODEL.md` não foi alterado por esta missão (fora de escopo, `ENG-0020` restringe explicitamente qualquer mudança a domínios existentes). A duplicação textual permanece no documento canônico; só a decisão de Ownership foi resolvida por esta ADR.
- `CONTEXT_RELATIONSHIPS.md`, `DOMAIN_OWNERSHIP.md` e `NOVARIS_PLATFORM_ARCHITECTURE.md` foram atualizados (não recriados) para refletir esta decisão, dentro da autorização explícita da missão ("Update ownership references ONLY if required") — ver Impactos.

## Domain Impact

- Nenhuma Entity, Aggregate, Value Object, Domain Event, Repository ou código foi criado.
- Nenhum domínio existente (`Identity`, `Organization`, `Audit`, ou qualquer scaffolding) foi modificado em sua estrutura, Aggregate ou Blueprint.
- `DOMAIN_MODEL.md` **não foi alterado** — sua duplicação `Queue` (Automation/System) permanece registrada, não corrigida no documento canônico; só a decisão de Ownership foi tomada, com base no texto já existente.
- O status de `Automation` como domínio (⚪ Não confirmado como Business Domain) permanece inalterado — esta ADR decide o Owner de `Queue`, não a maturidade de `Automation`.

## Responsável

Decisão de arquitetura: Engenheiro Principal, por delegação da Ordem de Missão `ENG-0020`, com base exclusiva em evidência textual já existente em `DOMAIN_MODEL.md`. Execução: Engenheiro Principal.

## Data

2026-07-16

## Impactos

Criado: `adr/ADR-0012-queue-ownership.md`. Atualizados: `knowledge/architecture/CONTEXT_RELATIONSHIPS.md` (nota de atualização + linhas 33, 51-52, 55, 78, 130, 135, 147, 157; versão 1.1.0 → 1.2.0), `knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md` (tabela de `Automation`, seção `CRM`/`Platform Engineering` renomeada para `Platform/Engineering`, § 5, § 7; versão 1.0.0 → 1.1.0), `knowledge/architecture/decisions/NOVARIS_PLATFORM_ARCHITECTURE.md` (§§ 7, 11, 12, 13, 14; versão 1.0.0 → 1.1.0). Nenhum código, Aggregate, Entity, Value Object ou `DOMAIN_MODEL.md` alterado.

## Plano de Migração

Não aplicável — nenhum dado ou código existente referenciava `Queue` sob nenhum dos dois Owners; é uma decisão documental pura.

## Status

Aceito

---

## Relação com Outros Módulos

- [ADR-0011](../knowledge/architecture/decisions/ADR-0011-crm-domain-position.md) — origem direta desta ADR (invalidação de "CRM" como Owner)
- [DOMAIN_MODEL.md](../knowledge/core/DOMAIN_MODEL.md) — fonte da evidência decisiva (seções `AUTOMATION DOMAIN`/`SYSTEM DOMAIN`, linha 608)
- [DOMAIN_OWNERSHIP.md](../knowledge/architecture/decisions/DOMAIN_OWNERSHIP.md) (ENG-0012, atualizado por ENG-0020)
- [CONTEXT_RELATIONSHIPS.md](../knowledge/architecture/CONTEXT_RELATIONSHIPS.md) (ENG-0011, atualizado por ENG-0020)
- [NOVARIS_PLATFORM_ARCHITECTURE.md](../knowledge/architecture/decisions/NOVARIS_PLATFORM_ARCHITECTURE.md) (ENG-0017, atualizado por ENG-0020, ENG-0020.2)
- [ADR-0013](ADR-0013-automation-domain-confirmation.md) (ENG-0022) — reverte a premissa desta ADR, ver "Amendment" abaixo

## Amendment — ADR-0013 Consequence

**Registrado por `ENG-0020.2`, sem reescrever a Decisão Arquitetural original acima.**

`ADR-0012` foi uma **decisão intermediária**: no momento em que foi tomada, `Automation` ainda não havia recebido uma Discovery formal — a atribuição de `Queue` a `Automation` (§ "Decisão Arquitetural", Option A) foi explicitamente condicionada à confirmação futura de `Automation` como Business Domain (`ENG-0011` item 6, citado na própria Decisão acima).

`ADR-0013` (`ENG-0022`) posteriormente resolveu essa pendência — e o resultado foi negativo: `Automation` foi confirmada como **Platform/Infrastructure Capability**, não como Business Domain. Consequência direta: a premissa sobre a qual `ADR-0012` apoiava sua atribuição deixou de existir. Uma capacidade de Infrastructure não é um Owner válido de Domain Layer, pelo mesmo raciocínio já aplicado a "CRM" (`ADR-0011`).

**Estado atual, vinculante a partir de `ADR-0013`**:
- `Queue` **não possui Domain Owner** — nenhum Bounded Context do Domain Layer é responsável por `Queue`.
- `Queue` é uma **Infrastructure Capability** — um construto operacional/técnico transversal (distribuição de trabalho, roteamento, priorização), consumível por qualquer domínio que precise dele, sem pertencer a nenhum.
- Confirmado por `DOMAIN_OWNERSHIP.md § 3` ("`Queue`... N/A — não é conceito de Domain Layer") e por `DOMAIN_MODEL.md` (seção `AUTOMATION DOMAIN` removida da lista ativa de domínios).

Este Amendment não cria nova ADR, não altera `DOMAIN_MODEL.md`/`DOMAIN_OWNERSHIP.md`, e não modifica a Decisão Arquitetural original registrada acima — apenas documenta, de forma rastreável, que essa decisão foi superada em sua premissa por `ADR-0013`, preservando o texto original integralmente como registro histórico.
