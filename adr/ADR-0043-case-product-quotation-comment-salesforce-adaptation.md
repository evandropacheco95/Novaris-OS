# ADR-0043 — Case, Product/Quotation e Comment: 3 Novas Adaptações do Salesforce

## Problema

Continuação direta de `ADR-0042` (Lead) sob a mesma autorização do CTO ("adapte tudo do salesforce para o Novaris... autorização para editar o que não tiver"). O CTO escolheu, entre os 3 candidatos apresentados ao final de `ENG-0143`, implementar todos: **Case** (Service Cloud), **Product/PriceBook** (catálogo + precificação de Opportunity) e **Chatter/Comment** (feed polimórfico). Esta ADR decide onde cada um vive e sua forma mínima — os 3 são genuinamente distintos em posicionamento de domínio, por isso reunidos numa única ADR (mesmo critério de agrupamento de `ADR-0041`), mas com decisões independentes.

## Contexto

- **Comment já tem Owner de domínio decidido**: `DOMAIN_MODEL.md § ACTIVITY DOMAIN` já lista `Comment` como Objeto oficial (linha 232) desde a modelagem original — nunca implementado. `ENG-0132` já havia confirmado "`Comment` polimórfico, fora de escopo do domínio" e adiado deliberadamente. `BOM.md § Comment`: "Comentário associado a qualquer objeto." (uma linha, sem campos). Esta ADR não decide **onde** Comment vive (já decidido) — só sua forma mínima.
- **Case não existe em nenhuma fonte** (`BOM.md`, `DOMAIN_MODEL.md`, nenhum ADR) — gap genuíno, mesma situação de `Lead` antes de `ADR-0042`. Precisa de decisão de posicionamento.
- **Product/PriceBook não existe em nenhuma fonte** — mas `Quotation` **já existe** como Objeto oficial do Sales Domain (`DOMAIN_MODEL.md § SALES DOMAIN`, `BOM.md § Quotation`: "Proposta comercial"... na verdade `BOM.md § Proposal`: "Proposta comercial.", `Quotation` seria a entrada seguinte — checado: `BOM.md` não tem uma seção `## Quotation` própria, só é citado na lista de Objetos do Sales Domain) e citado como "Needs Evidence" em `opportunity.ts` (`ADR-0020`: "`Quotation` distinto de `Proposal`, não sinônimo" — forma nunca definida). O Salesforce resolve exatamente esse "Needs Evidence" com seu modelo `Quote`/`QuoteLineItem`/`PricebookEntry`/`Product2`: um documento de preço formal, com linhas de item, distinto da `Proposal` (que é só um gate de aprovação sem conteúdo/valor, `ADR-0020`). Adaptar o Salesforce aqui não cria um conceito novo paralelo — **preenche a lacuna estrutural que `Quotation` já tinha reservada**.
- `DOMAIN_MODEL.md § DEPENDÊNCIAS`: cadeia "Identity → Workspace → Relationship → Sales → Activity → Project → Marketing → Financial → Analytics → System", regra "nenhum domínio pode depender de um domínio abaixo dele".

## Decision Drivers

- Mesma disciplina de campo mínimo de toda a sessão — nenhum campo sem necessidade estrutural confirmada.
- Preferir preencher uma lacuna já reservada (`Quotation`) a criar um conceito paralelo não solicitado.
- `Case` deve viver onde a estrutura de dados já existente for mais próxima (evitar reinventar o que `Activity` já resolve: referência a `Party` por id, ciclo de vida de status).
- Sem Territory Management, Forecasting, CPQ multi-moeda/multi-pricebook, Assets, Entitlements/Milestones (SLA) — nenhuma evidência de necessidade no público-alvo (`NOVARIS_OS.md § 9`).

## Alternativas

### Case

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. `Case` como novo Aggregate Root em `services/domains/activity`** | Par com `Activity`, mesmo pacote | Escolhida — `Activity Domain` já é dono de objetos "registro de algo que acontece com um Party ao longo do tempo, com ciclo de status" (`Activity`, `CalendarEvent`, `Reminder`, `Checklist` na lista oficial de Objetos); `Case` é estruturalmente idêntico a esse padrão. `Activity` vem depois de `Relationship` na cadeia — `Case.partyId` por referência já é permitido. |
| B. `Case` em `services/domains/customer` | Responsabilidade "Interações" está listada em `RELATIONSHIP DOMAIN` | Rejeitada — a lista **oficial de Objetos** de Relationship (`Party`, `Person`, `External Organization`, `Relationship`, `Contact`, `Address`, `Phone`, `Email`, `Social Profile`) é inteira sobre dados de identidade/contato, não sobre registros de eventos com ciclo de status — `Case` não se encaixa nesse padrão de objeto. |
| C. `Case` como novo Business Domain (Service) | Domain Layer dedicado | Rejeitada — nenhuma evidência de complexidade (SLA, filas de atendimento, escalonamento) que justifique um domínio novo; mesmo critério de rejeição usado para `Lead` (Opção C, `ADR-0042`). |

### Product / Quotation

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. `Product` novo + `Quotation` preenchendo a lacuna já reservada, ambos em `services/domains/sales`** | Linha de item (`QuotationLineItem`) referencia `Product`, `Quotation` referencia `Opportunity` por id | Escolhida — resolve o "Needs Evidence" de `ADR-0020` sem inventar um objeto paralelo; mesmo pacote de `Opportunity`/`Proposal`, nenhuma dependência nova. |
| B. Adicionar linhas de item direto em `Opportunity` (sem `Quotation` como Aggregate próprio) | Mais simples | Rejeitada — `Opportunity` é deliberadamente mínimo (doc do próprio Aggregate lista `Quotation` como relacionamento candidato **não incluído** por falta de forma definida); inflar seu boundary transacional contradiz essa decisão já registrada, e um `Opportunity` pode legitimamente ter mais de uma `Quotation` (revisões de preço), que um campo único não suportaria. |
| C. `Product` como Business Domain próprio ("Catalog") | Domain Layer dedicado | Rejeitada — sem evidência de necessidade (catálogo multi-moeda, variantes, hierarquia de categoria); um catálogo simples por organização não justifica um domínio novo. |

### Comment

Owner já decidido (`Activity Domain`, `DOMAIN_MODEL.md`). Única decisão nesta ADR: forma mínima (ver Decision abaixo).

## Decision

### 1. Case (`services/domains/activity`)

- **`Case`** (Aggregate Root): `organizationId`, `partyId` (referência, sem FK — mesmo padrão de `Activity.partyId`), `subject` (obrigatório), `description?`, `status: CaseStatus`, `priority: CasePriority`.
- **`CaseStatus`**: `"new" | "in_progress" | "closed"` — 3 estados mínimos (Salesforce tem `Escalated` também; não incluído, sem evidência de fila de escalonamento). `start()`: `new → in_progress`, sem evento (mesmo critério de `Lead.updateStatus()`). `close()`: terminal a partir de `new` **ou** `in_progress` (um caso pode ser fechado sem passar por "em andamento" — ex.: duplicado), dispara `CaseClosed`.
- **`CasePriority`**: `"low" | "medium" | "high"` — sem `Escalated`/`Critical` adicional, sem evidência.
- **Domain Events**: `CaseCreated`, `CaseClosed` — mesma forma de `ActivityCreated`/`ActivityCompleted` (par criação+conclusão já é o padrão confirmado do próprio domínio).
- **Sem referência a `Product`** — union naturalmente possível (Case sobre um Product específico), mas não solicitada e não implementada agora; registrada como extensão futura natural, não uma lacuna.

### 2. Product + Quotation (`services/domains/sales`)

- **`Product`** (Aggregate Root, catálogo): `organizationId`, `name` (obrigatório), `sku?`, `unitPrice` (obrigatório, `>= 0`), `active` (default `true`). Sem Domain Event (mesmo critério de `Party`/`Campaign`/`Dashboard` — objetos de catálogo/cadastro sem evento próprio confirmado). Sem múltiplos Price Books nomeados (Standard/Regional/etc.) — um único preço por Product, mesma disciplina de não inventar complexidade CPQ sem evidência.
- **`Quotation`** (Aggregate Root, **não** Internal Entity de `Opportunity` — motivo: uma `Opportunity` pode ter múltiplas `Quotation`s ao longo do tempo, revisões de preço, mesma razão pela qual `Lead` também não é Internal Entity de nada): `organizationId`, `opportunityId` (referência por id, sem FK — mesmo padrão de `Opportunity.partyId`), `status: QuotationStatus`, coleção interna `lineItems: QuotationLineItem[]` (Internal Entity, mesmo padrão de `Proposal`/`Stage`).
- **`QuotationLineItem`** (Internal Entity de `Quotation`): `productId` (referência), `quantity` (`> 0`), `unitPrice` (snapshot no momento da adição — mudanças futuras de preço do `Product` não alteram retroativamente uma `Quotation` já criada, mesmo princípio de um preço de fatura nunca mudar depois de emitida). `lineTotal` = `quantity × unitPrice` (getter computado, não persistido). `Quotation.total` = soma de todos os `lineTotal`.
- **`QuotationStatus`**: `"draft" | "sent" | "accepted" | "rejected"` — mesma forma de `OpportunityStatus` (`open`/`won`/`lost`), com um estado adicional (`sent`) porque uma Quotation precisa ser editável (`draft`) antes de ser enviada, diferente de uma Opportunity que já nasce "em negociação". `addLineItem()` só é permitido em `draft`. `send()`: `draft → sent`, sem evento (transição administrativa, mesmo critério de `Lead.updateStatus()`). `accept()`/`reject()`: terminais a partir de `sent`, disparam `QuotationAccepted`/`QuotationRejected` (mesmo par simétrico de `OpportunityWon`/`OpportunityLost`).
- **`AddQuotationLineItemHandler`** (Application) injeta `ProductRepository` além de `QuotationRepository` — resolve o `unitPrice` a partir do `Product` real no momento da chamada (nunca aceita preço vindo do cliente HTTP), falha com `NotFoundError` se o `Product` não existir ou estiver `active: false`. Mesmo mecanismo de composição-via-injeção-de-dependência já usado (agora dentro do mesmo domínio, não cross-domínio como `ConvertLeadHandler`).
- **`Quotation.accept()` não fecha a `Opportunity` automaticamente** — nenhuma fonte confirma esse comportamento no Salesforce (é uma ação manual separada); não inventado aqui.
- **`Contract`** permanece **não implementado** — seria o próximo passo natural (Quotation aceita → gera Contract), mas fora do escopo desta ordem ("Case, Product/PriceBook, Chatter" — Contract não foi um dos 3 nomeados); registrado como candidato futuro, não esquecido.

### 3. Comment (`services/domains/activity`)

- **`Comment`** (Aggregate Root): `organizationId`, `targetType` (`string`, **sem enum fechado** — polimórfico por definição de `BOM.md`, mesmo tratamento de `Lead.source`), `targetId` (referência), `authorUserId` (referência), `body` (obrigatório).
- **Sem validação de existência do alvo** (`targetType`/`targetId`) — Comment é deliberadamente desacoplado de qualquer domínio específico; validar existência exigiria depender de todos os domínios que podem ser comentados, contradizendo o próprio propósito polimórfico.
- **Sem restrição de "só o autor pode editar/apagar"** — o modelo de autorização da plataforma inteira é por Permission de domínio (`activity.comments.manage`), não por posse de registro individual; nenhum outro Aggregate desta plataforma aplica essa restrição (Party, Activity, Lead — todos editáveis por qualquer usuário com a Permission do domínio). Consistência mantida, não uma lacuna nova.
- **Domain Events**: `CommentCreated` apenas — edição/remoção não emitem evento, mesmo critério de `Party`/`Lead.updateStatus()` (mutações administrativas sem valor de evento confirmado).
- **Primeira rota `DELETE` de um Aggregate completo nesta API** (`DELETE /comments/:id`) — os 2 usos anteriores de `@Delete` (`user.controller.ts`, `role.controller.ts`) removem sub-relacionamentos (Role de um User, Permission de uma Role), nunca um Aggregate inteiro. Justificado porque remover um comentário é uma operação de usuário normal e esperada (diferente de, por exemplo, `AuditEntry`, que é deliberadamente imutável).

## Rejected Alternatives

Ver tabelas acima.

## Consequences

- `services/domains/sales`: 2 novos Aggregates (`Product`, `Quotation` + `QuotationLineItem`), sem nova dependência de pacote.
- `services/domains/activity`: 2 novos Aggregates (`Case`, `Comment`), sem nova dependência de pacote.
- 5 novas tabelas Postgres: `products`, `quotations`, `quotation_line_items`, `cases`, `comments`.
- API real: `/products`, `/quotations` (+ linhas de item, envio, aceite/rejeição), `/cases` (+ start/close), `/comments` (+ update/delete — primeira rota de hard-delete de Aggregate completo).
- Frontend: `/products`, `/quotations`, `/cases`, `/comments` — 4 novas páginas.
- `BOM.md`/`DOMAIN_MODEL.md`: `Comment` deixa de ser "fora de escopo" (nota de resolução não-destrutiva); `Case`/`Product` adicionados às listas de Objetos oficiais de seus domínios (extensão, não substituição).
- Não resolve: Territory Management, Forecasting, CPQ multi-pricebook/multi-moeda, Assets, Entitlements/SLA, escalonamento de Case, `Contract` gerado a partir de Quotation aceita — todos explicitamente fora de escopo, sem evidência de necessidade no público-alvo (`NOVARIS_OS.md § 9`).

## Responsável

CTO / Arquiteto Chefe — "faça os 3 e já engate no restante da construção", escolhendo implementar todos os 3 candidatos apresentados ao final de `ENG-0143`.

## Data

2026-07-24

## Impactos

- `services/domains/sales/domain/aggregates/{product,quotation}/**`, `domain/entities/quotation-line-item/**`, `domain/events/{quotation-created,quotation-accepted,quotation-rejected}.ts`, `domain/repositories/{product,quotation}-repository.ts`.
- `services/domains/sales/application/{commands,handlers}/**` (Product/Quotation).
- `services/domains/sales/infrastructure/{mappers,repositories}/*{product,quotation}*`.
- `services/domains/activity/domain/aggregates/{case,comment}/**`, `domain/events/{case-created,case-closed,comment-created}.ts`, `domain/repositories/{case,comment}-repository.ts`.
- `services/domains/activity/application/{commands,handlers}/**` (Case/Comment).
- `services/domains/activity/infrastructure/{mappers,repositories}/*{case,comment}*`.
- `packages/database/prisma/schema.prisma` — models `Product`/`Quotation`/`QuotationLineItem`/`Case`/`Comment` + migration.
- `apps/api/src/sales/{product,quotation}.controller.ts`, `apps/api/src/activity/{case,comment}.controller.ts`, atualização dos respectivos `*.module.ts`.
- `apps/web/app/{products,quotations,cases,comments}/page.tsx` (novos).
- `apps/api/src/seed.ts` — novos códigos de Permission.
- `knowledge/core/BOM.md`, `knowledge/core/DOMAIN_MODEL.md`, `services/domains/sales/README.md`, `services/domains/activity/README.md`, `NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md`.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum dado existente é migrado — 5 tabelas novas, vazias. Nenhum `Opportunity`/`Activity`/`Lead` existente é afetado — todas as adições são aditivas.

## Status

Aceito
