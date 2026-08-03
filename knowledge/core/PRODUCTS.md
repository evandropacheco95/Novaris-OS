# Produtos

> 📖 Ver também: [NOVARIS_OS.md § 7 Produtos](NOVARIS_OS.md#7-produtos) e [§ 22 Referências](NOVARIS_OS.md#22-referências) (que lista este arquivo).
>
> ✅ **Resolvido por [ADR-0024](../../adr/ADR-0024-domain-and-product-count-consolidation.md)**: esta lista de 9 produtos é a oficial e vinculante, por decisão explícita do CTO. `NOVARIS_OS.md § 7` nomeia 6 produtos (Growth, CRM, AI, Automation, Studio, **SaaS**), com Marketplace/API Pública/White Label agrupados dentro de "NOVARIS SaaS") — preservada verbatim como registro histórico, não mais a lista de referência. Capítulos abaixo seguem liberados para conteúdo real.
>
> 📖 **Product Layer, não Domain Layer** ([ADR-0007](../../adr/ADR-0007-domain-boundaries.md), Missão ENG-0000.2): os produtos deste arquivo (incluindo `NOVARIS Growth`) representam capacidades estratégicas vendidas ao cliente, implementadas por um ou mais bounded contexts técnicos em [services/domains/](../../services/domains/README.md) ([DOMAIN_MODEL.md](DOMAIN_MODEL.md)). `Growth` foi criado por engano como domínio técnico (`services/domains/growth/`) na Missão ENG-0000.1 e removido na ENG-0000.2 — continua aqui, como produto, corretamente.

## NOVARIS Growth

### Objetivo

**TODO**: conteúdo a ser escrito.

### Escopo

**TODO**: conteúdo a ser escrito.

### Funcionalidades

**TODO**: conteúdo a ser escrito.

### Integrações

**TODO**: conteúdo a ser escrito.

### KPIs

**TODO**: conteúdo a ser escrito.

### Roadmap

**TODO**: conteúdo a ser escrito.

---

## NOVARIS CRM

> ⚠️ **Product Layer parcialmente escrito, Domain Layer completo.** Esta seção documenta como produto o que já existe implementado de ponta a ponta (Domain → Application → Infrastructure → `apps/api` → `apps/web`) nos domínios `services/domains/sales`, `services/domains/customer` e `services/domains/activity`, sob as Missões `ENG-0120` a `ENG-0146` e os ADRs `ADR-0042`, `ADR-0043`, `ADR-0044`, `ADR-0045` e `ADR-0047` (`ADR-0046` é sobre arquitetura de deployment, não-relacionado a este produto). Nenhuma capacidade abaixo é proposta — todas têm Aggregate, Handler, rota REST e (com a exceção anotada) tela em `apps/web/app/` verificáveis no repositório.

### Objetivo

Dar à operação comercial da NOVARIS (e, futuramente, aos clientes que rodam seu próprio negócio sobre a plataforma) um ciclo completo de captação e gestão de relacionamento comercial: capturar um interessado (`Lead`), qualificá-lo e convertê-lo num cliente real (`Party`) e, opcionalmente, numa oportunidade de venda (`Opportunity`), conduzir essa oportunidade por um funil configurável (`Pipeline`/`Stage`) até uma proposta formal (`Proposal`) e uma cotação (`Quotation`) com itens de catálogo (`Product`), fechar como ganho ou perdido, formalizar em contrato (`Contract`) e reconhecer a receita associada (`Revenue`) — além de suportar o pós-venda com casos de atendimento (`Case`), comentários colaborativos (`Comment`), e as ferramentas de agenda/atividade que sustentam qualquer operação comercial (`Activity`/`CalendarEvent`/`Reminder`/`Checklist`).

Isso resolve o mesmo problema que os módulos Sales Cloud e Service Cloud do Salesforce resolvem — não por analogia solta, mas porque essa é a diretriz explícita do CTO registrada em `MASTER_ENGINEERING_ROADMAP.md` (Fase 3, nota `ENG-0142`): usar a estrutura do Salesforce como modelo de referência para áreas do NOVARIS ainda sem estrutura própria. `Lead`→`Lead-to-Convert`, `Quotation`→`Quote`, `Case`→`Service Cloud`, `Comment`→`Chatter` são as adaptações diretas já feitas (`ADR-0042`, `ADR-0043`).

### Escopo

**Dentro do escopo:**

- **Lead-to-Convert** — captura (`POST /leads`), qualificação (`POST /leads/:id/status`) e conversão (`POST /leads/:id/convert`) de um Lead num `Party` (Customer Domain) e, opcionalmente, numa `Opportunity` (Sales Domain) — a primeira composição real entre dois Business Domains desta engenharia (`ConvertLeadHandler`, `ADR-0042`).
- **Opportunity Management** — criação, avanço por `Pipeline`/`Stage` configurável, submissão e aprovação de `Proposal`, fechamento como ganho (`won`) ou perdido (`lost`).
- **Quotation & Product Catalog** — catálogo de `Product` com preço ativável/desativável, montagem de `Quotation` com `QuotationLineItem` (preço resolvido em tempo real a partir do `Product`, não congelado), envio, aceite/rejeição.
- **Contract & Revenue** — geração de `Contract` exclusivamente a partir de uma `Quotation` `accepted`, ciclo `draft→active→terminated`, e geração de `Revenue` a partir de um `Contract`.
- **Customer/Party Management** — `Party` (pessoa física ou `external_organization`) e `Relationship` entre duas `Party` (Customer Domain), a entidade de "cliente" que todo o resto do CRM referencia.
- **Case & Activity (pós-venda)** — `Case` (atendimento, vinculado a um `Party`, com prioridade e ciclo `open→in_progress→closed`), `Comment` (colaboração tipo Chatter), `Activity`, `CalendarEvent`, `Reminder`, `Checklist` — todos do Activity Domain, tecnicamente adjacentes e cobertos pelas telas de CRM.

**Fora do escopo** (cobertos por outras fases do `MASTER_ENGINEERING_ROADMAP.md`, não por este produto):

- Reconhecimento contábil/faturamento recorrente — `NOVARIS Financial` (Fase 6, domínio `financial`: `Invoice`/`Subscription`). O `Revenue` do Sales Domain (`ADR-0047`) fica na fronteira: nasce de um `Contract` do CRM, mas sua posição de produto final (CRM vs. Financial) **não está resolvida** em nenhuma fonte — tratado aqui como `TODO` de fronteira, não como decisão tomada.
- IA aplicada a vendas (scoring de Lead, sugestão de próxima ação etc.) — depende de `ai-runtime` (Kernel), que hoje não faz nenhuma chamada real a modelo de IA; produto `NOVARIS AI` (Fase 4).
- Automação de funil (gatilhos automáticos por mudança de estágio, notificações) — depende de `automation-runtime` (Kernel), que existe e funciona, mas não está hoje conectado a nenhum evento de Sales/Customer/Activity; produto `NOVARIS Automation` (Fase 5).
- Dashboards/relatórios de vendas — domínio `analytics` (`Dashboard`) é Fase 8, produto `NOVARIS Analytics`, e não referencia os domínios de CRM no código.
- Marketplace de produtos/serviços entre organizações — Fase 9, não iniciada.
- API pública para desenvolvedores externos consumirem estes objetos — `apps/api` hoje é a API interna que sustenta o próprio `apps/web` (sessão de usuário, sem API key/rate limiting/versionamento); não é a "API Pública" prevista na Fase 10.

### Funcionalidades

Capacidades reais, por Aggregate/rota confirmadas em `apps/api/src/sales`, `apps/api/src/customer` e `apps/api/src/activity`:

- **Lead** (`/leads`): criar, listar, atualizar status, converter em Party (+ opcionalmente Opportunity).
- **Opportunity** (`/opportunities`): criar, listar, buscar por id, avançar de estágio, submeter Proposal, aprovar Proposal, marcar ganho, marcar perdido.
- **Pipeline** (`/pipelines`): criar, listar, buscar, renomear, adicionar/renomear/reordenar Stage.
- **Product** (`/products`): criar, listar, atualizar preço, ativar, desativar.
- **Quotation** (`/quotations`): criar (a partir de uma Opportunity), listar, buscar, adicionar item de linha, enviar, aceitar, rejeitar, gerar Contract (bloqueado com 400/409 se a Quotation não estiver `accepted`).
- **Contract** (`/contracts`): listar, buscar, ativar, terminar, gerar Revenue.
- **Revenue** (`/revenues`): listar, buscar (somente leitura — nasce exclusivamente de `POST /contracts/:id/generate-revenue`).
- **Party** (`/parties`): criar, listar, buscar por id, buscar por nome/termo.
- **Relationship** (`/relationships`): criar, listar (relação entre duas Party).
- **Case** (`/cases`): criar, listar, buscar, iniciar, fechar.
- **Comment** (`/comments`): criar, listar, editar, excluir.
- **Activity** (`/activities`): criar, listar, buscar, completar.
- **CalendarEvent** (`/calendar-events`): criar, listar, reagendar.
- **Reminder** (`/reminders`): criar, listar, dispensar.
- **Checklist** (`/checklists`): criar, listar, adicionar item, marcar/desmarcar item.

Todas as rotas exigem `JwtAuthGuard` + `PermissionGuard` com permissão granular por rota (ex.: `sales.leads.manage`, `sales.opportunities.manage`, `activity.cases.manage`, `relationship.relationships.manage` — `ADR-0036`/`ENG-0136`), e isolamento de tenant reforçado em código (`organizationId` do token, não apenas RLS — achado documentado em `OpportunityController`: o role do Prisma usado tem `rolbypassrls = true`, então RLS por si só não protegeria nada nesta API).

Telas correspondentes já existem em `apps/web/app/`: `leads`, `opportunities`, `pipelines`, `products`, `quotations`, `contracts`, `revenue`, `customer`, `cases`, `comments`, `activity`, `calendar-events`, `reminders`, `checklists` — mas como telas individuais por objeto, não como uma experiência de CRM unificada (funil visual, timeline de cliente consolidada etc.); ver Roadmap abaixo.

### Integrações

Nenhuma integração externa real conectada a este produto hoje. Verificado por ausência: nenhum arquivo em `services/domains/sales`, `services/domains/customer` ou `services/domains/activity` referencia `integration-hub`, `automation-runtime` ou `ai-runtime`.

- `services/kernel/integration-hub/` (WhatsApp/Meta/Bling/Google) existe como Infrastructure Capability estrutural do Kernel (`ADR-0040`), mas nenhuma credencial de terceiro está configurada e nada no CRM o invoca — o campo `source` de `Lead` é texto livre (ex.: poderia registrar `"whatsapp"` manualmente), não uma integração de fato.
- `services/kernel/automation-runtime/` (inspirado no Salesforce Flow, `ADR-0041`) funciona de ponta a ponta sobre o Event Bus, mas não tem nenhum gatilho configurado sobre eventos de Sales/Customer/Activity.
- `services/kernel/ai-runtime/` (inspirado no Salesforce Einstein Copilot, `ADR-0041`) tem Port implementado, mas nenhuma chamada real a modelo de IA acontece (`OPENAI_API_KEY`/`ANTHROPIC_API_KEY` vazias) — logo, não há "IA no CRM" hoje, apenas a infraestrutura que futuramente permitiria.

### KPIs

Nenhum KPI é medido ou implementado no código hoje — não existe dashboard, agregação ou endpoint de métrica sobre os domínios de CRM (`services/domains/analytics` é um domínio separado, Fase 8, e não referencia Sales/Customer/Activity). Os candidatos abaixo são **propostos, não implementados**, na mesma disciplina de honestidade do `MASTER_ROADMAP.md`:

- **Propostos, não implementados**: taxa de conversão de Lead (`leads convertidos / leads criados`), tempo médio em cada Stage do Pipeline, taxa de vitória de Opportunity (`won / (won + lost)`), valor total em `Quotation` `accepted` vs. `rejected`, tempo entre `Quotation` `accepted` e `Contract` `active`, SLA de resolução de `Case` (`open→closed`).

### Roadmap

O que falta para este produto ser considerado "completo", com base no que o `MASTER_ENGINEERING_ROADMAP.md` já registra como pendência real (sem inventar prazos, conforme a mesma disciplina de "Sem Datas" do roadmap mestre):

- Construir a experiência de CRM coesa que hoje não existe — as 14 telas de `apps/web/app/` são por objeto individual; falta uma visão de funil (Kanban de `Opportunity` por `Stage`), uma timeline consolidada por `Party` (Leads, Opportunities, Cases, Comments, Activities associados) e navegação cruzada entre objetos relacionados.
- Resolver a posição de produto do `Revenue` (CRM vs. `NOVARIS Financial`) — hoje é o único Aggregate do Sales Domain sem essa fronteira decidida.
- Conectar `integration-hub` a um canal real de captação de Lead (ex.: webhook do WhatsApp/Meta criando `Lead` automaticamente), hoje puramente hipotético.
- Conectar `automation-runtime` a eventos do CRM (ex.: notificação automática ao avançar Stage, ou ao fechar um Case), hoje sem nenhum gatilho configurado.
- Decidir e implementar KPIs reais (ver seção KPIs) — nenhum foi medido ainda; a lista acima é ponto de partida, não compromisso.
- Expor estes objetos como API pública versionada para desenvolvedores externos (Fase 10 do roadmap mestre), distinta da API interna atual consumida pelo `apps/web`.

---

## NOVARIS AI

### Objetivo

**TODO**: conteúdo a ser escrito.

### Escopo

**TODO**: conteúdo a ser escrito.

### Funcionalidades

**TODO**: conteúdo a ser escrito.

### Integrações

**TODO**: conteúdo a ser escrito.

### KPIs

**TODO**: conteúdo a ser escrito.

### Roadmap

**TODO**: conteúdo a ser escrito.

---

## NOVARIS Automation

### Objetivo

**TODO**: conteúdo a ser escrito.

### Escopo

**TODO**: conteúdo a ser escrito.

### Funcionalidades

**TODO**: conteúdo a ser escrito.

### Integrações

**TODO**: conteúdo a ser escrito.

### KPIs

**TODO**: conteúdo a ser escrito.

### Roadmap

**TODO**: conteúdo a ser escrito.

---

## NOVARIS Studio

### Objetivo

**TODO**: conteúdo a ser escrito.

### Escopo

**TODO**: conteúdo a ser escrito.

### Funcionalidades

**TODO**: conteúdo a ser escrito.

### Integrações

**TODO**: conteúdo a ser escrito.

### KPIs

**TODO**: conteúdo a ser escrito.

### Roadmap

**TODO**: conteúdo a ser escrito.

---

## NOVARIS Analytics

### Objetivo

**TODO**: conteúdo a ser escrito.

### Escopo

**TODO**: conteúdo a ser escrito.

### Funcionalidades

**TODO**: conteúdo a ser escrito.

### Integrações

**TODO**: conteúdo a ser escrito.

### KPIs

**TODO**: conteúdo a ser escrito.

### Roadmap

**TODO**: conteúdo a ser escrito.

---

## NOVARIS Projects

### Objetivo

**TODO**: conteúdo a ser escrito.

### Escopo

**TODO**: conteúdo a ser escrito.

### Funcionalidades

**TODO**: conteúdo a ser escrito.

### Integrações

**TODO**: conteúdo a ser escrito.

### KPIs

**TODO**: conteúdo a ser escrito.

### Roadmap

**TODO**: conteúdo a ser escrito.

---

## NOVARIS Marketplace

### Objetivo

**TODO**: conteúdo a ser escrito.

### Escopo

**TODO**: conteúdo a ser escrito.

### Funcionalidades

**TODO**: conteúdo a ser escrito.

### Integrações

**TODO**: conteúdo a ser escrito.

### KPIs

**TODO**: conteúdo a ser escrito.

### Roadmap

**TODO**: conteúdo a ser escrito.

---

## NOVARIS Financial

### Objetivo

**TODO**: conteúdo a ser escrito.

### Escopo

**TODO**: conteúdo a ser escrito.

### Funcionalidades

**TODO**: conteúdo a ser escrito.

### Integrações

**TODO**: conteúdo a ser escrito.

### KPIs

**TODO**: conteúdo a ser escrito.

### Roadmap

**TODO**: conteúdo a ser escrito.
