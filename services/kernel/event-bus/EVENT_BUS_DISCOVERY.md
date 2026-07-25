# Event Bus — Discovery

Versão: 1.0.0

Status: 🟢 Oficial — natureza arquitetural determinada, nenhuma implementação criada

Missão: ENG-0006.1 (Event Bus Discovery) — EPIC-006

Escopo: determinar, com evidência rastreável e sem inventar nenhuma decisão de domínio, se o Event Bus é um domínio próprio do Kernel ou uma capacidade de infraestrutura. Nenhum código, Publisher, Subscriber, ADR ou Infrastructure foi criado. `DomainEvent` e `event-bus/CONTRACT.md` não foram alterados.

---

## 1. Existe Linguagem Ubíqua Própria?

**Não.** O vocabulário já usado em `event-bus/CONTRACT.md` (`publish`, `subscribe`, `unsubscribe`, `Subscription`, `EventHandler`) é inteiramente terminologia genérica do padrão arquitetural Publish-Subscribe — a mesma que se usaria em qualquer sistema de mensageria, independentemente do domínio de negócio. Diferente da linguagem ubíqua de Audit (`Actor`, `Target`, `ChangeSet`, `Origin` — conceitos sobre **o que aconteceu**), o vocabulário do Event Bus é inteiramente sobre **como uma mensagem se move**, sem nenhum termo específico ao negócio da NOVARIS.

## 2. Existe Entity?

**Não.** O único candidato é `Subscription` (devolvida por `subscribe()`, `event-bus/CONTRACT.md`) — tem uma forma de identidade técnica (precisa ser referenciável para `unsubscribe()`), mas é um *handle* de registro técnico, sem significado de negócio, análogo a um identificador de conexão ou de timer — não uma Entity de domínio com significado para a Ubiquitous Language da plataforma.

## 3. Existe Aggregate?

**Não.** Aplicando os mesmos 3 critérios já usados para confirmar `Organization` e `AuditEntry` como Aggregates, e para descartar `Permission`: identidade própria com significado de negócio (não existe, § 2); ciclo de vida de negócio (não existe, § 5); necessidade de ser referenciado por id por outro Aggregate (nenhuma fonte sugere isso). Nenhum candidato identificado.

## 4. Existe Value Object?

**Não.** Nenhum termo imutável definido por valor e específico ao domínio de negócio foi encontrado. O nome de um tipo de evento (`eventName`, já parte do `DomainEvent` real) não é um conceito novo do Event Bus — é reutilizado do Shared Kernel.

## 5. Existe Ciclo de Vida Próprio?

**Não, no sentido de domínio.** Existe um ciclo técnico de registro (`subscribe()` → ativo → `unsubscribe()`), mas é o mesmo tipo de ciclo de vida de qualquer registro de callback em um sistema de mensageria — nunca um ciclo de vida de negócio como o de `Organization.status` (`Freeze §§ 7-8`) ou mesmo a criação única de `AuditEntry`.

## 6. Existe Regra de Negócio?

**Não.** `event-bus/CONTRACT.md § Erros` já registra, desde `ARCH-001`: "🚧 TODO — comportamento em caso de handler que lança exceção, event-bus indisponível, etc. ainda não definido" — todas as questões em aberto são políticas técnicas de entrega (retry, backpressure, dead-letter), não regras de negócio. Nenhuma fonte (`CONSTITUTION.md`, `BOM.md`, `objects/`) atribui uma regra de negócio ao Event Bus.

## 7. Existe Necessidade de Repository?

**Não — nem candidato a Aggregate existe (§ 3), portanto um Repository é estruturalmente impossível**, mesma restrição de tipo já usada para descartar `Permission` (`Repository<T extends AggregateRoot<unknown>>`) — aqui ainda mais categórica, porque não há sequer um candidato a avaliar.

## 8. Event Bus Pertence ao Domain ou Infrastructure?

# Infrastructure

**Evidência decisiva, independente da análise acima**: `knowledge/engineering/ENGINEERING_PLAYBOOK.md § 5` ("Infrastructure Layer") já classifica isso oficialmente, desde antes deste Epic existir: *"Messaging | Publicação/consumo de eventos via `services/kernel/event-bus/`"* — listado literalmente na tabela de Infrastructure Layer, ao lado de `Persistence`, `Providers`, `Storage`. Esta classificação já era oficial; nenhuma das 6 missões anteriores do EPIC-006/005 a havia cruzado com o scaffolding original de `ARCH-001` (que tratava `event-bus` como um dos 20 "módulos" ao lado de `identity`/`organizations`, sem distinguir Domain de Infrastructure).

**Mesma classe de achado já vista em `PERMISSION_DOMAIN_DISCOVERY.md`**: o scaffolding original de `ARCH-001` presumia que todos os 20 módulos seriam "domínios" no mesmo sentido; uma fonte posterior e mais rigorosa (`ENGINEERING_PLAYBOOK.md`, para Event Bus; `IDENTITY_TECHNICAL_BLUEPRINT.md`, para Permission) já havia corrigido isso, sem que ninguém tivesse formalizado a consequência.

## 9. Impacto nos Domínios Existentes

- **Identity/Organization/Audit**: nenhum impacto em sua Domain Layer — continuam disparando `DomainEvent` via `addDomainEvent()` exatamente como já implementado; nenhuma mudança necessária.
- **A pasta `services/kernel/event-bus/`**: candidata a reclassificação estrutural (não executada aqui) — se Event Bus é Infrastructure, a pasta deveria eventualmente refletir isso (ex.: um Adapter compartilhado, não um "domínio" de Kernel ao lado de `identity`/`organizations`/`audit`). Mesma natureza da pendência já registrada para `services/kernel/users/`/`roles/` (`KERNEL_MATURITY_ASSESSMENT.md § 5`).
- **Decisão de acoplamento do Audit** (`AUDIT_DOMAIN_DECISIONS.md § 5`): permanece válida e intocada — a Application Layer do domínio de origem continua responsável pelo enriquecimento; Event Bus, agora entendido como infraestrutura de transporte, não muda essa resposta, apenas confirma que o transporte em si nunca teria autoridade para enriquecer (reforça, não contradiz).
- **Lacuna de payload do `DomainEvent`** (`EVENT_BUS_EPIC_PLANNING.md § 7`): permanece real e não resolvida, independentemente da conclusão desta Discovery — é uma limitação do próprio Shared Kernel, não do Event Bus especificamente.
- **`KERNEL_DOMAIN_LIFECYCLE_V2.md`**: esta Discovery expõe uma lacuna do próprio Lifecycle — ele foi desenhado para domínios com Aggregate (Fases 1-5, `§ 3`), mas não prevê um caminho formal para capacidades de infraestrutura pura sem Domain Layer. Não corrigido aqui (fora do escopo desta missão alterar o Standard) — registrado como possível emenda futura.

## 10. Recomendação Final

**Event Bus não deve prosseguir pelas fases de modelagem de domínio** (`ENG-0006.2` em diante, Model/Aggregate Design/Freeze/Blueprint) — não há Aggregate a desenhar. Recomenda-se um encerramento antecipado do EPIC-006 **como domínio**, análogo ao de `PERMISSION_EPIC_CLOSURE.md`, redirecionando o esforço real para uma **missão de Infrastructure pura** (Publisher/Subscriber/Adapter concreto) — fora do escopo de `KERNEL_DOMAIN_LIFECYCLE_V2.md`, que rege ciclos de domínio, não capacidades de infraestrutura. Esta recomendação não é executada por esta missão (nenhum encerramento, nenhuma correção de `CONTRACT.md`, nenhuma reclassificação de pasta) — fica para a próxima missão do Epic decidir formalmente.

---

## Validações

- **Link Checker** (`-Root` explícito): ver Relatório Final.
- **Rastreabilidade**: toda resposta cita `event-bus/CONTRACT.md`, `ENGINEERING_PLAYBOOK.md § 5`, `AGGREGATE_IMPLEMENTATION_STANDARD.md`, `DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md`, ou um documento já produzido nesta cadeia.
- **ARG (ENS-0002)**: ver tabela abaixo.

## DMV

1. Alguma Entity foi criada? Não. 2. Algum Aggregate foi criado? Não — nenhum candidato foi sequer identificado. 3. Algum Value Object foi criado? Não. 4. Alguma regra nova foi criada? Não. 5. Alguma decisão de Audit/Identity/Organization foi modificada? Não — `AUDIT_DOMAIN_DECISIONS.md § 5` foi reforçado, não alterado. 6. Há necessidade de ADR? Não para esta missão — nenhuma decisão de arquitetura foi mudada, apenas uma classificação já oficial (`ENGINEERING_PLAYBOOK.md § 5`) foi confirmada.

## ACR

| Categoria | Conformidade |
|---|---|
| Nenhum código/Publisher/Subscriber/Infrastructure/ADR criado | ✅ |
| `DomainEvent`/`event-bus/CONTRACT.md` não alterados | ✅ |
| Conclusão fundamentada em evidência já oficial (`ENGINEERING_PLAYBOOK.md`), não em preferência | ✅ |
| Comparação estrutural com Permission/Organization sem inventar critério novo | ✅ — mesmos 3 critérios de Aggregate aplicados |
| Nenhum documento existente alterado | ✅ |

## ARG (formato oficial, ENS-0002)

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (`PERMISSION_DOMAIN_DISCOVERY.md`) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido integralmente respeitado | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **A conclusão "Infrastructure" foi alcançada por evidência ou por conveniência (evitar modelagem)?** Por evidência — `ENGINEERING_PLAYBOOK.md § 5` já classificava isso oficialmente antes desta missão existir; a análise dos 6 critérios de domínio (§§ 1-7) chegou à mesma conclusão de forma independente.
2. **A recomendação de encerramento antecipado (§ 10) foi executada, violando a restrição da ordem?** Não — nenhum encerramento, nenhuma correção, nenhuma reclassificação foi feita; é uma recomendação para a próxima missão decidir.
3. **A lacuna de `KERNEL_DOMAIN_LIFECYCLE_V2.md` (não cobrir infraestrutura pura) foi corrigida, mesmo que parcialmente?** Não — apenas registrada como achado, sem alterar o Standard.
4. **Este documento seria suficiente para o CTO decidir o encerramento do EPIC-006 como domínio?** Sim — § 8 já responde a pergunta central com evidência decisiva; § 10 já aponta o caminho alternativo (Infrastructure pura) sem decidir por conta própria.

## Relatório Final

**Arquivo criado**: `services/kernel/event-bus/EVENT_BUS_DISCOVERY.md`.

**Validações**: Link Checker (ver abaixo), rastreabilidade, ARG (ENS-0002) — PASS, 4/4 aplicáveis.

**Conclusão**: Event Bus é **Infrastructure**, não um domínio do Kernel — confirmado por evidência já oficial (`ENGINEERING_PLAYBOOK.md § 5`) e por análise independente dos 6 critérios de domínio, todos negativos. Recomendação: encerrar o EPIC-006 como Epic de domínio, redirecionando para uma missão de Infrastructure pura.

---

Interrompendo a execução. Aguardando aprovação formal do CTO.
