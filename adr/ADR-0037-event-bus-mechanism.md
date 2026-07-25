# ADR-0037 — Event Bus: Mecanismo In-Process e Escopo da Primeira Integração Real

## Problema

`services/kernel/event-bus/CONTRACT.md` já congela a interface pública (`publish`/`subscribe`/`unsubscribe`) desde a Missão ARCH-001, mas nunca foi implementado — mesma situação de `logging/` e outros 12 módulos de Kernel (`services/kernel/README.md`). Dois mandatos já oficiais dependem de um Event Bus real e nunca puderam ser cumpridos: `NOVARIS_CONSTITUTION.md Article XI` ("toda alteração relevante em qualquer módulo deve gerar um evento aqui — nenhum módulo consome eventos de outro por acesso direto a banco") e `ENGINEERING_PLAYBOOK.md § 3` ("Event Driven — mudanças relevantes de estado publicam eventos; serviços reagem a eventos, não fazem chamada síncrona onde um evento resolve"). Na prática, todo `Aggregate` já emite `DomainEvent`s reais (`UserCreated`, `OrganizationCreated`, `ActivityCompleted` etc., via `AggregateRoot.addDomainEvent()`) — confirmado por grep: o único consumidor desses eventos hoje são os próprios testes unitários (`aggregate.domainEvents`), nunca um Handler de Application real. Todo evento emitido por um Aggregate é hoje descartado sem uso. Esta ADR decide o mecanismo concreto e autoriza a primeira integração real, mesmo padrão de processo já usado por `ADR-0035` (Audit).

## Contexto

- `IMPLEMENTATION_ROADMAP.md § 3` ("Ordem Obrigatória de Implementação") documenta Kernel Fase A (Logging, Event Bus) como a **primeira** fase, com zero dependências — mas os 10 Business Domains inteiros foram implementados antes dela (fato já registrado em `MASTER_ENGINEERING_ROADMAP.md`, nota de 2026-07-24, para o desvio equivalente de Fase 2/3). Esta ADR não desfaz esse desvio (os domínios já implementados continuam válidos), apenas volta à Fase A, agora, para fechar a lacuna de fundação.
- `ADR-0035` (Audit) já enfrentou esta mesma decisão e escolheu Dependency Injection direta **precisamente porque** Event Bus não existia — e deixou explicitamente registrado: "quando o Event Bus existir, [a opção C] pode substituir a chamada direta sem mudar a Opção A de 'quem enriquece'" (`ADR-0035 § Alternativas`). Esta ADR não migra Audit — isso continua uma decisão futura em aberto, agora possível, ainda não tomada.
- `IMPLEMENTATION_ROADMAP.md § 7` ("Estratégia de Paralelização") já declara `logging/` e `event-bus/` como não-dependentes entre si ("paralelizáveis") — qualquer implementação real de Event Bus que crie uma dependência de pacote (`package.json`) sobre `@novaris/logging` contradiria essa declaração já oficial.
- `packages/contracts/README.md` já exige, como regra própria: "eventos já nomeados oficialmente... devem ter contrato correspondente aqui antes de qualquer implementação real" — nenhum contrato de evento foi escrito ainda (`packages/contracts/events/` vazio desde ENG-0000.1).
- Plataforma hoje é um único processo Node (`apps/api`, NestJS monolito) — não há múltiplos serviços/deploys separados que justifiquem um broker de mensageria externo.

## Decision Drivers

- `ENGINEERING_PLAYBOOK.md § 9`: "toda Port é uma interface TypeScript, nunca uma classe abstrata" — `EventBus` deve ser interface, mesmo padrão já usado por `Repository`/`PasswordVerifier`.
- Nenhuma infraestrutura de mensageria externa (Redis, RabbitMQ, Kafka) está decidida em nenhum ADR/documento — adotar uma agora seria inventar tecnologia sem justificativa de escala real (mesmo critério que already rejeitou opções equivalentes em `ADR-0035`).
- `event-bus/CONTRACT.md § Erros` deixou em aberto "comportamento em caso de handler que lança exceção" — esta ADR precisa decidir isso para poder implementar.
- Falha de um Subscriber não pode derrubar o publisher nem os demais Subscribers — mesmo princípio de isolamento já usado em `ADR-0035` para Audit (falha secundária não reverte operação primária).

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. In-process, síncrono, `Map<eventType, Set<handler>>`** | Publish chama cada Subscriber diretamente, na mesma thread/processo; sem persistência, sem rede | Escolhida — não inventa infraestrutura nova; suficiente para um monolito único; falha de um handler é isolada com `try/catch` por handler |
| B. Broker externo (Redis Pub/Sub, RabbitMQ, Kafka) | Mensageria real, cross-processo | Rejeitada por ora — não há múltiplos serviços/processos hoje que precisem consumir eventos entre si; adotar um broker seria inventar necessidade de escala inexistente, mesmo critério que já rejeitou opção equivalente em `ADR-0035` |
| C. Outbox persistido (eventos gravados em tabela antes de publicados) | Garante entrega mesmo após crash, permite replay | Rejeitada — duplicaria a responsabilidade do Audit Domain (trilha persistida já existe, `ENG-0135`) sem um caso de uso concreto que peça replay de evento; fora do que `event-bus/CONTRACT.md` pede |
| D. Retrofit imediato de todos os Handlers existentes para publicar seus eventos | Aproveitar a implementação nova para já conectar os 29 Handlers já implementados | Rejeitada nesta ADR — mudança mecânica de alto raio de impacto sobre código já testado e em produção; mesmo critério que `ADR-0035` já usou para limitar Audit a **1** integração real por vez, não todos os domínios simultaneamente |

## Decision

**Opção A — In-process, síncrono, sem dependência de `@novaris/logging`.**

- **Mecanismo**: `EventBus` (Port, `interface` TypeScript, `services/kernel/event-bus/src/domain/ports/event-bus.ts`) com a assinatura já congelada em `CONTRACT.md` (`publish(event)`, `subscribe(eventType, handler)`, `unsubscribe(subscription)`). Implementação real (`InProcessEventBus`, Infrastructure) mantém um `Map<string, Set<EventHandler>>` por `eventName`; `publish` itera os handlers registrados para aquele `eventName` e chama cada um de forma síncrona.
- **Tratamento de erro** (resolve `CONTRACT.md § Erros`, antes `TODO`): cada chamada de handler é isolada em `try/catch` — uma exceção de um Subscriber não interrompe os demais Subscribers nem propaga para quem chamou `publish()`. Como `event-bus`/`logging` são explicitamente não-dependentes entre si (`IMPLEMENTATION_ROADMAP.md § 7`), o fallback de diagnóstico em caso de exceção usa `console.error` direto (mesma exceção já aceita em `apps/api/src/main.ts` para o log de bootstrap, antes de um Logger real existir) — não importa `@novaris/logging`. Qualquer chamador que queira observabilidade estruturada real regista seu **próprio** Subscriber logging-aware (é exatamente o que a integração de prova abaixo faz), sem que isso vire uma dependência do pacote `event-bus` em si.
- **Escopo desta ADR**: prova o mecanismo ponta a ponta com **1 evento real**: `User.create()` já emite `UserCreated` (existente desde a Missão ENG-0002/EPIC-002, nunca consumido) — `CreateUserHandler` (Identity) passa a receber `EventBus` injetado (mesmo padrão de Dependency Injection já usado para `Repository`/`CreateAuditEntryHandler`) e publica cada `domainEvent` do `User` recém-criado, depois de `save()` ter sucesso, seguido de `user.clearEvents()`. Um Subscriber de prova (registrado em `apps/api/src/main.ts`, não dentro do pacote `event-bus`) consome `"UserCreated"` e loga via `@novaris/logging` (implementado na mesma missão, `ENG-0139`) — primeira prova real de que Logging e Event Bus, apesar de não dependerem um do outro como pacotes, colaboram na composition root (`apps/api`).
- **Contrato de evento**: `packages/contracts/events/user-created.md` — primeiro arquivo real desta pasta (antes vazia), documentando nome/payload/versão/origem de `UserCreated`, cumprindo a regra já existente em `packages/contracts/README.md`.
- **Não retrofita os demais 28 Handlers** já implementados nos outros domínios — cada um continua funcionando exatamente como antes desta ADR. Retrofit futuro (se decidido) é uma Ordem de Missão própria, domínio por domínio, mesmo ritmo que `ADR-0035` usou para estender Audit.
- **Não migra Audit**: `UpdateOrganizationProfileHandler` continua usando Dependency Injection direta para `CreateAuditEntryHandler` (`ADR-0035`), inalterado por esta ADR. Migrar esse mecanismo para consumir eventos em vez de DI direta é uma decisão futura em aberto, não tomada aqui.

## Rejected Alternatives

Ver Opções B, C e D acima.

## Consequences

- Dois novos pacotes reais: `@novaris/logging` (`services/kernel/logging/`) e `@novaris/event-bus` (`services/kernel/event-bus/`) — primeira implementação de código de Kernel Fase A.
- `@novaris/identity` ganha dependência de `@novaris/event-bus` no `package.json`.
- `CreateUserHandler` ganha uma segunda dependência de construtor (`EventBus`), quebrando sua assinatura atual — toda instanciação (produção via `IdentityModule`, testes) precisa ser atualizada.
- `apps/api/src/main.ts` ganha um Logger real (substituindo o `console.log` de bootstrap) e registra o primeiro Subscriber real da plataforma.
- `packages/contracts/events/` deixa de estar vazio — ganha seu primeiro contrato real (`user-created.md`).
- `event-bus/CONTRACT.md § Erros` e `§ Status` atualizados (de `TODO`/`🚧` para decisão real registrada e `🟢`); `logging/README.md`/`event-bus/README.md` idem.
- Nenhuma arquitetura de mensageria externa é adotada — se uma necessidade real de cross-processo surgir no futuro, a Opção B volta à mesa sem invalidar o Port já definido (mesma lógica de "porta estável, adapter substituível" já usada em toda esta engenharia).
- `roles/README.md`/`users/README.md` (Kernel) fechados formalmente nesta mesma missão, por analogia a `permissions/PERMISSION_EPIC_CLOSURE.md` — achado paralelo, não uma consequência direta desta ADR, mas registrado no mesmo Emenda/Mission Registry.

## Responsável

CTO / Arquiteto Chefe, ordem direta ("vamos seguir com a construção do NOVARIS OS. Continue com toda a construção") — sem múltipla escolha apresentada desta vez; escopo derivado de evidência já documentada e nunca executada (`IMPLEMENTATION_ROADMAP.md § 3`, Kernel Fase A), não de uma preferência de produto inventada.

## Data

2026-07-24

## Impactos

- `services/kernel/event-bus/src/**`, `services/kernel/logging/src/**` (novo código).
- `services/kernel/identity/src/application/handlers/create-user/create-user.handler.ts`, `.../package.json`, `.../src/index.ts`.
- `apps/api/src/identity/identity.module.ts`, `apps/api/src/main.ts`, novo `apps/api/src/logging/nest-logger.adapter.ts`.
- `packages/contracts/events/user-created.md` (novo).
- `services/kernel/event-bus/README.md`, `CONTRACT.md`; `services/kernel/logging/README.md`.
- `services/kernel/roles/README.md`, `services/kernel/users/README.md` (fechamento formal, achado paralelo).
- `NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md` (Fase 2, contagem e nota de desvio de ordem).
- `adr/README.md` — nova entrada no índice.

## Plano de Migração

Nenhum dado existente é migrado — `EventBus`/`Logger` não têm estado persistido; mecanismo inteiramente em memória, escopado a um único processo Node. Nenhuma tabela nova, nenhuma migration.

## Status

Aceito
