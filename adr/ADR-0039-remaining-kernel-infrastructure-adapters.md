# ADR-0039 — Fases D/E/F/G do Kernel: Adapters Mínimos Reais, Fornecedor/Complexidade Adiados

## Problema

Depois de `ADR-0037` (Event Bus, Fase A) e `ADR-0038` (Configuration/Feature Flag, Fase C), restavam 8 módulos de Kernel sem implementação: `storage`/`files` (Fase D), `notifications`/`realtime` (Fase E), `ai-runtime`/`automation-runtime`/`scheduler` (Fase F), `search`/`monitoring`/`integration-hub` (Fase G). Esta ADR decide o mecanismo de **6** deles (`scheduler`, `monitoring`, `notifications`, `search`, `files`, `realtime`) — os 3 restantes (`ai-runtime`, `automation-runtime`, `integration-hub`) **não** são decididos aqui, ver `§ Fora de Escopo`.

## Contexto

- Cada um dos 6 módulos tem uma dependência real de **fornecedor externo, biblioteca ou decisão de produto** que nenhuma fonte já resolveu: `notifications` (qual canal — email/SMS/push, qual provedor), `storage`/`files` (nuvem vs. disco, e `storage` especificamente precisa de uma regra de cota/plano que não existe em `Subscription`, `ADR-0031`), `search` (motor de busca, quais entidades são pesquisáveis), `monitoring` (stack de observabilidade — Prometheus etc.), `realtime` (`socket.io` vs. `ws` puro).
- Mesmo critério já usado em `ADR-0037` (Event Bus: broker externo rejeitado, in-process aceito) e em `ConsoleLogger`/`ADR-0037` (biblioteca de logging adiada): **implementar o Port + um adapter mínimo real, sem inventar a decisão de fornecedor/produto que nenhuma fonte tomou**.
- `IMPLEMENTATION_ROADMAP.md § 8` já registra "requer decisão" para ferramenta de observabilidade e testes — esta ADR não antecipa essa decisão, só implementa o que é seguro sem ela (health check de conectividade).

## Decision Drivers

- Adotar um fornecedor externo real (SendGrid, Twilio, AWS S3, Elasticsearch, Prometheus) sem confirmação do CTO seria uma decisão de custo/conta irreversível — fora do que esta engenharia autoriza sem confirmação explícita.
- Um Port bem definido, com **1 adapter mínimo real** (não um mock, não um stub vazio), prova o mecanismo e não bloqueia nenhum consumidor futuro quando o fornecedor real for escolhido — mesmo padrão já validado por `ConsoleLogger` (real, não mock) e `InProcessEventBus` (real, não simulado).
- Onde existe uma dependência cruzada de negócio ainda não resolvida (`storage`'s cota, `Subscription` sem campo de limite), a disciplina desta engenharia (`ADR-0031`) já rejeitou inventar um número — a mesma disciplina se aplica aqui: não implementar `storage`, implementar só `files` (que não depende de cota para funcionar).

## Alternativas

| Módulo | Opção Escolhida | Rejeitada |
|---|---|---|
| `scheduler` | `InProcessScheduler` (`setTimeout`/`setInterval`, sem persistência) | Fila persistida (BullMQ/Redis) — infraestrutura nova sem caso de uso real hoje |
| `monitoring` | `DatabaseHealthCheck` (`SELECT 1` real via Prisma) | Stack completa (Prometheus/Grafana) — fornecedor não escolhido; métricas de negócio — nenhuma definida |
| `notifications` | `ConsoleNotifier` (loga, não envia) | Provedor real (Resend, SES, Twilio) — conta/custo não autorizados sem confirmação |
| `search` | `PostgresPartySearch` (`ILIKE` direto, só `Party`) | Motor dedicado (Elasticsearch/Algolia) — infraestrutura nova sem volume que justifique; indexação de outras entidades — decisão de produto (quais campos são pesquisáveis) |
| `files` | `LocalFileStorage` (disco local) | Bucket de nuvem (Supabase Storage/S3) — credenciais/bucket não confirmados como já configurados neste ambiente |
| `storage` | **Não implementado** | Qualquer versão exigiria uma regra de cota que não existe |
| `realtime` | `RealtimeGateway` (`@nestjs/platform-ws`, broadcast global) | `socket.io` com rooms — biblioteca mais pesada sem necessidade de filtragem server-side comprovada |

## Decision

Para cada um dos 6 módulos: **Port framework-agnóstico (interface TypeScript) + exatamente 1 Infrastructure adapter real, mínimo, sem simulação** — nunca um mock/stub que apenas retorna sucesso sem fazer nada de verdade. Cada adapter é substituível por uma implementação de fornecedor real no futuro, sem mudar o Port nem quem o consome (Ports & Adapters, `ENGINEERING_PLAYBOOK.md § 3`).

`storage` permanece sem implementação — decisão explícita, não uma lacuna esquecida (`storage/README.md` atualizado para deixar isso claro).

## Fora de Escopo

`ai-runtime`, `automation-runtime`, `integration-hub` — os 3 exigem saber **qual** capacidade de IA, **quais** workflows de automação, **quais** sistemas externos (WhatsApp, Meta, Bling, etc., `NOVARIS_OS.md § 7`) antes de qualquer código fazer sentido. Isso não é uma decisão de mecanismo de infraestrutura (o que esta ADR resolve) — é a mesma classe de lacuna já documentada para `PRODUCTS.md` (100% `TODO`): implementar qualquer um dos 3 sem essa definição seria fabricar requisito de negócio. Permanecem como estrutura (`README.md`), sem código.

## Rejected Alternatives

Ver coluna "Rejeitada" da tabela acima.

## Consequences

- 6 novos pacotes reais: `@novaris/scheduler`, `@novaris/monitoring`, `@novaris/notifications`, `@novaris/search`, `@novaris/files`, `@novaris/realtime`.
- 3 novas tabelas Postgres (`configuration_entries`, `feature_flags` via `ADR-0038`; `file_records` via esta ADR).
- `apps/api` ganha 2 novas dependências externas (`@nestjs/websockets`, `@nestjs/platform-ws`, `ws`) — nenhuma exige conta/credencial de terceiro, só bibliotecas open-source já oficialmente suportadas pelo NestJS.
- Nenhum canal de notificação real, nenhum bucket de nuvem, nenhum motor de busca dedicado, nenhuma stack de observabilidade — todos ficam como decisão futura explícita, não escondida.
- `services/kernel/README.md § Classificação Arquitetural` — os 6 módulos passam de "sem implementação"/"inferência consistente" para "Infrastructure Capability com código real".

## Responsável

Decisão de arquitetura direta (Claude Code / Principal Engineer), sob ordem do CTO ("Faça todas as outras que faltam", continuação de `ENG-0139`/`ADR-0037`/`ADR-0038`) — mesma ressalva de `ADR-0038`: sem confirmação explícita módulo-a-módulo, mitigado por nunca comprometer fornecedor/custo real, sempre a opção mais reversível.

## Data

2026-07-24

## Impactos

- `services/kernel/{scheduler,monitoring,notifications,search,files,realtime}/src/**` (novo código).
- `packages/database/prisma/schema.prisma` — model `FileRecord` + migration.
- `apps/api/src/{monitoring,configuration,feature-flags,files,realtime}/**` (novos Controllers/Modules/Gateway).
- `apps/api/src/main.ts` — 2 novos subscribers de Event Bus (notifications, realtime), `WsAdapter`.
- `apps/api/src/seed.ts` — 3 novos códigos de Permission (`system.configuration.manage`, `system.feature-flags.manage`, `system.files.manage`).
- `services/kernel/storage/README.md` — nota de escopo explícita (não implementado, por quê).
- `services/kernel/README.md`, `NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md` — reclassificação/atualização de status.
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum dado existente é migrado — toda tabela nova nasce vazia; mecanismos in-memory (`scheduler`, `event-bus`) não têm estado persistido.

## Status

Aceito
