# Audit Domain — EPIC Planning

Versão: 1.0.0

Status: 🟡 EPIC-005 INITIALIZED — planejamento oficial, nenhuma arquitetura detalhada, nenhum código

Missão: `EPIC-005.0` ("Audit Domain Planning"), conforme recebida na ordem de missão — nota de nomenclatura: as missões anteriores de abertura de Epic usaram o prefixo `ENG-000X.0` (ex.: `ENG-0004.0`); esta ordem usa `EPIC-005.0`. Registrado como fato, não corrigido; o plano em § 8 usa `ENG-0005.X` para as próximas missões, consistente com a taxonomia já vigente (`NEF/PLANNING_MODEL.md`).

Escopo: planejar integralmente o EPIC-005 (Audit Domain) como domínio transversal da plataforma, seguindo [KERNEL_DOMAIN_LIFECYCLE_V2.md](../../../knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md) (Fase 1). Nenhum Aggregate, Repository, Mapper, teste, Infrastructure, banco, fila, tecnologia ou ADR foi criado. Nenhum documento existente foi alterado.

---

## 1. Objetivo do Audit Domain

Definir como toda a plataforma NOVARIS produzirá **rastreabilidade consistente, auditável e desacoplada** de toda mutação relevante — não um sistema de logs de aplicação, mas um domínio próprio com contrato formal, consumido por todos os demais domínios sem que nenhum deles precise conhecer sua implementação interna.

**Motivação já registrada, não inventada aqui**: RN006 (`objects/Organization.md`, "Auditoria obrigatória"), `NOVARIS_CONSTITUTION.md ARTICLE XVIII` ("Security" — lista "Auditoria obrigatória" como um dos 5 princípios de segurança, citado por `audit/CONTRACT.md`), e `BOM.md § 8` (`Audit Log`: "Registro imutável de auditoria", System Object distinto de `Event Log`: "Histórico de eventos"). `ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md § 7` já registrou o mecanismo de auditoria como dívida técnica "Alta" — este Epic existe para resolver essa dívida, entre outras.

**Diferença deliberada de um "logging system"**: logging técnico (erros, performance, debug) já tem seu próprio módulo de Kernel (`services/kernel/logging/`) — fora do escopo deste domínio. Audit é sobre rastreabilidade de negócio: quem fez o quê, quando, em qual Organization, com quais valores antes/depois — um registro que **precisa sobreviver** independentemente de qualquer decisão futura de tecnologia de logging.

## 2. Responsabilidades do Audit Domain

- Definir o contrato de um registro de auditoria (campos mínimos, § 6) — sem tecnologia.
- Definir como um registro é criado a partir de uma mutação de negócio ocorrida em qualquer domínio.
- Garantir imutabilidade do registro após criado (`BOM.md § 8`: "Registro imutável").
- Definir como um registro é consultado (por objeto afetado, por ator, por período) — sem definir tecnologia de consulta/índice.
- Servir de consumidor natural de Domain Events (via Event Bus, quando existir) — ponto de integração central para desacoplamento (§ 4, § 7).

## 3. Responsabilidades que NÃO pertencem ao Audit Domain

- **Logging técnico** (erros de aplicação, performance, debug) — `services/kernel/logging/`, módulo de Kernel distinto.
- **Validar ou aplicar** a regra de negócio que gerou o evento auditado — Audit registra o que já aconteceu, nunca decide se algo pode acontecer (isso é do domínio de origem).
- **Autenticação/autorização** — Identity Domain (`IDENTITY_DOMAIN_CLOSURE.md § 8`).
- **Transporte de eventos** — Event Bus (módulo de Kernel distinto, `services/kernel/event-bus/`); Audit é um consumidor do transporte, nunca o próprio transporte.
- **Notificação a usuários** (alertas de acesso suspeito, etc.) — já registrado como `TODO` em `audit/CONTRACT.md § Eventos Emitidos`, não decidido aqui; se vier a existir, pertence a `services/kernel/notifications/`, não a Audit.
- **Qualquer regra de negócio específica de CRM/Financial/Projects/Marketplace** — Audit nunca conhece a semântica de negócio de quem o consome, só a forma genérica do registro (§ 6).

## 4. Relações

- **Identity**: dependência de referência — todo registro de auditoria precisa saber "quem" (`userId`, referenciado por id, nunca embutido — mesmo princípio já congelado em `IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 8-9`). Audit nunca implementa autenticação/autorização própria.
- **Organization**: dependência de referência — todo registro precisa saber "em qual Organization" (`organizationId`), mesma razão já citada em `audit/CONTRACT.md § Dependências` ("Identity, Organizations... todo registro de auditoria precisa saber quem e em qual organização").
- **Event Bus**: **a relação mais importante para o desacoplamento pedido por esta missão**. `audit/CONTRACT.md` (ARCH-001) propõe `logEvent(entry: AuditEntry): void` como chamada direta — mas isso acopla cada domínio de origem ao Audit Domain por chamada síncrona. A alternativa (Audit como **consumidor assinante** do Event Bus, nunca chamado diretamente) é a única forma de cumprir "manter desacoplamento entre domínios" como pedido no Critério de Sucesso desta missão. **Esta escolha não é decidida aqui** — é o item de maior risco arquitetural (§ 7) e a primeira pergunta a resolver em `ENG-0005.4` (Domain Decisions).
- **CRM, AI, Automation, Marketplace, Billing**: nenhuma dependência de Audit sobre eles — relação estritamente inversa (mesma regra já aplicada a Permission/CRM, `PERMISSION_EPIC_PLANNING.md § 3`). Nenhum desses módulos existe implementado hoje (`KERNEL_MATURITY_ASSESSMENT.md § 2`); quando existirem, cada um publicará seus próprios Domain Events, que o Audit Domain poderá consumir (via Event Bus) sem nunca importar código de nenhum deles.

## 5. Eventos que Podem Gerar Auditoria (candidatos, sem implementar)

Sem exceção, apenas eventos **já nomeados** em fontes oficiais — nenhum inventado:

- `OrganizationCreated` (único Domain Event definitivo de Organization, `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 9`) — já implementado, já disparado, nunca publicado (`KERNEL_MATURITY_ASSESSMENT.md § 8`).
- `UserCreated`, `UserInvited`, `UserActivated`, `UserDisabled`, `RoleCreated`, `RoleAssignedToUser`, `RoleRevokedFromUser`, `PermissionGrantedToRole`, `PermissionRevokedFromRole` — os 9 Domain Events já implementados no Identity Domain.
- Candidatos citados em `objects/Organization.md § EVENTOS` mas **não implementados** no Aggregate real (`OrganizationUpdated`, `OrganizationActivated`, `OrganizationSuspended`, `OrganizationPlanChanged`, `OrganizationBillingFailed`, `OrganizationArchived`, `OrganizationDeleted`) — permanecem candidatos de Organization, não deste domínio; Audit não os cria, só os consumiria **se e quando** existirem.

Nenhum evento é definido ou implementado por este documento — a lista acima é só um inventário do que já existe ou já é candidato em outros domínios.

## 6. Informações Mínimas de um Registro Auditável (sem tecnologia)

Consolidação de fontes já oficiais, sem inventar nenhum campo novo:

| Campo | Status | Fonte |
|---|---|---|
| Ator (quem) | Já citado | `objects/Organization.md § AUDITORIA` ("Usuário"); `audit/CONTRACT.md` (`AuditEntry` inclui "usuário") |
| Timestamp (quando) | Já citado | `objects/Organization.md § AUDITORIA` ("Data") |
| Origem (IP/canal) | Já citado | `objects/Organization.md § AUDITORIA` ("IP", "Origem") |
| Evento/ação (o quê) | Já citado | `objects/Organization.md § AUDITORIA` ("Evento") |
| Valores antigos/novos | Já citado | `objects/Organization.md § AUDITORIA` ("Valores antigos", "Valores novos") |
| Organização (`organizationId`) | Inferido, não citado literalmente em `§ AUDITORIA`, mas exigido por `audit/CONTRACT.md § Dependências` e por RN001-RN004 (todo dado pertence a uma Organization) | `audit/CONTRACT.md`; `objects/Organization.md § REGRAS DE NEGÓCIO` |
| Objeto afetado (`objectId`/tipo) | Já citado | `audit/CONTRACT.md § Interface Pública` (`getAuditTrail(objectId: string)`) |

**Não definido, requer decisão futura**: se "valores antigos/novos" é obrigatório para todo tipo de evento (alguns, como `UserActivated`, podem não ter um "valor" a comparar) — marcado como aberto, não resolvido aqui.

## 7. Riscos Arquiteturais

| Risco | Classificação |
|---|---|
| Acoplamento síncrono direto (`audit.logEvent()` chamado por cada domínio) em vez de consumo assíncrono via Event Bus — contradiz o desacoplamento pedido pelo Critério de Sucesso desta missão, e `Event Bus` ainda não existe (`KERNEL_MATURITY_ASSESSMENT.md § 2`, recomendado como o EPIC seguinte) | **Alto** |
| Tensão entre "registro imutável" (`BOM.md § 8`) e uma futura política de retenção/expurgo por compliance (LGPD/GDPR, já candidato em `objects/Organization.md § FUTURAS EVOLUÇÕES`) — nenhuma fonte resolve isso | **Alto** |
| Sobreposição conceitual não resolvida entre `Audit Log` e `Event Log` (`BOM.md § 8`, dois System Objects distintos, sem diferenciação clara de responsabilidade) | **Médio** |
| Volume/performance de um domínio que potencialmente recebe um registro por mutação de toda a plataforma — decisão de armazenamento é de Infrastructure, mas o risco arquitetural (ex.: Aggregate único vs. particionado) deve ser reconhecido cedo | **Médio** |
| Citação desatualizada em `audit/CONTRACT.md` (aponta para `NOVARIS_CONSTITUTION.md`, hoje histórico/redirecionado por `ADR-0008`, em vez de `CONSTITUTION.md`, a Constituição ativa) — achado novo desta missão | **Baixo** |

## 8. Plano do EPIC

Segue integralmente [KERNEL_DOMAIN_LIFECYCLE_V2.md § 3](../../../knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md) (Fase 1 em diante) — diferente do EPIC-004, nenhuma tensão de sobreposição já conhecida sugere encerramento antecipado; o plano completo é o caminho esperado:

```
ENG-0005.1 — Audit Domain Discovery
  Resolver, como primeiro entregável, a pergunta de acoplamento de § 4/§ 7
  (Audit consome Event Bus de forma assíncrona, ou é chamado diretamente?)
  antes de qualquer modelagem de Aggregate prosseguir.
    ↓
ENG-0005.2 — Audit Domain Model
    ↓
ENG-0005.3 — Aggregate Design (rascunho — candidato líder: AuditEntry/AuditRecord,
  com identidade própria e sem métodos de mutação além de create(), diferente de
  Permission — ver nota de comparação abaixo)
    ↓
ENG-0005.4 — Domain Decisions (+ ADR, se a decisão de acoplamento com Event Bus
  ou a política de imutabilidade/retenção exigir — critério "ADR Before Divergence",
  Lifecycle v2 § 2)
    ↓
ENG-0005.5 — Aggregate Design Freeze
    ↓
ENG-0005.6 — Technical Blueprint
    ↓
  [GATE: Architecture Approval — CTO]
    ↓
ENG-0005.7 — Aggregate Implementation
    ↓
ENG-0005.8 — Value Objects Review
    ↓
ENG-0005.9 — Repository Contract
    ↓
ENG-0005.10 — Repository Contract Tests
    ↓
  [GATE: Architecture Review — ARG]
    ↓
ENG-0005.11 — Persistence & Mapper Blueprint (documento único, per Lifecycle v2 § 4)
    ↓
ENG-0005.12 — Implementation Readiness Audit
    ↓
  [GATE: CTO Readiness Approval]
    ↓
ENG-0005.13 — Domain Closure Review
    ↓
  [GATE: CTO Final Approval] → EPIC-005 encerrado
```

**Nota de comparação com Permission (EPIC-004)**: diferente de `Permission` (sem identidade, sem Repository possível — `PERMISSION_DOMAIN_DISCOVERY.md §§ 2, 6`), `AuditEntry` tem uma razão genuína para identidade própria (precisa ser recuperável independentemente, via `getAuditTrail(objectId)`) — o candidato a Aggregate aqui tem base bem mais forte do que Permission tinha. Isto não é uma decisão desta missão — é uma observação que justifica por que o plano completo (não um encerramento antecipado) é o caminho esperado para `ENG-0005.1` investigar.

## 9. Critérios de Encerramento

O EPIC-005 pode ser considerado concluído quando um Domain Closure Review (`ENG-0005.13`) resultar em `APPROVED`, `APPROVED WITH RESTRICTIONS` ou `NOT APPROVED`, com todo Gate obrigatório de `KERNEL_DOMAIN_LIFECYCLE_V2.md § 4` executado. Diferente do EPIC-004, nenhum caminho de "encerramento antecipado por ausência de domínio" é esperado aqui — a base para um Aggregate genuíno já é mais forte (nota acima) — mas `ENG-0005.1` deve, mesmo assim, confirmar isso formalmente, não presumir.

**Exige ADR quando**: a decisão de acoplamento (Event Bus assíncrono vs. chamada direta, § 4/§ 7) for tomada — é exatamente o tipo de mecanismo vinculante para toda a plataforma que `KERNEL_DOMAIN_LIFECYCLE_V2.md § 2` ("ADR Before Divergence") já prevê.

## 10. Status

🟡 **EPIC-005 INITIALIZED**. Planejamento oficial concluído. Nenhuma arquitetura detalhada, nenhum Aggregate, nenhum código, nenhuma tecnologia. Próxima missão: `ENG-0005.1` (Audit Domain Discovery), condicionada à aprovação formal do CTO sobre este planejamento.

---

## Relação com Outros Módulos

- [KERNEL_DOMAIN_LIFECYCLE_V2.md](../../../knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md) — processo oficial que rege este Epic
- [KERNEL_MATURITY_ASSESSMENT.md](../../../knowledge/engineering/standards/KERNEL_MATURITY_ASSESSMENT.md) — fonte da recomendação deste Epic como próximo (§ 9 daquele documento)
- [IDENTITY_DOMAIN_CLOSURE.md](../identity/IDENTITY_DOMAIN_CLOSURE.md), [ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md](../organizations/ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md) — domínios já concluídos, fonte dos Domain Events candidatos (§ 5)
- [PERMISSION_EPIC_PLANNING.md](../permissions/PERMISSION_EPIC_PLANNING.md), [PERMISSION_DOMAIN_DISCOVERY.md](../permissions/PERMISSION_DOMAIN_DISCOVERY.md) — precedente direto de planejamento e de análise de Aggregate-worthiness, usado por comparação em § 8
- [services/kernel/audit/CONTRACT.md](CONTRACT.md), [services/kernel/event-bus/CONTRACT.md](../event-bus/CONTRACT.md) — contratos preliminares de ARCH-001, fonte de § 5, § 6, § 7
- [knowledge/core/objects/Organization.md § AUDITORIA](../../../knowledge/core/objects/Organization.md), [knowledge/core/BOM.md § 8](../../../knowledge/core/BOM.md) — fonte de RN006 e do System Object `Audit Log`

## Status do Arquivo

🟡 Documento criado (Missão `EPIC-005.0`). Nenhum código, ADR, Aggregate, Repository, Mapper, Value Object, teste ou infraestrutura criado. Nenhum documento existente alterado. Aguardando aprovação formal do CTO.
