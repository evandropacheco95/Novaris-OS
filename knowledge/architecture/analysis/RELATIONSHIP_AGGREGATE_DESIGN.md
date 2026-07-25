# Relationship/Customer — Aggregate Design

Versão: 1.0.0

Status: 🟢 Design tático concluído — nenhum código criado

Missão: ENG-0119 (Relationship/Customer Aggregate Design) — Fase 2 do roteiro de continuidade da NOVARIS (Aggregate Design do segundo domínio de negócio), mesmo método e mesmo rigor de `SALES_AGGREGATE_DESIGN.md` (ENG-0034).

Escopo: aprofundar `RELATIONSHIP_DOMAIN_DISCOVERY.md`, respondendo as Open Questions 1-3 registradas lá, nomeando Aggregate Roots, Entities, Value Objects e Domain Events candidatos — exclusivamente com base em evidência já existente (`DOMAIN_MODEL.md`, `BOM.md`, `UBIQUITOUS_LANGUAGE.md`, `AGGREGATE_DISCOVERY.md`, e o código real de `Sales`). Nenhum código, Aggregate, Entity ou Value Object é implementado por este documento — apenas desenhado, para uma futura missão de Technical Blueprint + implementação.

**Verify Before Reimplementing**: busca por "RELATIONSHIP_AGGREGATE_DESIGN", "Relationship Aggregate Design" em todo o repositório — zero resultados. Nenhuma duplicação.

---

## 1. Fonte das Evidências

- `knowledge/core/DOMAIN_MODEL.md § RELATIONSHIP DOMAIN` — 9 objetos nomeados: `Party`, `Person`, `External Organization`, `Relationship`, `Contact`, `Address`, `Phone`, `Email`, `Social Profile`.
- `knowledge/core/BOM.md` (catálogo oficial de objetos, `PROJECT_RULES.md § Regras de Banco de Dados`: "nenhuma entidade de dados pode ser criada sem estar descrita em `BOM.md`") — contém entradas reais para `Party`, `Person`, `External Organization`, `Relationship`. **Não contém entradas para `Contact`, `Address`, `Phone`, `Email`, `Social Profile`** — confirmado por busca direta, zero ocorrências como cabeçalho `## `.
- `knowledge/core/UBIQUITOUS_LANGUAGE.md § Domínio: Relationship` — definições completas dos 4 termos catalogados em `BOM.md`.
- `knowledge/architecture/decisions/AGGREGATE_DISCOVERY.md § "Customer (Relationship) — Candidato"` — já nomeia `Party` como candidato a Aggregate Root, com a pergunta em aberto "`Party` é o próprio Aggregate Root, ou `Person`/`External Organization` são Aggregates independentes?".
- `services/domains/sales/domain/aggregates/opportunity/opportunity.ts` (código real, congelado) — `OpportunityProps.partyId: UniqueEntityId` (linha 65), um único campo de referência genérico, nunca `personId`/`externalOrganizationId` separados.

## 2. Achado Decisivo — `Party` é um único Aggregate Root

A pergunta em aberto de `AGGREGATE_DISCOVERY.md` está resolvida por evidência de código real, não apenas documental: `Opportunity` (já implementado e congelado) referencia `partyId: UniqueEntityId` como **um único tipo de referência genérico** — nunca dois campos separados para pessoa física vs. organização externa. Se `Person` e `External Organization` fossem Aggregates independentes, `Opportunity` precisaria de dois campos opcionais (`personId?`, `externalOrganizationId?`) ou uma referência discriminada — nenhum dos dois padrões existe no código real.

**Conclusão**: `Party` é o Aggregate Root único. `Person` e `External Organization` são **especializações internas** de `Party` (mesmo vocabulário de `BOM.md`: "Especializações: Person, Organization externa"), distinguidas por um discriminador de tipo — não subclasses, mesmo padrão já usado em `Opportunity`/`OpportunityStatus` (união literal, nunca herança de classe) e em `Proposal`/`ProposalStatus`.

## 3. Achado Decisivo — `Relationship` é um Aggregate Root próprio, não Entity de `Party`

`Relationship` representa o vínculo **entre dois** `Party` (`BOM.md`: "Representa o vínculo entre Parties"; `UBIQUITOUS_LANGUAGE.md`: "Vínculo entre Parties... Para o vínculo em si, com seu tipo"). Isso é estruturalmente diferente do padrão já usado para `Proposal` (pertence a exatamente **um** `Opportunity`): um `Relationship` conecta duas instâncias de `Party` de forma simétrica — não pertence, de forma não-arbitrária, a nenhuma das duas.

Critérios já usados nesta engenharia para decidir Aggregate Root vs. Entity interna (mesmo método de `ADR-0021`, Pipeline vs. Entity de Opportunity):

| Critério | Resultado para `Relationship` |
|---|---|
| Identidade própria | Sim — `BOM.md` nomeia `Relationship` como objeto próprio, distinto de `Party` |
| Ciclo de vida próprio, com evento confirmado | Sim — `RelationshipCreated` é um dos 10 eventos oficiais de `DOMAIN_MODEL.md § EVENT BUS` |
| Consistência que cruza mais de um Aggregate | Sim — qualquer invariante sobre o vínculo (ex.: unicidade de tipo entre duas Parties) envolveria dois `Party` diferentes, o que uma Entity interna de um único Aggregate não pode garantir |
| Necessidade de referência independente | Sim — consultar "todos os Relationships de uma Party" não deveria exigir carregar a outra Party envolvida |

**Conclusão**: `Relationship` é um Aggregate Root próprio, referenciando dois `Party` por id (`partyIdA`/`partyIdB`) — nunca embutindo a instância completa, mesmo padrão já usado por `Opportunity.partyId`/`pipelineId`/`currentStageId`.

**Achado adicional, não silencioso**: `DOMAIN_MODEL.md § EVENT BUS` confirma `RelationshipCreated` mas **não confirma nenhum evento equivalente para a criação de `Party`** (`PartyCreated` não existe na lista oficial de 10 eventos). Isso não impede `Party` de ser um Aggregate Root — apenas significa que, diferente de `Opportunity`/`OpportunityCreated`, a criação de `Party` não corresponde a nenhum evento de domínio já confirmado. Nenhum evento é inventado aqui para preencher essa lacuna.

## 4. Estrutura Proposta — `Party` (Aggregate Root)

| Campo | Tipo candidato | Obrigatório/Opcional | Evidência |
|---|---|---|---|
| `id` | `UniqueEntityId` (herdado) | Obrigatório | Padrão de todo Aggregate Root (`AggregateRoot<T>`, Shared Kernel) |
| `organizationId` | `UniqueEntityId` | Obrigatório | Regra transversal de multi-tenancy já aplicada a `Opportunity` (`ENS-0001 § 7`) |
| `partyType` | União literal candidata: `"person" \| "external_organization"` | Obrigatório | `BOM.md`: "Especializações: Person, Organization (externa)" — discriminador necessário para distinguir as duas especializações dentro de um único Aggregate Root |
| `createdAt`, `updatedAt` | `Date` | Obrigatório | Mesmo padrão de `Timestamped`, já usado por `Opportunity`/`Proposal` |

**Campos de conteúdo (nome, documento, e-mail, endereço) — `Needs Evidence`, não incluídos**: nenhuma fonte (`BOM.md`, `UBIQUITOUS_LANGUAGE.md`, `DOMAIN_MODEL.md`) define os campos reais de `Person`/`External Organization` além do nome do conceito. `Contact`, `Address`, `Phone`, `Email`, `Social Profile` — citados em `DOMAIN_MODEL.md § RELATIONSHIP DOMAIN` como objetos — **não têm entrada em `BOM.md`**, e `PROJECT_RULES.md § Regras de Banco de Dados` proíbe criar qualquer entidade de dados sem catálogo em `BOM.md` ou extensão aprovada por ADR. Estado deliberadamente mínimo, mesma disciplina já aplicada a `Proposal` (nenhum campo de conteúdo inventado).

## 5. Estrutura Proposta — `Relationship` (Aggregate Root)

| Campo | Tipo candidato | Obrigatório/Opcional | Evidência |
|---|---|---|---|
| `id` | `UniqueEntityId` (herdado) | Obrigatório | Padrão de todo Aggregate Root |
| `organizationId` | `UniqueEntityId` | Obrigatório | Regra transversal de multi-tenancy |
| `partyIdA`, `partyIdB` | `UniqueEntityId` (2 campos) | Obrigatório | `BOM.md`/`UBIQUITOUS_LANGUAGE.md`: vínculo é sempre entre duas Parties |
| `type` | União literal: `"cliente" \| "fornecedor" \| "parceiro" \| "prospect" \| "investidor" \| "colaborador"` | Obrigatório | `BOM.md § Relationship`, "Tipos possíveis" — os 6 valores já nomeados explicitamente na fonte, nenhum inventado |
| `createdAt`, `updatedAt` | `Date` | Obrigatório | Mesmo padrão de `Timestamped` |

**Campo `status` — `Needs Evidence`, não incluído**: nenhuma fonte confirma se um `Relationship` tem estados além de existir/não existir (ex.: "ativo"/"encerrado"). Diferente de `type`, que tem 6 valores explicitamente nomeados na fonte, nenhum valor de status é nomeado em nenhum documento. Não inventado aqui.

**Nomenclatura de campo, achado registrado**: `partyIdA`/`partyIdB` são nomes de trabalho, não confirmados por nenhuma fonte (nenhum documento nomeia os dois lados do vínculo, ex. "solicitante"/"solicitado", "proprietário"/"contraparte"). Se o vínculo for direcional na prática de negócio (ex.: sempre "NOVARIS ↔ Party", nunca "Party ↔ Party" entre dois terceiros), os nomes podem precisar mudar antes da implementação — decisão para o Technical Blueprint, não travada aqui.

## 6. Value Objects Candidatos — Bloqueados por Ausência de Catálogo em `BOM.md`

| Objeto | Status |
|---|---|
| `Contact` | Nomeado em `DOMAIN_MODEL.md`, **sem entrada em `BOM.md`** — bloqueado até extensão de catálogo (ADR) |
| `Address` | Idem |
| `Phone` | Idem |
| `Email` | Idem |
| `Social Profile` | Idem |

Nenhum desses 5 objetos pode ser implementado como Value Object real sem primeiro entrar em `BOM.md` — mesma regra já aplicada a todo domínio anterior desta engenharia. Registrado como bloqueio explícito, não contornado.

## 7. Domain Events Candidatos

| Evento | Status |
|---|---|
| `RelationshipCreated` | **Confirmado** — `DOMAIN_MODEL.md § EVENT BUS`, disparado por `Relationship.create()` (Aggregate Root próprio, mesmo padrão de `Opportunity.create()` disparando `OpportunityCreated`) |
| `PartyCreated` | **Não confirmado** — ausente da lista oficial de 10 eventos; `Party.create()` não dispara nenhum evento até que uma fonte confirme sua necessidade |

## 8. Relação Entre os Dois Aggregates

`Party` e `Relationship` são Aggregates irmãos, nunca aninhados — `Relationship` referencia `Party` exclusivamente por id (`partyIdA`/`partyIdB`), nunca embute a instância. Mesmo padrão já usado por `Opportunity.partyId`/`pipelineId` (referência, nunca posse). Nenhum dos dois Aggregates é Entity interna do outro.

## 9. Invariantes Candidatas (não confirmadas por regra de negócio explícita)

- `Relationship` não deveria ser criado entre uma `Party` e ela mesma (`partyIdA !== partyIdB`) — inferência estrutural mínima, mesmo padrão de `Pipeline.addStage()` (unicidade de coleção), não uma regra de negócio citada por nenhuma fonte.
- Duplicidade de `Relationship` do mesmo `type` entre o mesmo par de `Party` — não confirmada por nenhuma fonte; não bloqueada nem permitida explicitamente aqui.

## 10. Perguntas Remanescentes (herdadas de `RELATIONSHIP_DOMAIN_DISCOVERY.md`, agora refinadas)

1. **Resolvida nesta missão**: `Party` é o Aggregate Root único (§ 2).
2. **Resolvida nesta missão**: `Relationship` é Aggregate Root próprio, não Entity de `Party` (§ 3).
3. **Parcialmente resolvida**: `Relationship Type` existe, com 6 valores nomeados (§ 5). `Relationship Status` permanece `Needs Evidence`.
4. `Contact`/`Address`/`Phone`/`Email`/`Social Profile` — bloqueados por ausência em `BOM.md` (§ 6), não resolvido; requer extensão de catálogo via ADR antes de qualquer implementação.
5. Direção/nomenclatura exata de `partyIdA`/`partyIdB` — aberta para o Technical Blueprint (§ 5).
6. `Interaction` (citado apenas em "Responsável por", nunca em "Objetos") — permanece sem nenhum objeto correspondente nomeado; não avaliado nesta missão.

## 11. Recomendação

Prosseguir para um **Technical Blueprint** de `Relationship`/`Customer` (mesmo padrão de `SALES_TECHNICAL_BLUEPRINT.md`, ENG-0036), detalhando construtores, Factory Methods, Repository Contracts e o desenho exato de `partyType`/`type` como uniões literais — reutilizando integralmente o Shared Kernel (`AggregateRoot<T>`, `Result`, `UniqueEntityId`). Antes da implementação real, recomenda-se decidir (não nesta missão): se `Contact`/`Address`/`Phone`/`Email`/`Social Profile` devem ser formalmente adicionados a `BOM.md` agora ou permanecerem bloqueados até uma necessidade concreta de negócio.

---

## Domain Model Validation

Entity criada? **NÃO.** Aggregate criado? **NÃO.** Value Object criado? **NÃO.** Domain Event criado? **NÃO.** Nova regra de negócio criada? **NÃO** — invariantes candidatas (§ 9) marcadas como não confirmadas, não implementadas.

## Relação com Outros Módulos

- [RELATIONSHIP_DOMAIN_DISCOVERY.md](../discovery/RELATIONSHIP_DOMAIN_DISCOVERY.md) (ENG-0022) — Discovery original, origem das Open Questions resolvidas aqui
- [AGGREGATE_DISCOVERY.md](../decisions/AGGREGATE_DISCOVERY.md) — origem do candidato `Party`, pergunta em aberto agora resolvida
- [knowledge/core/BOM.md](../../core/BOM.md), [knowledge/core/UBIQUITOUS_LANGUAGE.md](../../core/UBIQUITOUS_LANGUAGE.md) — fontes exclusivas de todo campo/tipo proposto
- [services/domains/sales/domain/aggregates/opportunity/opportunity.ts](../../../services/domains/sales/domain/aggregates/opportunity/opportunity.ts) — evidência de código real decisiva para `Party` como Aggregate Root único
- [ADR-0021-pipeline-nature.md](../../../adr/ADR-0021-pipeline-nature.md) — precedente direto do método usado para decidir Aggregate Root vs. Entity interna

## Status

🟢 Design tático concluído. Nenhum código, Aggregate, Entity, Value Object, Domain Event ou regra de negócio implementado. Próxima etapa recomendada: Technical Blueprint. Aguardando aprovação formal do CTO.
