# ADR-0042 — Lead: Novo Aggregate no Sales Domain, Adaptado do Salesforce

## Problema

O CTO autorizou explicitamente adaptar estrutura do Salesforce para o NOVARIS onde não existir ainda ("tem minha autorização para editar o que não tiver, sempre se inspirando também no salesforce"). O gap mais fundamental de "core CRM" identificado: o Sales Domain (`Opportunity`) hoje exige um `Party` (Customer Domain) já existente — não há conceito de qualificação **antes** de um contato virar Party/Opportunity, equivalente ao `Lead` do Salesforce (captura mínima → qualificação → conversão em Account+Contact+Opportunity). Esta ADR decide a forma do `Lead` no NOVARIS e onde ele vive.

## Contexto

- Verificado: `Lead` não é citado em nenhuma fonte oficial (`BOM.md`, `DOMAIN_MODEL.md`, nenhum ADR) — gap genuíno, não um conceito já decidido em outro lugar.
- `DOMAIN_MODEL.md § DEPENDÊNCIAS` já define a cadeia "Identity → Workspace → Relationship → Sales → Activity → ..." com a regra "nenhum domínio pode depender de um domínio abaixo dele". `Relationship` (Customer, `Party`) vem **antes** de `Sales` — logo `Sales` já pode depender de `Customer`, mas não o contrário. Como a conversão de um `Lead` cria um `Party` (Customer) e opcionalmente uma `Opportunity` (Sales), **`Lead` só pode viver em `Sales`** sem violar essa regra já congelada — se vivesse em `Customer`, a conversão exigiria `Customer` depender de `Sales` (abaixo dele), proibido.
- Precedente direto de composição cross-domínio já aceito nesta engenharia: `ADR-0035` (Audit) — Handler de um domínio chama Handler de outro via Dependency Injection, depois do sucesso da operação primária. `ConvertLeadHandler` usa o mesmo mecanismo — chama `CreatePartyHandler` (Customer) e, opcionalmente, `CreateOpportunityHandler` (Sales, já no mesmo domínio) — primeira vez que esse padrão conecta 2 Business Domains (não Kernel→Domain).
- Salesforce real: `Lead` tem campos (`FirstName`/`LastName`/`Company`/`Email`/`Phone`/`LeadSource`/`Status`/`Rating`) e o evento central é **conversão** (`ConvertLead`), que gera `Account`+`Contact`+opcionalmente `Opportunity`, e marca o Lead como `Converted` (estado terminal, preserva `ConvertedAccountId`/`ConvertedContactId`/`ConvertedOpportunityId`).

## Decision Drivers

- Mesma disciplina de campo mínimo já usada em `ADR-0025`/`ADR-0030`/etc.: só os campos estruturalmente necessários para o conceito "Lead" funcionar, nada inventado além disso.
- `Party` do NOVARIS já unifica pessoa/organização externa num único conceito (mais simples que o par Account/Contact do Salesforce) — a conversão de `Lead` cria **um** `Party`, não dois objetos separados.
- Nenhuma tabela de "Rating" (Hot/Warm/Cold) nem catálogo fechado de `LeadSource` — nenhuma fonte define esses valores; `source` fica `string` livre, mesmo critério já usado para não inventar enum sem evidência.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. `Lead` como novo Aggregate Root em `services/domains/sales`** | Par com `Opportunity`, mesmo pacote | Escolhida — única posição que respeita `DOMAIN_MODEL.md § DEPENDÊNCIAS` sem exceção |
| B. `Lead` em `services/domains/customer` | Conceitualmente mais próximo de "quem é essa pessoa" | Rejeitada — violaria a cadeia de dependência (`Customer` teria que depender de `Sales` para criar `Opportunity` na conversão) |
| C. `Lead` como novo Business Domain próprio | Domain Layer dedicado | Rejeitada — nenhuma evidência de complexidade que justifique um domínio novo; `Lead` é conceitualmente parte do funil de vendas, mesmo lugar de `Opportunity`/`Pipeline` |

## Decision

**Opção A.**

- **`Lead`** (Aggregate Root, `services/domains/sales/domain/aggregates/lead/lead.ts`): `organizationId`, `name` (obrigatório — mínimo para identificar o contato), `email?`, `phone?`, `company?` (nome da empresa, ainda **não** um `Party` — só texto livre até a conversão), `source?` (texto livre, sem catálogo fechado), `status: LeadStatus`, `convertedPartyId?`, `convertedOpportunityId?`.
- **`LeadStatus`**: `"new" | "contacted" | "qualified" | "unqualified" | "converted"` — 5 estados mínimos para suportar `LeadCreated`/`LeadConverted` (mesmo critério de `OpportunityStatus`, `opportunity.ts`: "estados mínimos necessários para os eventos já aprovados, não uma tabela de transição inventada"). `updateStatus()` transiciona entre os 4 estados não-terminais; `"converted"` só é alcançável via `convert()`, nunca via `updateStatus()` diretamente — mesma disciplina de `User.activate()`/`invite()` serem métodos próprios, não um setter genérico.
- **`convert(partyId, opportunityId?)`**: marca `status: "converted"` (terminal — não há reversão, mesmo critério de `Opportunity.markWon()`/`markLost()`), grava `convertedPartyId`/`convertedOpportunityId`. Falha (`ConflictError`) se já `"converted"`. **Não cria o `Party`/`Opportunity`** — isso é responsabilidade do `ConvertLeadHandler` (Application Layer), que orquestra: (1) cria o `Party` via `CreatePartyHandler` (Customer, nova dependência cross-domínio de `@novaris/sales` sobre `@novaris/customer`), (2) opcionalmente cria a `Opportunity` via `CreateOpportunityHandler` (já no mesmo domínio), (3) chama `lead.convert(party.id, opportunity?.id)`, (4) persiste o `Lead`. Se a criação do `Party` falhar, a conversão inteira falha (não é um efeito colateral opcional como Audit — aqui `Party` é o próprio propósito da conversão, não uma trilha observacional).
- **Domain Events**: `LeadCreated`, `LeadConverted` — mesma forma mínima de `OpportunityCreated` (`eventId`/`aggregateId`/`occurredAt`/`eventName`, sem payload de negócio).

## Rejected Alternatives

Ver Opções B e C acima.

## Consequences

- `@novaris/sales` ganha dependência de `@novaris/customer` (primeira composição real entre 2 Business Domains, não Kernel→Domain).
- Nova tabela Postgres (`leads`).
- API real: `POST`/`GET /leads`, `POST /leads/:id/status`, `POST /leads/:id/convert`.
- Frontend: `/leads` — listar, criar, mudar status, converter (mostra o `Party`/`Opportunity` resultantes).
- Não resolve: Territory Management, Forecasting, CPQ, Custom Objects/Fields dinâmicos, Sharing Rules complexas — funcionalidades de escala empresarial do Salesforce sem evidência de encaixe no público-alvo do NOVARIS (`NOVARIS_OS.md § 9`: empresas de R$ 1-20 milhões de faturamento) — explicitamente fora de escopo, não esquecidas.

## Responsável

CTO / Arquiteto Chefe — autorização direta ("Quero que você adapte tudo do salesforce para o Novaris... autorização para editar o que não tiver, sempre se inspirando também no salesforce"), aplicada ao gap de maior valor identificado (Lead-to-Convert).

## Data

2026-07-24

## Impactos

- `services/domains/sales/domain/aggregates/lead/**`, `domain/events/lead-*.ts`, `domain/repositories/lead-repository.ts`.
- `services/domains/sales/application/{commands,handlers}/{create,update-lead-status,convert}-lead/**`.
- `services/domains/sales/infrastructure/{mappers,repositories}/*lead*`.
- `services/domains/sales/package.json` — nova dependência `@novaris/customer`.
- `packages/database/prisma/schema.prisma` — model `Lead` + migration.
- `apps/api/src/sales/lead.controller.ts`, atualização de `sales.module.ts`.
- `apps/web/app/leads/page.tsx` (novo).
- `apps/api/src/seed.ts` — novo código de Permission.
- `services/domains/sales/README.md`, `NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md`.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum dado existente é migrado — tabela nova, vazia. Nenhum `Opportunity`/`Party` existente é afetado — `Lead` é aditivo, não uma mudança sobre o que já existe.

## Status

Aceito
