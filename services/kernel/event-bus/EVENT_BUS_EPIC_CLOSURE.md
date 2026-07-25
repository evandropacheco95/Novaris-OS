# Event Bus — EPIC Closure (as Domain)

Versão: 1.0.0

Status: 🔴 CLOSED AS DOMAIN — encerramento administrativo, nenhuma nova decisão arquitetural

Missão: ENG-0006.2 (Event Bus EPIC Closure) — encerra o EPIC-006 como ciclo de modelagem de domínio

Escopo: formalizar o encerramento do EPIC-006 como Epic de domínio, com base exclusivamente na conclusão já alcançada em `EVENT_BUS_DISCOVERY.md` (ENG-0006.1). Nenhuma decisão arquitetural nova, nenhum código, Infrastructure ou ADR foi criado. `event-bus/CONTRACT.md` e `DomainEvent` não foram alterados. Nenhum outro documento existente foi tocado.

---

## 1. Motivo do Encerramento

O EPIC-006 foi aberto (`ENG-0006.0`) para planejar o Event Bus seguindo `KERNEL_DOMAIN_LIFECYCLE_V2.md`, com uma dúvida arquitetural fundamental já registrada desde o planejamento (`EVENT_BUS_EPIC_PLANNING.md § 2`): Event Bus tem algum conceito de domínio genuíno, ou é inteiramente uma capacidade técnica de infraestrutura? A missão de Discovery (`ENG-0006.1`) respondeu essa pergunta com evidência — aplicando os mesmos 6 critérios de domínio já usados para confirmar `Organization`/`AuditEntry` e para descartar `Permission`, todos negativos, e cruzando com uma classificação já oficial e anterior a este Epic (`ENGINEERING_PLAYBOOK.md § 5`). Este documento encerra o Epic administrativamente com base nessa conclusão, sem adicionar nenhum argumento novo.

## 2. Decisão Final

```
EPIC-006
STATUS: CLOSED AS DOMAIN
Reason: Event Bus is an Infrastructure Capability, not a Domain.
```

`Event Bus` **não** prossegue pelas fases de modelagem de domínio de `KERNEL_DOMAIN_LIFECYCLE_V2.md § 3` (Model, Aggregate Design, Decisions, Freeze, Blueprint) — não há Aggregate, Entity, Value Object ou regra de negócio a modelar (`EVENT_BUS_DISCOVERY.md §§ 1-7`).

## 3. Por Que Event Bus Não É Domain

Reafirmação, sem novo argumento, de `EVENT_BUS_DISCOVERY.md §§ 1-7`:

- **Linguagem ubíqua**: inexistente — `publish`/`subscribe`/`unsubscribe`/`Subscription`/`EventHandler` são termos genéricos do padrão Publish-Subscribe, os mesmos que se usariam em qualquer sistema de mensageria, independentemente do negócio da NOVARIS.
- **Entity**: inexistente — `Subscription` é um handle técnico de registro, sem significado de negócio.
- **Aggregate**: inexistente — falha nos 3 critérios já usados para `Organization`/`AuditEntry` (identidade de negócio, ciclo de vida de negócio, referência por id de outro Aggregate).
- **Value Object**: inexistente — nenhum conceito imutável específico ao negócio foi encontrado.
- **Ciclo de vida próprio**: apenas técnico (registrar/remover um handler), nunca um ciclo de vida de negócio.
- **Regra de negócio**: inexistente — as únicas questões em aberto (`event-bus/CONTRACT.md § Erros`, "comportamento em caso de handler que lança exceção, event-bus indisponível") são políticas técnicas de entrega, não regras de negócio.
- **Repository**: estruturalmente impossível na ausência de qualquer Aggregate candidato (mesma restrição de tipo `Repository<T extends AggregateRoot<unknown>>` já usada para descartar `Permission`).

## 4. Classificação como Infrastructure Capability

Confirmada por fonte já oficial e anterior a este Epic: `knowledge/engineering/ENGINEERING_PLAYBOOK.md § 5` ("Infrastructure Layer") já lista *"Messaging | Publicação/consumo de eventos via `services/kernel/event-bus/`"* — a mesma tabela que classifica `Persistence`, `Providers` e `Storage`. O scaffolding original de `ARCH-001`, que tratava `event-bus` como um dos 20 "módulos" ao lado de `identity`/`organizations`/`audit` sem distinguir Domain de Infrastructure, nunca havia sido cruzado com essa classificação já vigente — mesma classe de achado já registrada para `Permission` (`PERMISSION_DOMAIN_DISCOVERY.md § 9`).

## 5. Impacto no Audit Domain

**Nenhuma mudança à decisão já tomada.** `AUDIT_DOMAIN_DECISIONS.md § 5` já havia decidido que a Application Layer do domínio de origem é conceitualmente responsável pelo enriquecimento de um `DomainEvent` bruto em um `AuditEntry` completo — essa decisão permanece válida e intocada. Entender o Event Bus como infraestrutura de transporte apenas **reforça** essa decisão (o transporte nunca teria autoridade de negócio para enriquecer), não a contradiz. A ADR já recomendada e ainda não criada (`AUDIT_DOMAIN_DECISIONS.md § 5`; `AUDIT_FINAL_ARCHITECTURE_REVIEW.md § 5`, item 11) continua sendo necessária, independentemente desta decisão sobre a natureza do Event Bus.

## 6. Impacto nos Domínios Identity e Organization

**Nenhum.** Ambos continuam disparando `DomainEvent` via `addDomainEvent()` exatamente como já implementado (`ENG-0002.7`/`.8`, `ENG-0003.7`) — nenhuma mudança de código, Aggregate, ou Domain Event é necessária ou proposta por este encerramento.

## 7. Pendências Futuras

Registradas, sem criar backlog técnico novo:

- **Reclassificação estrutural de `services/kernel/event-bus/`** — se Event Bus é Infrastructure, a pasta poderia eventualmente refletir isso (ex.: como um Adapter compartilhado, não um "domínio" ao lado de `identity`/`organizations`/`audit`). Não decidida nem executada aqui — mesma natureza da pendência já existente para `services/kernel/users/`/`roles/` (`KERNEL_MATURITY_ASSESSMENT.md § 5`).
- **Ausência total de payload em `DomainEvent`** (`EVENT_BUS_EPIC_PLANNING.md § 7`) — permanece real, não resolvida por este encerramento; afeta qualquer futura implementação de Infrastructure de Event Bus e a integração real com Audit.
- **`event-bus/CONTRACT.md` desatualizado** (nomes de campo divergentes do `DomainEvent` real) — não corrigido, por restrição explícita desta e da missão anterior.
- **Lacuna do próprio `KERNEL_DOMAIN_LIFECYCLE_V2.md`** — não prevê um caminho formal para capacidades de infraestrutura pura sem Domain Layer (`EVENT_BUS_DISCOVERY.md § 9`) — registrada como possível emenda futura ao Standard, não executada aqui.
- **Uma futura missão real de Infrastructure** (Publisher/Subscriber/Adapter concreto) — necessária para o Event Bus realmente existir, fora do escopo de `KERNEL_DOMAIN_LIFECYCLE_V2.md`, que rege ciclos de domínio.

## 8. Riscos de Implementação Futura

| Risco | Classificação |
|---|---|
| Implementar Infrastructure de Event Bus sem resolver a ausência de payload em `DomainEvent` — qualquer consumidor (incluindo Audit) não receberia dado de negócio algum | **Alto** |
| `event-bus/CONTRACT.md` desatualizado ser seguido por engano em vez do `DomainEvent` real, se não for revisitado antes de qualquer código real | **Alto** |
| Pasta `services/kernel/event-bus/` nunca reclassificada, perpetuando a mesma ambiguidade Domain/Infrastructure já vista em `users`/`roles`/`permissions` | **Médio** |
| Nenhuma decisão de garantias de entrega (at-least-once, exactly-once) — risco de escolha inadequada se feita ad-hoc, sem uma missão técnica própria | **Médio** |
| Nenhuma tecnologia de mensageria escolhida — `ADR-0005` não cobre especificamente esse aspecto da stack | **Baixo** |

---

## Validações

- **Link Checker** (`-Root` explícito): ver Relatório Final.
- **Rastreabilidade**: toda seção cita `EVENT_BUS_EPIC_PLANNING.md`, `EVENT_BUS_DISCOVERY.md`, `ENGINEERING_PLAYBOOK.md`, `KERNEL_MATURITY_ASSESSMENT.md` ou `AUDIT_DOMAIN_DECISIONS.md` — nenhuma afirmação nova sem fonte.

## DMV

1. Alguma Entity foi criada? Não. 2. Algum Aggregate foi criado? Não. 3. Algum Value Object foi criado? Não. 4. Alguma regra nova foi criada? Não. 5. Alguma decisão de Audit/Identity/Organization foi modificada? Não — `AUDIT_DOMAIN_DECISIONS.md § 5` reafirmado, não alterado. 6. Há necessidade de ADR? Não para este encerramento — nenhuma decisão de arquitetura nova foi tomada, apenas confirmada uma classificação já oficial.

## ACR

| Categoria | Conformidade |
|---|---|
| Nenhum código/Infrastructure/ADR criado | ✅ |
| `CONTRACT.md`/`DomainEvent` não alterados | ✅ |
| Nenhum argumento técnico novo além do já concluído em `ENG-0006.1` | ✅ |
| Impacto em Audit/Identity/Organization avaliado sem propor mudança a nenhum deles | ✅ |
| Nenhum documento existente alterado | ✅ |

## ARG (formato oficial, ENS-0002)

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (`PERMISSION_EPIC_CLOSURE.md`) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido integralmente respeitado (nenhuma alteração a `CONTRACT.md`/`DomainEvent`, nenhuma Infrastructure/ADR criada) | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **Este documento introduziu algum argumento técnico que `ENG-0006.1` não tinha?** Não — toda a § 3 é consolidação literal do que já estava em `EVENT_BUS_DISCOVERY.md §§ 1-7`.
2. **`event-bus/CONTRACT.md` ou `DomainEvent` foram tocados além do autorizado?** Não — apenas o arquivo novo foi escrito.
3. **O encerramento é administrativo de fato, ou disfarça uma nova decisão de arquitetura?** Administrativo — a decisão técnica em si (Event Bus = Infrastructure) já havia sido tomada em `ENG-0006.1`; este documento só a formaliza e analisa impacto.
4. **Este documento seria suficiente, sozinho, para um leitor futuro entender por que o EPIC-006 fechou como domínio sem implementação?** Sim — §§ 1-4 e a decisão formal em § 2 respondem isso de forma autocontida.

## Relatório Final

**Arquivo criado**: `services/kernel/event-bus/EVENT_BUS_EPIC_CLOSURE.md`.

**Validações**: Link Checker (ver abaixo), DMV, ACR, ARG (ENS-0002) — PASS, 4/4 aplicáveis.

**Conclusão**: EPIC-006 formalmente encerrado como Epic de domínio. `Event Bus` permanece classificado como Infrastructure Capability; uma futura missão de Infrastructure pura (fora de `KERNEL_DOMAIN_LIFECYCLE_V2.md`) seria necessária para implementá-lo de fato.

---

Interrompendo a execução. Aguardando aprovação formal do CTO.
