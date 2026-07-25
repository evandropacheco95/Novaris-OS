# Kernel — Boundary Enforcement Review

Versão: 1.0.0

Status: 🟢 Oficial — revisão arquitetural de fronteiras, nenhum código, nenhum contrato alterado

Missão: ENG-0007 (Kernel Boundary Enforcement Review)

Escopo: validar se o Kernel NOVARIS possui fronteiras corretas entre Domain Layer, Application Layer, Infrastructure Layer e Shared Kernel, auditando os 20 módulos reais de `services/kernel/` por inspeção direta (não presumida). Nenhum código, contrato existente, módulo novo ou ADR foi criado — nenhum conflito arquitetural encontrado exigiu ADR (justificativa em "Decisões Arquiteturais"). Nenhum documento existente foi alterado.

---

## 1. Inventário dos Módulos

20 pastas confirmadas em `services/kernel/` por inspeção direta (`find`), cada uma com seu `README.md § Objetivo`/`§ Dependências` lido diretamente, não presumido:

| Módulo | Objetivo declarado | Dependências declaradas | Código real (`src/`)? |
|---|---|---|---|
| `identity` | Identidade, autenticação, autorização | — | ✅ Sim |
| `organizations` | Gestão de organizações (tenants) | — | ✅ Sim |
| `audit` | Trilha de auditoria | — | ✅ Sim |
| `permissions` | Permissões granulares | — | ❌ Não (encerrado como domínio, `EPIC-004`) |
| `users` | (scaffolding original ARCH-001) | — | ❌ Não |
| `roles` | (scaffolding original ARCH-001) | — | ❌ Não |
| `event-bus` | Publicação/assinatura de eventos | Nenhuma (Fase A) | ❌ Não (encerrado como domínio, `EPIC-006`) |
| `logging` | Logs estruturados de toda a plataforma | Nenhuma | ❌ Não |
| `storage` | Alocação/controle de armazenamento por organização | Organizations | ❌ Não |
| `files` | Upload, armazenamento e recuperação de arquivos | Storage | ❌ Não |
| `notifications` | Envio de notificações a usuários | Identity | ❌ Não |
| `realtime` | Comunicação em tempo real (websockets/subscriptions) | Event Bus | ❌ Não |
| `search` | Indexação e busca sobre objetos da plataforma | Event Bus | ❌ Não |
| `monitoring` | Métricas, health checks, observabilidade | Logging, Event Bus | ❌ Não |
| `scheduler` | Agendamento de execuções futuras/recorrentes | Logging | ❌ Não |
| `integration-hub` | Ponto único de integração com sistemas externos | Configuration, Audit | ❌ Não |
| `ai-runtime` | Execução controlada de IA | Event Bus, Configuration, **Permissions** | ❌ Não |
| `automation-runtime` | Execução de workflows e automações | Event Bus, Scheduler, **Permissions** | ❌ Não |
| `configuration` | Configurações por organização | Organizations | ❌ Não |
| `feature-flags` | Controle de funcionalidades habilitadas por organização/plano | Organizations | ❌ Não |

## 2. Classificação Arquitetural

| Classificação | Módulos | Confiança |
|---|---|---|
| **Domain Capability** | `identity`, `organizations`, `audit` | Alta — confirmado por Discovery formal + Freeze + código real + Closure Review |
| **Infrastructure Capability** | `event-bus`, `logging`, `storage`, `integration-hub` | Alta — confirmado diretamente por `ENGINEERING_PLAYBOOK.md § 5` (`event-bus`="Messaging", `storage`="Storage", `integration-hub`="External APIs") ou por Discovery formal (`event-bus`, `EVENT_BUS_DISCOVERY.md`) |
| **Infrastructure Capability (inferência consistente, sem Discovery própria)** | `files`, `notifications`, `realtime`, `search`, `monitoring`, `scheduler`, `ai-runtime`, `automation-runtime` | Média — todos seguem o mesmo padrão estrutural de adapter/gateway técnico já confirmado para `event-bus`/`storage`/`integration-hub` (nenhum tem linguagem ubíqua própria, identidade de negócio, ou regra de negócio declarada em nenhuma fonte); nenhuma Discovery formal os investigou individualmente |
| **Não avaliado — candidato a Domain Capability** | `configuration`, `feature-flags` | **Baixa deliberada — ver § 3, risco de classificação prematura** |
| **Encerrado / Histórico (sem capacidade própria)** | `permissions` (`EPIC-004`, absorvido por Identity), `event-bus` como domínio (`EPIC-006`, reclassificado acima como Infrastructure) | Confirmado por Closure Review formal |
| **Scaffolding nunca formalmente encerrado — mesma natureza de `permissions` pré-`EPIC-004`** | `users`, `roles` | Alta — confirmado por inspeção (zero `src/`, absorvidos por `identity/src/domain/aggregates/{user,role}/`) |
| **Shared Utility** | Nenhum módulo de `services/kernel/` — a categoria é representada por `packages/shared-kernel/` (fora do escopo desta auditoria, que cobre só `services/kernel/`) | — |

**Por que `configuration`/`feature-flags` não foram classificados com confiança**: ambos declaram dependência exclusiva de `Organizations` (não de nenhum outro serviço técnico), e `objects/Organization.md § REGRAS DE NEGÓCIO` (RN007: "Feature Flags são definidas por Organization") já atribui um significado de negócio real a "feature flags" — o mesmo tipo de sinal que, para Permission, levou a uma investigação formal (que concluiu "já pertence a outro domínio"). Classificar `configuration`/`feature-flags` como Infrastructure sem uma Discovery própria repetiria o erro oposto ao que quase ocorreu com Permission: não reconhecer domínio genuíno, tratando-o como scaffolding técnico genérico. Não avaliados aqui — ver § 5.

## 3. Violações Encontradas

**Nenhuma violação estrutural grave foi encontrada** nos 3 critérios centrais desta revisão:

- **Infraestrutura dentro de Domain Layer**: não encontrada — `identity`/`organizations`/`audit` importam exclusivamente do Shared Kernel em seu Domain Layer (`AggregateRoot`, `Result`, `Repository` genérico), nunca de `infrastructure/`.
- **Domínio dependendo de infraestrutura**: não encontrada — nenhum dos 3 Aggregates reais (`User`/`Role`, `Organization`, `AuditEntry`) referencia qualquer módulo de Infrastructure.
- **Dependências circulares**: não encontrada — `Identity` não referencia `Organization` concretamente (só `organizationId`, por id); `Organization` não referencia `Identity` concretamente; `Audit` referencia ambos só por id, nunca por tipo concreto (`AUDIT_BOUNDED_CONTEXT.md § 9`).

**Inconsistências documentais reais, encontradas nesta revisão**:

1. **`ai-runtime/README.md` e `automation-runtime/README.md` ainda listam "Permissions" como dependência de módulo independente** — direto de `PERMISSION_EPIC_CLOSURE.md` (`EPIC-004`) nunca propagado a quem declarava depender do módulo. `Permission` não tem mais existência independente (é Value Object dentro de `Identity`) — a dependência real é de `Identity`, não de um módulo `permissions` separado.
2. **`event-bus/CONTRACT.md` descreve um `DomainEvent` divergente do real** (já registrado em `KERNEL_MATURITY_ASSESSMENT.md § 6`, `EVENT_BUS_EPIC_PLANNING.md § 7`) — reafirmado aqui como o exemplo mais concreto de "contrato divergente" dentro do próprio Kernel.
3. **Nenhum dos 10 Domain Events já implementados (9 Identity + `OrganizationCreated`) tem qualquer consumidor real** — "evento sem responsabilidade clara de consumo": o evento é corretamente disparado pelo Aggregate certo, mas nada no sistema o lê, porque não há Event Bus real (`EPIC-006` confirmou que o módulo é só Infrastructure, ainda não implementada).
4. **`services/kernel/README.md` não reflete a decisão de `EPIC-006`** — ainda lista `event-bus` na "Fase A — Fundação" ao lado de `logging`, sem distinguir Domain de Infrastructure (o que agora está formalmente resolvido para `event-bus`, `EVENT_BUS_EPIC_CLOSURE.md`).
5. **`users`/`roles` nunca receberam um Epic Closure formal** — mesma sobreposição com `Identity` que `Permission` tinha antes de `EPIC-004`, mas sem o documento equivalente a `PERMISSION_EPIC_CLOSURE.md`.

> **Nota de Resolução (`ENG-0139`, `ADR-0037`)**: itens 2, 3 e 5 resolvidos. (2) `event-bus/CONTRACT.md § Entradas/Saídas` corrigido — `DomainEvent` real documentado (`eventId`/`aggregateId`/`occurredAt`/`eventName`), texto divergente ("tipo, origem, payload, timestamp") removido. (3) `event-bus`/`logging` implementados (`@novaris/event-bus`, `@novaris/logging`); `CreateUserHandler` agora publica `UserCreated` — primeiro dos 10 Domain Events a ganhar consumidor real (os outros 9 permanecem sem consumidor, retrofit adiado). (5) `users/README.md`/`roles/README.md` fechados formalmente, por analogia direta a `PERMISSION_EPIC_CLOSURE.md`. Item 4 também endereçado como efeito colateral — `services/kernel/README.md` atualizado para refletir código real, não só classificação. Item 1 (`ai-runtime`/`automation-runtime` citando "Permissions" como dependência própria) permanece aberto — fora do escopo desta missão.

**Divergências de camada já conhecidas, reafirmadas sem investigação nova**: `Analytics Core` (Kernel, `SYSTEM_ARCHITECTURE.md § 4`) vs. `Analytics` (Business Domain, `services/domains/analytics/`); `SDK` (Kernel, mesma fonte) vs. `packages/sdk/` — ambas já registradas em `KERNEL_MATURITY_ASSESSMENT.md § 4`, não reabertas aqui.

## 4. Revisão Documental

| Documento | Reflete a decisão de `EPIC-006`? |
|---|---|
| `ENGINEERING_PLAYBOOK.md § 5` | ✅ Já refletia, antes mesmo do `EPIC-006` existir — classificava "Messaging" como Infrastructure Layer desde antes desta investigação |
| `KERNEL_DOMAIN_LIFECYCLE_V2.md` | ⚠️ Não menciona Event Bus especificamente; mantém a lacuna estrutural já registrada em `EVENT_BUS_DISCOVERY.md § 9` (nenhum caminho formal para capacidades de infraestrutura pura sem Domain Layer) |
| `PROJECT_RULES.md` | Nenhuma inconsistência nova encontrada sobre este tópico específico |
| `services/kernel/README.md` | ❌ Não reflete — ainda trata `event-bus` como um dos "20 módulos" sem distinguir Domain de Infrastructure (item 4 de § 3) |

## 5. Decisões Arquiteturais

- **Nenhum código, contrato existente ou módulo novo foi criado** — restrição respeitada integralmente.
- **Nenhuma ADR foi criada.** Avaliado explicitamente se algum achado constitui "conflito arquitetural real" que exigisse uma: nenhum dos itens de § 3 é uma contradição *nova* e *bloqueante* — todos são scaffolding desatualizado ou lacunas já conhecidas (Analytics Core/SDK, já registradas há duas missões; `users`/`roles`, mesma natureza de `permissions` pré-fechamento; `ai-runtime`/`automation-runtime`, referência textual desatualizada). Nenhum bloqueia trabalho em andamento nem contradiz uma decisão já congelada — todos são mais bem resolvidos por uma missão de correção/fechamento dedicada (mesmo padrão já usado para `Permission`), não por uma ADR de emergência aqui.
- **`configuration`/`feature-flags` permanecem deliberadamente não classificados com confiança** — decisão desta revisão é registrar a incerteza, não resolvê-la (resolver exigiria uma Discovery formal, fora do escopo desta auditoria de fronteiras).

## 6. Pendências Futuras

Sem criar backlog técnico novo, apenas consolidando o que esta revisão encontrou:

- Abrir um Epic Closure formal para `users`/`roles`, mesmo padrão de `PERMISSION_EPIC_CLOSURE.md`.
- Corrigir as referências a "Permissions" em `ai-runtime/README.md` e `automation-runtime/README.md` (apontar para `Identity`).
- Avaliar formalmente `configuration`/`feature-flags` via Discovery própria — risco real de conterem regra de negócio genuína de `Organization` (RN007) hoje tratada como scaffolding técnico genérico.
- Considerar uma emenda a `KERNEL_DOMAIN_LIFECYCLE_V2.md` cobrindo o caminho de capacidades de infraestrutura pura (já identificado em `EVENT_BUS_DISCOVERY.md § 9`, reafirmado aqui).
- Atualizar `services/kernel/README.md` para refletir a distinção Domain/Infrastructure já confirmada para `event-bus` (e, futuramente, para os demais módulos de Infrastructure já classificados por esta revisão).
- Corrigir `event-bus/CONTRACT.md` para refletir o `DomainEvent` real — ainda não feito, mesma restrição de todas as missões do `EPIC-006`.

---

## Validações

- **Link Checker** (`-Root` explícito): ver ENG-0007 FINAL REPORT.
- **ARG (`ARCHITECTURE_REVIEW_GATE_STANDARD.md`, ENS-0002)**: ver tabela abaixo.
- **Domain Model Validation**: nenhuma Entity/Aggregate/Value Object/regra de negócio foi criada ou alterada por esta missão — apenas classificação e inventário do que já existe.

## ARG (formato oficial, ENS-0002)

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (`KERNEL_MATURITY_ASSESSMENT.md`) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido integralmente respeitado (nenhum código/contrato/módulo/ADR criado) | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **A classificação de `files`/`notifications`/`realtime`/`search`/`monitoring`/`scheduler`/`ai-runtime`/`automation-runtime` como Infrastructure foi apresentada com o nível de confiança real, ou como fato confirmado?** Apresentada como inferência consistente, explicitamente rotulada "sem Discovery própria" — não confundida com a confirmação formal de `event-bus`/`storage`/`integration-hub`.
2. **`configuration`/`feature-flags` foram forçados a uma classificação para completar a tabela?** Não — deixados explicitamente como "não avaliado", com a razão específica (RN007) que impede uma classificação confiável sem inventar conclusão.
3. **A ausência de ADR foi uma omissão ou uma decisão justificada?** Justificada em § 5 — cada achado foi testado contra o critério "conflito real e bloqueante", nenhum qualificou.
4. **As referências stale a "Permissions" foram corrigidas nesta missão?** Não — apenas encontradas e registradas (§ 3, § 6); nenhum `README.md` de outro módulo foi alterado, respeitando a restrição de escopo.

---

## ENG-0007 FINAL REPORT

**1. Arquivos criados**: `services/kernel/KERNEL_BOUNDARY_REVIEW.md`.

**2. Arquivos alterados**: nenhum.

**3. Classificação final do Kernel**: 3 Domain Capabilities (`identity`, `organizations`, `audit`); 12 Infrastructure Capabilities (4 confirmadas por fonte direta — `event-bus`, `logging`, `storage`, `integration-hub` — e 8 por inferência consistente sem Discovery própria); 2 não avaliados (`configuration`, `feature-flags`, candidatos a Domain Capability); 3 scaffolding sem capacidade própria (`permissions`, encerrado; `users`/`roles`, nunca formalmente encerrados).

**4. Violações encontradas**: zero violações estruturais graves (nenhuma infraestrutura dentro de Domain Layer, nenhum domínio dependendo de infraestrutura, nenhuma dependência circular). 5 inconsistências documentais reais encontradas (referências stale a "Permissions" em 2 módulos; `event-bus/CONTRACT.md` divergente; ausência de consumidor para todo Domain Event já implementado; `services/kernel/README.md` desatualizado frente a `EPIC-006`; `users`/`roles` sem Epic Closure).

**5. Decisões arquiteturais**: nenhuma ADR criada — todo achado é scaffolding desatualizado ou lacuna já conhecida, nenhum conflito novo e bloqueante. `configuration`/`feature-flags` deliberadamente deixados sem classificação confiável.

**6. Impacto nos próximos domínios**: qualquer futuro Epic de domínio (Business Domains) deve, antes de assumir a natureza Domain/Infrastructure de um módulo de Kernel já existente, verificar se ele já foi objeto de uma Discovery formal — `configuration`/`feature-flags` são candidatos concretos a investigação antes de qualquer Business Domain assumir que "feature flags" é puramente técnico.

**7. Status da missão**: concluída. Interrompendo a execução.

---

Aguardando aprovação formal do CTO.
