# ADR-0040 — Integration Hub: Estrutura Real, Credenciais Deliberadamente Adiadas

## Problema

`ADR-0039 § Fora de Escopo` deixou `integration-hub` sem implementação porque "exige saber **quais** sistemas externos" — o CTO respondeu diretamente: WhatsApp, Meta, Bling e Google (`Calendar`/`Gmail`/`Sheets`/`Ads`). Isso resolve a pergunta de **quais** sistemas, mas não resolve uma segunda pergunta, descoberta ao verificar o repositório antes de escrever qualquer código: **nenhuma credencial real existe para nenhum dos 4** (`'.env.example'` só antecipa `OPENAI_API_KEY`/`ANTHROPIC_API_KEY` para IA; a seção de Automação diz literalmente "integrações concretas ainda não definidas"). Esta ADR decide como proceder sem essas credenciais.

## Contexto

- Toda peça de infraestrutura construída em `ENG-0139`/`ENG-0140` (Event Bus, Scheduler, Notifications, Files, Realtime, Search, Monitoring) foi **verificada ao vivo** antes de ser considerada pronta — nenhuma delas exigia uma conta de terceiro para essa verificação. WhatsApp Business API, Meta Graph API, Bling e Google APIs são diferentes: nenhuma chamada real é possível sem credencial (Meta exige verificação de negócio para WhatsApp Business API; Bling exige assinatura paga; Google exige projeto no Google Cloud com OAuth configurado) — nenhuma dessas contas foi criada, e não é algo que esta engenharia possa fazer sozinha.
- Perguntado diretamente, o CTO escolheu **"Construir só a estrutura"**: Port + Command/Handler + Controller reais, com um adapter que loga a chamada em vez de acessar a API de verdade — mesmo padrão já usado por `ConsoleNotifier` (`ADR-0039`) — em vez de (a) escrever adapters HTTP reais nunca testados contra uma conta real, ou (b) esperar a credencial para escrever qualquer código.
- Diferença importante em relação a `ConsoleNotifier`: lá, o adapter real (console) já é uma opção **funcional e aceitável** para o caso de uso de notificação interna. Aqui, o adapter de log **não substitui** a integração real — é puramente estrutural, para não deixar a plataforma sem nenhum código quando a credencial chegar. Isso é registrado explicitamente para não confundir "log de integração" com "integração funcionando".

## Decision Drivers

- Escrever um HTTP client real contra APIs que nunca foram testadas (WhatsApp Cloud API, Graph API, Bling API v3, Google APIs) arrisca produzir código com bugs invisíveis até a primeira chamada real — contradiz a disciplina desta engenharia de nunca declarar algo pronto sem verificação real.
- Cada API tem um escopo de operação amplo (ex.: Graph API cobre posts, ads, mensageria, insights); sem um caso de uego de negócio concreto além de "integrar", esta ADR escolhe **uma única operação representativa** por provedor — a mais central ao propósito declarado em `NOVARIS_OS.md § 7` — em vez de tentar cobrir a API inteira.
- `Bling` emite nota fiscal real (implicações fiscais) — mapear os campos completos de uma NF-e (CFOP, regime tributário, etc.) seria inventar uma regra de negócio/fiscal sem nenhuma fonte; esta ADR usa um payload mínimo e genérico (`reference`/`amount`/`description`), explicitamente **não** uma NF-e completa.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. Port + Console adapter (loga, não chama a API real)** | Mesmo padrão de `ConsoleNotifier` | Escolhida — decisão direta do CTO |
| B. Adapter HTTP real, nunca testado | Escrever o cliente HTTP completo contra cada API | Rejeitada pelo CTO — risco de código quebrado sem forma de descobrir antes de uma credencial real existir |
| C. Esperar credenciais antes de qualquer código | Não escrever nada até uma conta real existir | Rejeitada pelo CTO — bloquearia todo o trabalho de estrutura que não depende de credencial |

## Decision

**Opção A — `@novaris/integration-hub`, 7 Ports + 7 Console adapters:**

| Provedor | Port | Operação única (representativa, não a API inteira) |
|---|---|---|
| WhatsApp | `WhatsAppProvider` | `sendMessage(to, message)` |
| Meta | `MetaProvider` | `publishPost(pageId, message)` |
| Bling | `BlingProvider` | `emitInvoice(reference, amount, description)` — payload mínimo, **não** uma NF-e completa |
| Google Calendar | `GoogleCalendarProvider` | `createEvent(title, startsAt, endsAt)` |
| Gmail | `GmailProvider` | `sendEmail(to, subject, body)` |
| Google Sheets | `GoogleSheetsProvider` | `appendRow(spreadsheetId, values)` |
| Google Ads | `GoogleAdsProvider` | `createCampaign(name, budget)` |

Cada adapter Console (`ConsoleWhatsAppProvider` etc.) loga a chamada via `@novaris/logging` e devolve `{ success: true, loggedOnly: true }` — `loggedOnly` é um campo explícito, propagado até a resposta HTTP, para que ninguém confunda "logado" com "enviado de verdade".

**API real**: um único `IntegrationHubController` (`apps/api`), 7 rotas (`POST /integrations/{whatsapp,meta,bling,google/calendar,google/gmail,google/sheets,google/ads}`), protegidas por **um único código de Permission** (`system.integration-hub.manage`) — granularidade mais fina (uma Permission por provedor) fica para quando os adapters reais existirem e o produto precisar diferenciar acesso.

**`.env.example`** ganha placeholders vazios documentando a credencial que cada adapter real vai precisar (`WHATSAPP_ACCESS_TOKEN`, `META_ACCESS_TOKEN`, `BLING_API_KEY`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_REFRESH_TOKEN`) — nenhum valor, só a forma esperada.

## Rejected Alternatives

Ver Opções B e C acima.

## Consequences

- Nenhuma integração externa real funciona depois desta ADR — todo `POST /integrations/*` só loga e devolve `loggedOnly: true`. Isso deve ficar claro em toda documentação e resposta de API, para não ser confundido com integração funcionando.
- Quando uma credencial real existir para qualquer um dos 7, o trabalho é trocar só o adapter (`ConsoleXProvider` → `HttpXProvider`), sem mudar o Port nem o Controller — mesma prova de "Ports & Adapters" já validada por `ConsoleLogger`/`InProcessEventBus`.
- `Bling.emitInvoice` usa payload mínimo — se o produto precisar de uma NF-e real (CFOP, regime tributário, etc.), isso é uma ADR futura própria, com um contador/fiscal envolvido, não uma decisão de engenharia isolada.
- Permissão única (`system.integration-hub.manage`) para os 7 provedores — se o produto precisar diferenciar quem pode acionar qual provedor, isso é uma ADR futura.

## Responsável

CTO / Arquiteto Chefe — resposta direta a 3 perguntas: quais sistemas externos (WhatsApp/Meta/Bling/Google), quais produtos Google (Calendar/Gmail/Sheets/Ads, todos os 4), e como proceder sem credenciais ("Construir só a estrutura").

## Data

2026-07-24

## Impactos

- `services/kernel/integration-hub/src/**` (novo código).
- `apps/api/src/integration-hub/**` (novo Controller/Module).
- `apps/api/src/seed.ts` — novo código de Permission (`system.integration-hub.manage`).
- `.env.example` — placeholders de credencial (sem valores).
- `services/kernel/README.md`, `NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md` — reclassificação.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum dado existente é migrado — nenhuma tabela nova (Console adapters não persistem nada).

## Status

Aceito
