# Activity — Aggregate Design

Versão: 1.0.0

Status: 🟢 Design tático concluído — nenhum código criado

Missão: ENG-0132 (Activity Aggregate Design) — continuação do roteiro de resolução de domínios, mesmo método e mesmo rigor de `SALES_AGGREGATE_DESIGN.md` (ENG-0034) e `RELATIONSHIP_AGGREGATE_DESIGN.md` (ENG-0119).

Escopo: aprofundar o candidato já nomeado em `AGGREGATE_DISCOVERY.md § "Activity — Future Domain"`, respondendo a partir de evidência já existente (`DOMAIN_MODEL.md`, `BOM.md`, `UBIQUITOUS_LANGUAGE.md`). Nenhum código, Aggregate, Entity ou Value Object é implementado por este documento.

**Verify Before Reimplementing**: busca por "ACTIVITY_AGGREGATE_DESIGN" em todo o repositório — zero resultados. Nenhuma duplicação.

---

## 1. Fonte das Evidências

- `DOMAIN_MODEL.md § ACTIVITY DOMAIN` — responsabilidade: "agenda, atividades, tarefas, calendário, follow-up, timeline". Objetos: `Activity`, ~~`Task`~~ (removido, pertence a `Projects`, `ADR-0016`), `Calendar Event`, `Reminder`, `Timeline`, `Comment`, `Checklist`.
- `BOM.md § Activity` — **entrada rica, diferente da maioria dos objetos ainda não implementados**: "Registro de interação", com uma seção `Tipos:` (`Ligação`, `WhatsApp`, `E-mail`, `Reunião`, `Visita`, `Nota` — 6 valores) e uma seção `Eventos:` (`ActivityCreated`, `ActivityCompleted`) — mesmo padrão estrutural de `Task` (`Estados:`, `ADR-0030`).
- `BOM.md § Timeline` — "Linha do tempo consolidada dos eventos de um objeto" — one-liner.
- `BOM.md § Comment` — "Comentário associado a qualquer objeto" — one-liner.
- `Calendar Event`, `Reminder`, `Checklist` — **sem entrada em `BOM.md`**, confirmado por busca direta.
- `UBIQUITOUS_LANGUAGE.md § Domínio: Activity` — `Activity`: "Registro de interação (ligação, WhatsApp, e-mail, reunião, visita, nota) — Para qualquer interação registrada **com um Party**"; "Não usar como sinônimo de `Task` (Activity é registro passado, Task é trabalho pendente)"; Objetos Relacionados: `Timeline`, `Comment`; Eventos Relacionados: `ActivityCreated`, `ActivityCompleted`. `Timeline`: "Não usar como um objeto persistente próprio — **é uma projeção de outros eventos**". `Comment`: "Para anotação livre em **qualquer objeto do sistema**" (Objetos Relacionados: TODO — nenhuma relação exclusiva com `Activity` documentada).
- Achado decisivo de código real (mesmo método já usado para `Party`, `RELATIONSHIP_AGGREGATE_DESIGN.md § 2`): `Activity` relaciona-se com `Party` — nenhum código ainda implementa essa referência (Customer Domain não tem `Activity` referenciando-o), mas a fonte documental já é explícita o suficiente para propor o campo.

## 2. Achado Decisivo — `Activity` é o único Aggregate Root deste domínio

`Activity` é o único objeto do domínio com confirmação em 3 fontes independentes (`DOMAIN_MODEL.md`, `BOM.md` com `Tipos:`/`Eventos:` próprios, `UBIQUITOUS_LANGUAGE.md`) — mesmo padrão de tripla confirmação já usado para `Opportunity` (Sales). Nenhum outro objeto do domínio tem essa força de evidência.

## 3. Achado Decisivo — `Timeline` não é um objeto persistente

`UBIQUITOUS_LANGUAGE.md` é explícito: "Não usar como um objeto persistente próprio — é uma projeção de outros eventos". `Timeline` é uma **projeção de leitura** (read-model agregando eventos de múltiplos objetos), não um Aggregate, Entity ou Value Object a ser modelado na Domain Layer — fica fora do escopo de qualquer implementação futura de Write Model deste domínio, mesmo se uma futura API de consulta agregada vier a existir.

## 4. Achado Decisivo — `Comment` é polimórfico, não pertence exclusivamente a `Activity`

`BOM.md`/`UBIQUITOUS_LANGUAGE.md` descrevem `Comment` como anotação livre em **qualquer objeto do sistema** — não uma Entity interna exclusiva de `Activity`. Modelá-lo como parte do Aggregate `Activity` inventaria uma posse exclusiva não sustentada pela fonte. `Comment` permanece **fora do escopo desta Aggregate Design** — se algum dia implementado, seria um conceito transversal (Kernel/Core), não específico deste domínio.

## 5. Estrutura Proposta — `Activity` (Aggregate Root)

| Campo | Tipo candidato | Obrigatório/Opcional | Evidência |
|---|---|---|---|
| `id` | `UniqueEntityId` (herdado) | Obrigatório | Padrão de todo Aggregate Root |
| `organizationId` | `UniqueEntityId` | Obrigatório | Regra transversal de multi-tenancy (`ENS-0001 § 7`) |
| `partyId` | `UniqueEntityId` | Obrigatório | `UBIQUITOUS_LANGUAGE.md`: "Para qualquer interação registrada **com um Party**" — mesma referência por id já usada em `Opportunity.partyId` |
| `type` | União literal: `"ligacao" \| "whatsapp" \| "email" \| "reuniao" \| "visita" \| "nota"` | Obrigatório | `BOM.md § Activity`, seção `Tipos:` — 6 valores já nomeados explicitamente, nenhum inventado |
| `createdAt`, `updatedAt` | `Date` | Obrigatório | Padrão `Timestamped` |

**Campo de conteúdo (descrição/nota) — `Needs Evidence`, não incluído**: nenhuma fonte define um campo de texto livre para o conteúdo da interação em si — apenas o `type` (categoria) está confirmado. Um `Activity` sem conteúdo textual ainda seria minimamente identificável pelo par `partyId`+`type`+`createdAt`, diferente do bloqueio total que `Party` tinha antes de `ADR-0025` — mas um campo de nota/descrição seria necessário para uso real; deixado para uma futura ADR de campos mínimos (mesmo padrão de `ADR-0025`/`ADR-0030`/`ADR-0031`), não decidido aqui.

## 6. Domain Events Candidatos

| Evento | Status |
|---|---|
| `ActivityCreated` | **Confirmado em `BOM.md § Activity`** (seção `Eventos:`) e em `UBIQUITOUS_LANGUAGE.md`. **Achado registrado, não silencioso**: não está na lista de "10 eventos oficiais" de `DOMAIN_MODEL.md § EVENT BUS` — evidência de nível de confiança comparável a `Task.status` (lista explícita no próprio BOM.md do objeto), mas não ratificada na lista curada de integração cross-domínio. Tratado aqui como confirmado para fins de implementação futura (mesma fonte primária, `BOM.md`), com a divergência registrada. |
| `ActivityCompleted` | Mesma situação de `ActivityCreated` — confirmado em `BOM.md`/`UBIQUITOUS_LANGUAGE.md`, ausente do `EVENT BUS` oficial. Implica que `Activity` tem pelo menos 2 estados (algo como "aberta"/"concluída") — nenhuma fonte nomeia os valores exatos do campo de estado, diferente de `Task.status` (`BOM.md` lista os 4 valores explicitamente). Campo de estado exato **não decidido aqui** — `Needs Evidence`. |

## 7. Value Objects / Entities Bloqueados

| Objeto | Status |
|---|---|
| `Calendar Event` | **Resolvido (`ADR-0045`, `ENG-0146`)** — Aggregate Root real, campos mínimos definidos, implementado de ponta a ponta |
| `Reminder` | **Resolvido (`ADR-0045`, `ENG-0146`)** — idem |
| `Checklist` | **Resolvido (`ADR-0045`, `ENG-0146`)** — idem, com `ChecklistItem` (Internal Entity) |
| `Timeline` | Não é um objeto a ser modelado (§ 3) — projeção de leitura, não Write Model |
| `Comment` | **Resolvido (`ADR-0043`, `ENG-0144`)** — polimórfico, implementado de ponta a ponta |

## 8. Perguntas Remanescentes

1. Campo de conteúdo/descrição de `Activity` — não definido em nenhuma fonte.
2. Valores exatos do campo de estado implícito por `ActivityCreated`/`ActivityCompleted` — só os 2 eventos são nomeados, não uma enumeração de estados (diferente de `Task`).
3. Divergência de confiança entre `BOM.md`'s `Eventos:` (por objeto) e `DOMAIN_MODEL.md § EVENT BUS` ("10 eventos oficiais") — não é específica de `Activity`, mas fica mais visível aqui; requer decisão do CTO sobre qual lista é a fonte de verdade para "evento confirmado" em futuras missões.
4. ~~`Calendar Event`/`Reminder`/`Checklist` — bloqueados até extensão de `BOM.md`.~~ **Resolvido por `ADR-0045` (`ENG-0146`)** — campos mínimos definidos e implementados, mesmo padrão de `ADR-0025`/`ADR-0030`/`ADR-0031`, por autorização direta do CTO para continuar o arco de adaptação do Salesforce.

## 9. Recomendação

Prosseguir para uma extensão de campos mínimos (mesmo padrão de `ADR-0025`/`ADR-0030`/`ADR-0031`) **apenas quando houver decisão do CTO** sobre o campo de conteúdo/descrição e o campo de estado — diferente de `Task`, onde os 4 estados já vinham prontos em `BOM.md`, aqui só os 2 eventos-limite (criação/conclusão) estão confirmados, não os valores do campo em si.

> **Nota de Resolução (`ADR-0045`, `ENG-0146`)**: `Calendar Event`/`Reminder`/`Checklist` resolvidos — nenhum dos 3 tem confirmação de Domain Event em nenhuma fonte, por isso nenhum evento foi criado (mesmo critério já usado para `Party`/`Product`/`Campaign`/`Dashboard`). Fecha 100% dos objetos oficiais do Activity Domain (`Activity`, `Task` por referência, `Timeline` como projeção, `Comment`, `Case`, `CalendarEvent`, `Reminder`, `Checklist`).

---

## Domain Model Validation

Entity criada? **NÃO.** Aggregate criado? **NÃO.** Value Object criado? **NÃO.** Domain Event criado? **NÃO.**

## Relação com Outros Módulos

- [AGGREGATE_DISCOVERY.md](../decisions/AGGREGATE_DISCOVERY.md) — origem do candidato `Activity`
- [RELATIONSHIP_AGGREGATE_DESIGN.md](RELATIONSHIP_AGGREGATE_DESIGN.md) — precedente direto do método usado
- [ADR-0030](../../../adr/ADR-0030-project-task-minimum-fields.md) — precedente de uso de uma lista explícita de `BOM.md` (`Estados:`/`Tipos:`/`Eventos:`) como evidência suficiente

## Status

🟢 Design tático concluído. Nenhum código, Aggregate, Entity, Value Object ou Domain Event implementado. Requer decisão do CTO sobre campos mínimos antes de implementação real.
