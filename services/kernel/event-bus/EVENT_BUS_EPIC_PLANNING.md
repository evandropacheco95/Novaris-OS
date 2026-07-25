# Event Bus Domain — EPIC Planning

Versão: 1.0.0

Status: 🟡 EPIC-006 INITIALIZED — planejamento oficial, nenhuma decisão de implementação

Missão: ENG-0006.0 (Event Bus Domain Planning) — abre EPIC-006

Escopo: planejar o EPIC-006 seguindo [KERNEL_DOMAIN_LIFECYCLE_V2.md](../../../knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md) (Fase 1). Nenhum código, Publisher, Subscriber, Queue, Infrastructure ou ADR foi criado. `event-bus/CONTRACT.md` **não foi corrigido** — a inconsistência já identificada em `KERNEL_MATURITY_ASSESSMENT.md § 6` é analisada (§ 7), nunca reparada. Nenhum documento existente foi alterado.

---

## 1. Propósito do Event Bus

Transportar Domain Events entre domínios sem acoplamento direto — já citado em `event-bus/CONTRACT.md`: "Toda alteração relevante em qualquer módulo deve gerar um evento aqui... nenhum módulo consome eventos de outro por acesso direto a banco." Reforçado por `CONSTITUTION.md Artigo 18` (Observabilidade), que exige "Eventos" entre os artefatos que todo módulo deve gerar.

## 2. Papel Dentro do Kernel

**Pergunta em aberto, não decidida aqui**: diferente de Identity/Organization/Audit — cada um com um conceito de negócio real (`User`, `Organization`, `AuditEntry`) — o Event Bus pode ser **puramente um mecanismo técnico de transporte**, sem nenhum conceito de domínio próprio a modelar. Isso é estruturalmente diferente do caso de `Permission` (que tinha um conceito real, só mal-alocado) — aqui a pergunta é mais radical: existe *algum* Aggregate genuíno no Event Bus, ou ele é 100% Infrastructure Layer, sem Domain Layer alguma? Esta é a primeira pergunta que `ENG-0006.1` (Discovery) precisa responder, análoga à que `PERMISSION_DOMAIN_DISCOVERY.md` resolveu para Permission, mas com um desfecho possivelmente diferente: "sem domínio" em vez de "domínio errado".

## 3. Relação com Domain Events Existentes

`DomainEvent` (Shared Kernel, `packages/shared-kernel/src/core/domain-events/domain-event.ts`, ENG-0001.5) já existe, implementado e em uso por `User`/`Role` (9 eventos, Identity) e `Organization` (`OrganizationCreated`) — todos já disparados via `addDomainEvent()`, mas **nenhum jamais publicado**, porque nenhum Event Bus real existe (`KERNEL_MATURITY_ASSESSMENT.md § 8`). O Event Bus, se e quando implementado, seria o primeiro consumidor real dessa coleção de eventos já acumulada.

## 4. Relação com Audit

Conexão direta e crítica: a decisão pendente mais bloqueante do EPIC-005 (`AUDIT_DOMAIN_DECISIONS.md §§ 5, 7`; `AUDIT_FINAL_ARCHITECTURE_REVIEW.md § 5`, item 3) é exatamente o mecanismo de acoplamento com o Event Bus — sem ele, nenhuma integração real entre Audit e os domínios de origem pode existir. `AUDIT_FINAL_ARCHITECTURE_REVIEW.md § 10` já recomendava este Epic como consequência direta dessa lacuna. Ambos os domínios (Audit e Event Bus) compartilham, sem coordenação formal até agora, a mesma pergunta em aberto: **quem enriquece um `DomainEvent` bruto antes dele chegar a um consumidor?** `AUDIT_DOMAIN_DECISIONS.md § 5` já decidiu que é a Application Layer do domínio de origem — este Epic não deveria reabrir essa decisão sem uma ADR, mas precisa formalizar *onde*, tecnicamente, essa responsabilidade se encaixa no fluxo de publicação.

## 5. Relação com Identity e Organization

Ambos são **produtores** de `DomainEvent`, nunca consumidores nem dependências do Event Bus. Nenhuma mudança é proposta aos dois domínios já congelados — o Event Bus consome o que eles já publicam (ou, hoje, o que eles já disparam sem publicar), nunca o contrário.

## 6. Fronteiras do Domínio

**Pertence** (candidato, a confirmar em Discovery): mecanismo de publicação/assinatura; transporte de `DomainEvent` já existente; garantias de entrega (ainda não definidas).

**Não pertence**: interpretação de negócio do conteúdo de um evento (responsabilidade de cada consumidor, incluindo Audit); persistência de dados de negócio; a lógica de enriquecimento em si (já atribuída à Application Layer de cada domínio de origem, `AUDIT_DOMAIN_DECISIONS.md § 5`) — o Event Bus transporta, não enriquece.

## 7. Contrato Atual Versus Contrato Real

**A inconsistência já identificada, analisada aqui, não corrigida**: `event-bus/CONTRACT.md § Entradas/Saídas` descreve `DomainEvent` com os campos "tipo, origem, payload, timestamp" — o `DomainEvent` real (ENG-0001.5) tem `eventId`, `aggregateId`, `occurredAt`, `eventName`. Nenhum dos dois conjuntos de campos coincide.

**Achado adicional desta análise, não presente em `KERNEL_MATURITY_ASSESSMENT.md § 6`**: o `DomainEvent` real **não tem nenhum campo de payload** — nem os 4 campos da interface, nem (pelas assinaturas já registradas em `ORGANIZATION_TECHNICAL_BLUEPRINT.md § 6`, ex.: `OrganizationCreated`) nenhuma classe concreta implementada até agora carrega dado de negócio além de `eventId`/`aggregateId`/`occurredAt`/`eventName`. Isto significa que **hoje, um consumidor de `DomainEvent` não recebe nenhum dado sobre o que mudou** — só sabe que algo aconteceu, com qual Aggregate, e quando. Isso é mais preciso do que a lacuna já registrada para o Audit Domain (`AUDIT_DOMAIN_DECISIONS.md §§ 3-5`): não é só que faltam `actorId`/`organizationId`/`changeSet` — falta **qualquer payload**, mesmo os dados que o próprio domínio de origem já tem prontos no momento da mutação. `event-bus/CONTRACT.md`, apesar de desatualizado no nome dos campos, ao menos previa um campo `payload` — o `DomainEvent` real não tem nem isso.

## 8. Riscos Arquiteturais

| Risco | Classificação |
|---|---|
| `DomainEvent` real sem nenhum campo de payload — qualquer consumidor (Event Bus, Audit) não recebe dado de negócio algum, só metadado | **Alto** |
| `event-bus/CONTRACT.md` desatualizado pode levar uma implementação real a seguir a documentação errada em vez do código real do Shared Kernel | **Alto** |
| Tratar Event Bus como "Domain" quando pode ser 100% Infrastructure — risco de fabricar um Aggregate desnecessário (mesmo cuidado já usado para não fabricar Domain Services sem necessidade, `DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md § 3`) | **Médio** |
| Event Bus e Audit resolverem a mesma pergunta de enriquecimento de forma não coordenada, produzindo decisões conflitantes | **Médio** |
| Garantias de entrega (at-least-once, exactly-once) nunca definidas | **Baixo** — decisão de Infrastructure, não deste planejamento |

## 9. Possíveis Decisões Futuras

- Se o Event Bus tem algum Aggregate genuíno, ou é inteiramente Infrastructure sem Domain Layer.
- Se `DomainEvent` (Shared Kernel) precisa evoluir para carregar payload — se confirmada, é uma mudança a um contrato já implementado e usado por 2 domínios, exigindo ADR (`KERNEL_DOMAIN_LIFECYCLE_V2.md § 2`, "ADR Before Divergence").
- Mecanismo técnico de garantia de entrega.
- Como (e quem) formaliza a correção de `event-bus/CONTRACT.md` — não decidido nem executado por este Epic; provavelmente exige uma missão própria, possivelmente com ADR, dado que o documento é histórico de `ARCH-001`.
- Como a decisão de enriquecimento do Audit (`AUDIT_DOMAIN_DECISIONS.md § 5`) se integra tecnicamente ao fluxo de publicação do Event Bus.

## 10. Sequência Proposta do Epic

Segue `KERNEL_DOMAIN_LIFECYCLE_V2.md § 3` (Fase 1), com um caminho de encerramento antecipado explicitamente previsto — mesma estrutura de `PERMISSION_EPIC_PLANNING.md § 8`, adaptada:

```
ENG-0006.1 — Event Bus Domain Discovery
  Responder, como primeiro entregável: existe um Aggregate genuíno no Event
  Bus, ou é inteiramente Infrastructure sem Domain Layer? Se a conclusão for
  "sem domínio" — o Epic pode encerrar já aqui, com um Domain Closure Review
  equivalente ao de Permission, redirecionando o esforço para uma missão de
  Infrastructure pura (Publisher/Subscriber/Queue), sem as fases seguintes.
    ↓
ENG-0006.2 — Event Bus Domain Model (somente se Discovery confirmar domínio)
    ↓
ENG-0006.3 — Aggregate Design (rascunho)
    ↓
ENG-0006.4 — Domain Decisions (+ ADR, se a evolução de `DomainEvent` for
  confirmada como necessária, ou se o mecanismo de acoplamento com Audit
  exigir)
    ↓
ENG-0006.5 — Aggregate Design Freeze
    ↓
ENG-0006.6 — Technical Blueprint
    ↓
  [GATE: Architecture Approval — CTO]
    ↓
(demais fases de KERNEL_DOMAIN_LIFECYCLE_V2.md §§ 3-4, condicionadas à
confirmação de domínio em ENG-0006.1)
```

---

## Validações

- **Link Checker** (`-Root` explícito): ver Relatório Final.
- **Rastreabilidade**: toda seção cita `KERNEL_MATURITY_ASSESSMENT.md`, `AUDIT_DOMAIN_DECISIONS.md`, `AUDIT_FINAL_ARCHITECTURE_REVIEW.md`, `event-bus/CONTRACT.md` ou o `DomainEvent` real.
- **ARG (`ARCHITECTURE_REVIEW_GATE_STANDARD.md`, ENS-0002)**: ver tabela abaixo.

## DMV

1. Alguma Entity foi criada? Não. 2. Algum Aggregate foi criado? Não. 3. Algum Value Object foi criado? Não. 4. Alguma regra nova foi criada? Não. 5. Alguma decisão de outro domínio foi modificada? Não — `AUDIT_DOMAIN_DECISIONS.md § 5` foi citado, não alterado. 6. Há necessidade de ADR? Não para esta missão; possíveis ADRs futuras (evolução de `DomainEvent`, mecanismo de acoplamento) registradas em § 9, não criadas.

## ACR

| Categoria | Conformidade |
|---|---|
| Nenhum código/Publisher/Subscriber/Queue/Infrastructure/ADR criado | ✅ |
| `event-bus/CONTRACT.md` analisado, não corrigido | ✅ |
| `DomainEvent` real analisado, não alterado | ✅ |
| Achado adicional (ausência total de payload) rastreável ao código real | ✅ |
| Nenhum documento existente alterado | ✅ |

## ARG (formato oficial, ENS-0002)

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (`AUDIT_EPIC_PLANNING.md`, `PERMISSION_EPIC_PLANNING.md`) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido integralmente respeitado (nenhuma correção a `CONTRACT.md`, nenhuma alteração a `DomainEvent`) | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **A inconsistência de `event-bus/CONTRACT.md` foi corrigida, mesmo que parcialmente?** Não — apenas analisada e comparada ao `DomainEvent` real (§ 7); nenhuma linha do `CONTRACT.md` foi tocada.
2. **O achado sobre ausência total de payload é genuíno, ou uma reafirmação do que `KERNEL_MATURITY_ASSESSMENT.md` já dizia?** Genuíno e mais específico — aquele documento registrou a divergência de *nomes* de campo; esta missão identificou que nem mesmo um payload genérico existe em nenhuma implementação real, uma lacuna mais profunda.
3. **A pergunta central (§ 2, existe Aggregate?) foi decidida por conveniência?** Não — permanece explicitamente aberta, com paralelo justificado ao precedente de Permission, sem presumir a resposta.
4. **A conexão com Audit (§ 4) foi apresentada com rigor ou apenas mencionada?** Com rigor — cita a seção exata de `AUDIT_DOMAIN_DECISIONS.md` e `AUDIT_FINAL_ARCHITECTURE_REVIEW.md` que dependem desta pergunta, sem reabrir a decisão já tomada sobre quem enriquece.

## Relatório Final

**Arquivo criado**: `services/kernel/event-bus/EVENT_BUS_EPIC_PLANNING.md`.

**Validações**: Link Checker (ver abaixo), rastreabilidade, ARG (ENS-0002) — PASS, 4/4 aplicáveis.

**Conclusão**: `EPIC-006 INITIALIZED`. Pergunta central registrada (existe Aggregate genuíno no Event Bus?); achado novo sobre ausência de payload em `DomainEvent`; plano de Discovery com caminho de encerramento antecipado explicitamente previsto.

---

Interrompendo a execução. Aguardando aprovação formal do CTO.
