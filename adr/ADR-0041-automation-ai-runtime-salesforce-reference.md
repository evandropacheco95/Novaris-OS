# ADR-0041 — Automation Runtime (Salesforce Flow) e AI Runtime (Salesforce Einstein): Referência de Estrutura

## Problema

`ADR-0039 § Fora de Escopo` deixou `ai-runtime` e `automation-runtime` sem implementação por faltar especificação de negócio ("qual capacidade de IA", "quais workflows"). O CTO deu uma diretriz permanente para resolver esse tipo de lacuna: **quando não houver estrutura própria ainda definida, usar a estrutura do Salesforce como referência**. Esta ADR aplica esse critério aos 2 módulos e decide o que é seguro construir agora.

## Contexto

- **Verificação prévia** (mesma disciplina de `ADR-0040`): nenhuma credencial de IA existe (`apps/api/.env` só tem `JWT_SECRET`; `OPENAI_API_KEY`/`ANTHROPIC_API_KEY` seguem vazias em `.env.example`) — `ai-runtime` tem exatamente o mesmo problema que bloqueou `integration-hub`.
- **`automation-runtime` não tem esse problema**: o Salesforce Flow (gatilho → condição → ação) mapeia diretamente sobre infraestrutura que já existe e funciona — o Event Bus (`ADR-0037`). "Quais workflows" deixa de ser uma pergunta de especificação de negócio e passa a ser uma pergunta de **mecanismo genérico**: um motor de regras configurável em runtime (via API), não workflows hardcoded por esta engenharia.
- **Limitação real, não inventada**: `DomainEvent` (`ADR-0037`) tem payload mínimo (`eventId`/`aggregateId`/`occurredAt`/`eventName`, sem dado de negócio). Um "Condition" real do Salesforce Flow avalia campos do registro — sem payload de negócio no evento, não há o que avaliar. Por isso, esta versão de `automation-runtime` **não implementa condições** — toda regra dispara incondicionalmente ao evento gatilho. Registrado como limitação estrutural conhecida, não como corte arbitrário de escopo.
- **Salesforce Einstein** (referência para `ai-runtime`): a operação mais representativa e transversal é "responder/gerar texto a partir de um prompt com contexto controlado" (Einstein Copilot) — não uma feature específica (score preditivo, insight de oportunidade etc.), que exigiria dado de negócio e modelo próprio.

## Decision Drivers

- Mesmo critério já usado em toda a sessão: nunca declarar algo "pronto" sem verificação real. `automation-runtime` pode ser verificado ao vivo (webhook real recebido por um listener local) sem nenhuma credencial externa — construído por completo. `ai-runtime` não pode (sem chave de IA real) — estrutural, mesmo padrão de `integration-hub`.
- Reaproveitar infraestrutura já construída (`EventBus`, `Logger`, `Notifier`) em vez de inventar um motor de regras novo do zero — `automation-runtime` é, na prática, a primeira composição real de 3 peças de Kernel já provadas isoladamente.
- Ação `webhook` (chamada HTTP de saída para uma URL fornecida pelo próprio usuário ao criar a regra) não exige nenhuma credencial de terceiro — o "servidor externo" é escolhido por quem cria a regra, mesma filosofia do Zapier/Make/n8n já citados em `NOVARIS_OS.md § 7`.

## Alternativas

| Módulo | Opção Escolhida | Rejeitada |
|---|---|---|
| `automation-runtime` | Motor de regras real: `AutomationRule` (Aggregate, persistido) + `InProcessAutomationRuntime` (assina o Event Bus por regra) + 3 tipos de Action (`log`/`notify`/`webhook`) | Hardcodear "workflows" específicos de negócio (ex.: "quando Invoice atrasar, notificar") — inventaria regra de negócio sem fonte; motor genérico configurável via API evita isso |
| `automation-runtime` (condições) | Nenhuma condição nesta versão | Inventar campos de condição sobre um payload de evento que não existe — mesmo critério que rejeitou inventar campo em `Party`/`Dashboard` sem evidência |
| `ai-runtime` | Port `AIRuntime.ask(prompt, context?)` + `ConsoleAIRuntime` (estrutural, mesmo padrão de `integration-hub`) | Adapter HTTP real contra OpenAI/Anthropic nunca testado — mesmo risco já rejeitado em `ADR-0040` |

## Decision

**`automation-runtime` — implementação real completa:**
- `AutomationRule` (Aggregate Root): `organizationId`, `name`, `triggerEventName` (nome de um evento já publicado no Event Bus, ex. `"UserCreated"`), `actions: AutomationAction[]`, `enabled: boolean`.
- `AutomationAction` (union): `{ type: "log", message }` | `{ type: "notify", recipientUserId, message }` | `{ type: "webhook", url }`.
- `AutomationRuntime` (Domain Service/Port) + `InProcessAutomationRuntime` (Infrastructure): `register(rule)` assina o Event Bus no `triggerEventName` da regra; ao disparar, executa cada `action` (log via `@novaris/logging`, notify via `@novaris/notifications`, webhook via `fetch` real — POST do evento como JSON). Falha de uma action (ex.: webhook indisponível) é isolada e logada, nunca derruba as demais nem o publisher — mesmo critério de resiliência de `ADR-0037`/`ADR-0035`.
- `AutomationRuleRegistry`: mantém `ruleId → Subscription` em memória; `activate(rule)` (des)registra conforme `enabled`, permitindo criar/ativar/desativar regras em runtime, sem reiniciar o processo — diferente do Event Bus puro, que exige reinscrição manual a cada boot.
- Sem persistência de subscrição: um restart do processo exige recarregar as regras do Postgres e reativar cada uma (`apps/api` faz isso no bootstrap) — mesma limitação já aceita para `InProcessEventBus`/`InProcessScheduler`.

**`ai-runtime` — estrutural, mesmo padrão de `integration-hub`:**
- `AIRuntime.ask(prompt: string, context?: Record<string, unknown>): Promise<AIResponse>` + `ConsoleAIRuntime` (loga o prompt, devolve uma resposta fixa com `loggedOnly: true`) — nenhuma chamada real a OpenAI/Anthropic.

## Rejected Alternatives

Ver tabela acima.

## Consequences

- `automation-runtime` ganha 1 tabela Postgres (`automation_rules`), API real (`POST`/`GET /automation-rules`, `POST /automation-rules/:id/toggle`), Permission própria.
- `ai-runtime` ganha API real (`POST /ai/ask`) que nunca gera uma resposta de IA de verdade — toda resposta inclui `loggedOnly: true`, mesmo critério de transparência de `ADR-0040`.
- Diretriz do CTO ("pensar em Salesforce para o que não tiver estrutura") registrada como princípio permanente de design, não só para estes 2 módulos — aplicável a decisões futuras sobre a camada de Produto (`PRODUCTS.md`), ainda não exploradas por esta ADR.
- `automation-runtime` depende agora de `Event Bus`, `Logging`, `Notifications` — correção em relação à dependência originalmente declarada (`Event Bus, Scheduler, Identity`); `Scheduler`/`Identity` não são exercidas nesta versão.

## Responsável

CTO / Arquiteto Chefe — diretriz direta ("pense sempre em uma estrutura de um Salesforce.com, para completarmos nosso sistema"), aplicada por decisão de arquitetura (Claude Code / Principal Engineer) aos 2 módulos de Kernel já identificados como bloqueados.

## Data

2026-07-24

## Impactos

- `services/kernel/automation-runtime/src/**` (novo código real).
- `services/kernel/ai-runtime/src/**` (novo código estrutural).
- `packages/database/prisma/schema.prisma` — model `AutomationRule` + migration.
- `apps/api/src/automation-runtime/**`, `apps/api/src/ai-runtime/**` (novos Controllers/Modules).
- `apps/api/src/main.ts` — carrega e ativa `AutomationRule`s existentes no boot.
- `apps/api/src/seed.ts` — 2 novos códigos de Permission.
- `services/kernel/README.md`, `NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md` — reclassificação (fecha os 20/20 módulos de Kernel).
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum dado existente é migrado — tabela nova, vazia.

## Status

Aceito
