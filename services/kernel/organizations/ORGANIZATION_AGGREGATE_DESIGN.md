# Organization Aggregate Design

Versão: 0.1.0

Status: 🟡 Proposto — design documental, **não congelado**, sem implementação

Missão: ENG-0003.3 (Organization Aggregate Design) — EPIC-003

Escopo: projetar, com o mesmo rigor de [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](../identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md), a estrutura do Aggregate `Organization` — sem congelar, sem implementar. **Esta missão não se chama "Design Freeze"** (diferente de `ENG-0002.5`) — é design rigoroso, não declaração de freeze. Nenhum código, Repository, Domain Service ou Event real foi criado.

---

## Nota de Método

Mesma disciplina de [ORGANIZATION_DOMAIN_MODEL.md § Nota de Método](ORGANIZATION_DOMAIN_MODEL.md): **Citada** (já oficial), **Proposta** (leitura razoável, não vinculante) ou **Em Aberto** (já registrada como não decidida em `ORGANIZATION_DOMAIN_DISCOVERY.md § 13` ou `ORGANIZATION_DOMAIN_MODEL.md`, não resolvida aqui). Construído exclusivamente a partir de `ORGANIZATION_DOMAIN_DISCOVERY.md`, `ORGANIZATION_DOMAIN_MODEL.md`, `DOMAIN_MODEL.md`, `UBIQUITOUS_LANGUAGE.md`, `BOM.md` e `IDENTITY_DOMAIN_CLOSURE.md` — as 6 fontes exigidas pela ordem de missão.

**Por que só `Organization` é desenhado aqui**: `ORGANIZATION_DOMAIN_MODEL.md § 4` já concluiu que `Organization` é o único candidato a Aggregate Root com confiança suficiente ("Alta — Proposta"); `Workspace`, `Team` e `Subscription` permanecem **Em Aberto**. Desenhar a estrutura interna de um Aggregate cuja própria existência como Aggregate não está confirmada violaria "nenhuma hipótese pode virar decisão" — por isso eles aparecem aqui só como candidatos a Entity interna (§ 6), nunca desenhados como se já fossem parte confirmada da estrutura.

---

## 1. Objetivo do Aggregate

Garantir que toda mutação de estado de uma `Organization` — criação, ativação, suspensão, arquivamento, alteração de plano, atualização cadastral — preserve as invariantes de identidade e ciclo de vida já documentadas (**Proposta**, com base em `objects/Organization.md § LIFECYCLE`/`REGRAS DE NEGÓCIO`), funcionando como a raiz de referência de `organizationId` para toda a plataforma (RN001-RN004, **Citada**).

## 2. Aggregate Root Candidato

**`Organization`** — único candidato com confiança suficiente (**Proposta**, herdada sem alteração de `ORGANIZATION_DOMAIN_MODEL.md § 4`): identidade própria, ciclo de vida documentado, eventos de transição nomeados (com divergência entre fontes, § 12). Mesmo padrão de confiança que confirmou `User` como Aggregate Root no Identity Domain — mas, diferente de `User`/`Role`, **este design não está congelado**: é uma proposta rigorosa aguardando validação, não uma estrutura definitiva.

## 3. Responsabilidades

**Proposta**, derivada de `objects/Organization.md § RESPONSABILIDADES` e `§ REGRAS DE NEGÓCIO`:

- Manter identidade única e estável (`id`, `slug`).
- Manter dados cadastrais (nome comercial, razão social, documento, contato, endereço).
- Governar seu próprio ciclo de vida (`status`), garantindo que só transições já documentadas ocorram (§ 10).
- Ser a raiz de referência de `organizationId` que todo o resto da plataforma consome (RN001-RN004, **Citada**).
- Manter configuração de branding, feature flags e settings como parte de si mesma (**Citada**, `objects/Organization.md § ATRIBUTOS`: `feature_flags`, `settings` já são campos diretos de `Organization`, não de outro objeto).

## 4. Não Responsabilidades

**Citada integralmente**, [objects/Organization.md § NÃO É RESPONSABILIDADE](../../../knowledge/core/objects/Organization.md): gestão de usuários, CRM, financeiro, projetos, leads, negócios, agenda, marketing — "pertencem aos módulos específicos".

**Propostas, por analogia direta com a disciplina já congelada no Identity Domain**:

- Não gerencia autenticação nem autorização — responsabilidade exclusiva do Identity Domain (`IDENTITY_DOMAIN_CLOSURE.md § 8`).
- Não decide como `Workspace`/`Team`/`Subscription` se relacionam consigo — pergunta **Em Aberto** (§ 15), não respondida por este Aggregate se tornar responsável por decidir.
- Não implementa isolamento técnico (RLS, particionamento) diretamente — RN002 é uma regra que o Aggregate **carrega como dado obrigatório** (`organizationId` em cada Aggregate consumidor), mas o **enforcement** de "nenhuma consulta cross-tenant" é responsabilidade de Repository/Infrastructure (RLS, `objects/Organization.md § RLS`), mesma separação já usada em `AGGREGATE_IMPLEMENTATION_STANDARD.md § 7` para todo domínio da NOVARIS.

## 5. Estado Interno

**Proposto** (`OrganizationProps`, nome de trabalho — não implementação), derivado exclusivamente de [objects/Organization.md § ATRIBUTOS](../../../knowledge/core/objects/Organization.md), sem inventar nenhum campo:

| Campo Proposto | Base | Observação |
|---|---|---|
| `id` | `ID` (UUID, PK) | Identidade — mesmo padrão de `UniqueEntityId` do Shared Kernel |
| `slug` | `slug` (Único) | Escopo da unicidade **Em Aberto** (§ 15) |
| `name` | `name` (Nome Comercial) | — |
| `legalName` | `legal_name` (Razão Social) | — |
| `document` | `document` (CNPJ) | Candidato a Value Object `Document` (`ORGANIZATION_DOMAIN_MODEL.md § 6`) |
| `contactInfo` | `email`, `phone`, `website` | Agrupamento proposto, não confirmado como Value Object próprio |
| `address` | `address`, `number`, `district`, `complement`, `city`, `state`, `zip_code`, `country` | Candidato a Value Object `Address` |
| `branding` | `logo_url`, `favicon_url`, `primary_color`, `secondary_color`, `accent_color` | Candidato a Value Object `BrandingTheme` |
| `plan` | `plan` (enum `Starter`/`Growth`/`Business`/`Enterprise`) | Natureza (VO vs. Aggregate próprio) **Em Aberto** |
| `billingStatus`, `trialEnd` | `billing_status`, `trial_end` | — |
| `maxUsers`, `maxStorage`, `storageUsed` | atributos homônimos | — |
| `featureFlags`, `settings`, `metadata` | atributos homônimos (JSON) | Forma estruturada não definida em nenhuma fonte |
| `status` | `status` (`ACTIVE`/`SUSPENDED`/`TRIAL`/`BLOCKED`/`ARCHIVED`) | Ver § 10 — divergência entre este enum de 5 valores e o diagrama de 6 estados do `LIFECYCLE` |
| `createdAt`/`updatedAt`/`deletedAt` | atributos homônimos | `deletedAt` reflete RN005 (Soft Delete obrigatório) |

Nenhum destes campos foi implementado — proposta de forma, não estrutura de código.

## 6. Entidades Internas Candidatas

**Em Aberto** — nenhuma confirmada. `Workspace` e `Team` são os candidatos mais prováveis (`ORGANIZATION_DOMAIN_MODEL.md §§ 4-5`), mas nenhum dos dois tem responsabilidade, atributo ou ciclo de vida documentado o suficiente para ser desenhado aqui como Entity real — propô-los como Entity confirmada violaria a restrição explícita desta missão ("nenhuma Entity deve existir sem responsabilidade"). Permanecem como candidatos, não como parte da estrutura proposta em §§ 5/7.

## 7. Value Objects

**Propostos**, herdados sem alteração de [ORGANIZATION_DOMAIN_MODEL.md § 6](ORGANIZATION_DOMAIN_MODEL.md):

| Value Object | Campos-base | Status |
|---|---|---|
| `Address` | `address`, `number`, `district`, `complement`, `city`, `state`, `zip_code`, `country` | Proposto |
| `BrandingTheme` | `logo_url`, `favicon_url`, `primary_color`, `secondary_color`, `accent_color` | Proposto |
| `Slug` | `slug` | Proposto — validação de formato e escopo de unicidade **Em Aberto** |
| `Document` | `document`, possivelmente `state_registration`/`municipal_registration` | Proposto — formato de validação não definido |
| `Plan` | `plan` | **Em Aberto** — Value Object ou Aggregate próprio (§ 15) |

Nenhum destes tem regra de validação, construtor ou comportamento definidos — só o agrupamento de campos já citado em `objects/Organization.md`.

## 8. Invariantes

**Propostas**, com fonte explícita para cada uma — nenhuma inventada:

| Invariante | Status | Fonte |
|---|---|---|
| `id` é imutável após a criação | Proposta | Mesmo padrão estrutural de `Entity`/`AggregateRoot` do Shared Kernel |
| Toda `Organization` tem `slug` único | Proposta, escopo **Em Aberto** | `objects/Organization.md § ATRIBUTOS` ("slug... Único"), sem definir global vs. outro escopo |
| `status` segue apenas transições já documentadas | Proposta, com ambiguidade **Em Aberto** | `objects/Organization.md § LIFECYCLE`, tensão com § API/EVENTOS já registrada em `ORGANIZATION_DOMAIN_MODEL.md § 9` |
| Toda `Organization` tem `name`/`slug` obrigatórios na criação | Proposta | Inferência mínima de `ATRIBUTOS` — nenhuma fonte declara explicitamente quais campos são obrigatórios vs. opcionais na criação |

**Explicitamente não propostas por falta de fonte**: regras de limite (`max_users`/`max_storage` — o que acontece ao exceder), regras de transição completa de plano — ambas `requer decisão` (§ 16), não inventadas aqui.

## 9. Comportamentos Públicos

**Propostos**, derivados exclusivamente dos casos de uso já listados em [ORGANIZATION_DOMAIN_MODEL.md § 8](ORGANIZATION_DOMAIN_MODEL.md) (que por sua vez vêm de `objects/Organization.md § API`) — nomes de trabalho, sem assinatura de código (isso seria detalhe técnico, fora do escopo desta missão):

- **Criar** — corresponde a `POST /organizations`.
- **Atualizar dados cadastrais** — corresponde a `PATCH /organizations/:id`.
- **Suspender** — corresponde a `POST /organizations/:id/suspend`.
- **Ativar** — corresponde a `POST /organizations/:id/activate`.
- **Alterar plano** — corresponde a `POST /organizations/:id/change-plan`.
- **Arquivar/Remover (soft delete)** — corresponde a `DELETE /organizations/:id`, RN005.

Nenhuma regra de negócio dentro de cada comportamento (ex.: o que valida "Alterar plano") foi definida — ver § 16.

## 10. Estados e Transições

**Citada, com tensão já registrada, não resolvida**: [objects/Organization.md § LIFECYCLE](../../../knowledge/core/objects/Organization.md) desenha uma cadeia linear:

```
Created → Pending Configuration → Active → Suspended → Archived → Deleted (Soft Delete)
```

**Tensão não resolvida** (já sinalizada em `ORGANIZATION_DOMAIN_MODEL.md § 9`): o diagrama não mostra nenhuma seta de volta, mas `objects/Organization.md § API` lista um endpoint `POST /organizations/:id/activate` e `§ EVENTOS` lista `OrganizationActivated` — sugerindo, sem confirmar, que `Suspended → Active` pode ser uma transição real. Diferente do Identity Domain (onde a ausência de qualquer evidência a favor de reativação de `User` já era clara), aqui a evidência é ambígua: pode ser reativação real, ou pode ser que `activate` só se aplique à transição inicial `Pending Configuration → Active`. **Em Aberto** — não presumido em nenhuma direção.

**Segunda tensão**: `§ STATUS` lista 5 valores (`ACTIVE`, `SUSPENDED`, `TRIAL`, `BLOCKED`, `ARCHIVED`), diferente dos 6 estados do diagrama `§ LIFECYCLE` (`Created`, `Pending Configuration`, `Active`, `Suspended`, `Archived`, `Deleted`) — `TRIAL` e `BLOCKED` não aparecem no diagrama; `Created`/`Pending Configuration`/`Deleted` não aparecem na lista de status. Nenhuma fonte reconcilia as duas listas. Registrado, não resolvido.

## 11. Regras de Negócio Protegidas

Mapeamento de RN001-RN010 (**Citada**, `objects/Organization.md`) contra o que o Aggregate pode proteger sozinho vs. o que depende de outra camada — mesma distinção já aplicada no Identity Domain (`ENG-0002.9`, "Aggregate vs. Infrastructure"):

| Regra | O Aggregate protege sozinho? |
|---|---|
| RN001 — Toda informação pertence a uma Organization | N/A para o próprio `Organization` (ele é a raiz); protegida por todo **outro** Aggregate que carrega `organizationId` |
| RN002 — Nenhuma consulta cross-tenant | Não — depende de Repository/RLS (Infrastructure), o Aggregate não controla consultas |
| RN003 — Toda API valida `organization_id` | Não — Interface/Application Layer |
| RN004 — Toda tabela possui `organization_id` | Não — Infrastructure (schema de banco) |
| RN005 — Soft Delete obrigatório | Proposta — o Aggregate pode proteger isso via um comportamento próprio (§ 9, "Arquivar/Remover") em vez de exclusão física, mas o mecanismo de soft delete em si (coluna `deleted_at`, filtro de query) é parcialmente Infrastructure |
| RN006 — Auditoria obrigatória | Não diretamente — mesma separação já usada em `User`/`Role` (`createdBy`/`updatedBy` vêm da Application Layer, `ENS-0001 § 6`) |
| RN007-RN010 — Feature Flags/Integrações/Storage/Billing pertencem à Organization | Proposta — o Aggregate protege isso estruturalmente ao manter esses campos como parte de si mesmo (§ 5), não delegados a outro objeto |

## 12. Domain Events Candidatos

**Tensão já registrada em `ORGANIZATION_DOMAIN_MODEL.md § 7`, reproduzida sem escolher um vencedor**:

| Fonte | Eventos |
|---|---|
| `BOM.md` | `OrganizationCreated`, `OrganizationUpdated`, `OrganizationArchived` |
| `objects/Organization.md` | `OrganizationCreated`, `OrganizationActivated`, `OrganizationUpdated`, `OrganizationSuspended`, `OrganizationPlanChanged`, `OrganizationBillingFailed`, `OrganizationArchived`, `OrganizationDeleted` |

Nenhum evento real foi criado nesta missão (`DomainEvent` do Shared Kernel não foi implementado para nenhum destes) — apenas listados como candidatos já citados em fonte oficial, mesma disciplina de `IDENTITY_TECHNICAL_BLUEPRINT.md § 7` antes da implementação real.

## 13. Relação com o Identity Domain

**Citada integralmente**, [IDENTITY_DOMAIN_CLOSURE.md §§ 8-9](../identity/IDENTITY_DOMAIN_CLOSURE.md) — mesmo contrato já reproduzido em `ORGANIZATION_DOMAIN_MODEL.md § 10`, reafirmado aqui sem alteração:

- **Permitido**: `Organization` pode, no futuro, referenciar `UserId` (ex.: "quem criou esta Organization", "quem é o administrador") — não modelado em `§ 5` por não haver fonte que confirme esse campo hoje.
- **Proibido**: `Organization` nunca embute `User`/`Role`; nunca acessa tabelas internas do Identity Domain; nunca conhece as regras internas de `User`/`Role` (transições de status, formato de `Permission`).

Nenhuma violação deste contrato aparece em nenhuma seção deste documento — confirmado por revisão de §§ 5-9.

## 14. Limites Transacionais

**Proposta**: `Organization` é sua própria fronteira transacional — toda mutação de seu estado (§ 9) é uma operação sobre a instância de `Organization` isoladamente, sem cruzar outro Aggregate, mesmo princípio já congelado para `User`/`Role` (`IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 5`).

**Condicional, dependente de decisões ainda abertas**: **se** `Workspace`/`Team` vierem a ser confirmados como Aggregates Roots próprios (§ 6, § 15), o princípio já estabelecido no Identity Domain deveria se aplicar aqui também — referência por id, nunca embedding, nenhuma transação cruzando os dois. **Se** vierem a ser confirmados como Entities internas de `Organization`, então fariam parte da mesma fronteira transacional dele. Qual dos dois casos é real **não é decidido por este documento**.

## 15. Decisões Abertas

Herdadas de `ORGANIZATION_DOMAIN_DISCOVERY.md § 13`/`ORGANIZATION_DOMAIN_MODEL.md`, refinadas para o nível de Aggregate Design:

- `Workspace` é Aggregate Root próprio ou Entity interna de `Organization`?
- `Team` é Aggregate Root próprio ou Entity interna de `Organization`/`Workspace`?
- `Subscription` pertence ao Organization Domain, ao Financial Domain, ou é Value Object embutido em `Organization`?
- `Plan` é Value Object (enum simples) ou Aggregate com ciclo de vida próprio?
- Escopo da unicidade de `slug` — global ou por algum outro critério?
- Qual lista de eventos de `Organization` é canônica (§ 12)?
- `Suspended → Active` é uma transição real (reativação) ou o endpoint `activate` só cobre `Pending Configuration → Active`?
- Reconciliação entre os 5 valores de `§ STATUS` e os 6 estados de `§ LIFECYCLE` em `objects/Organization.md`.

## 16. Perguntas Que Impedem Implementação

Subconjunto de § 15 que **bloqueia diretamente** qualquer código real, mesmo que as demais perguntas de § 15 permanecessem abertas:

- **Estratégia técnica de isolamento multi-tenant** — [architecture/multi-tenancy.md](../../../architecture/multi-tenancy.md) ainda é `TODO`; `objects/Organization.md § RLS` aponta uma direção (`organization_id = auth.organization_id`), mas não é o documento de arquitetura formal.
- **Forma real de `status`** — sem reconciliar § STATUS vs. § LIFECYCLE (§ 10), não é possível definir o tipo `OrganizationStatus` com confiança.
- **Regra de reativação** (§ 10) — sem essa decisão, o comportamento "Ativar" (§ 9) não pode ser implementado corretamente (poderia ser código morto, ou poderia estar faltando uma transição real).
- **Natureza de `Plan`** (§ 15) — sem decidir, o campo `plan` de `§ 5` não pode virar um tipo real (enum simples vs. referência a Aggregate).
- **Regras de limite** (`max_users`/`max_storage`) — nenhuma fonte define o que acontece ao exceder; implementar "Atualizar dados cadastrais" sem essa regra seria implementação incompleta silenciosa.

## 17. Declaração de NÃO Implementação

Este documento é **design documental, não uma Freeze**. Nenhum Aggregate, Repository, Domain Service ou Domain Event real foi criado — nenhum arquivo `.ts`. Nenhuma das decisões abertas (§ 15) ou perguntas bloqueantes (§ 16) foi resolvida. **Nenhuma implementação deste Aggregate deve começar a partir apenas deste documento** — uma futura missão de Design Freeze (análoga a `IDENTITY_AGGREGATE_DESIGN_FREEZE.md`, `ENG-0002.5`) precisaria primeiro resolver §§ 15-16, com decisão explícita do CTO, antes de qualquer `ENG-0003.x` de implementação.

---

## Relação com Outros Módulos

- [ORGANIZATION_DOMAIN_DISCOVERY.md](ORGANIZATION_DOMAIN_DISCOVERY.md) (ENG-0003.1), [ORGANIZATION_DOMAIN_MODEL.md](ORGANIZATION_DOMAIN_MODEL.md) (ENG-0003.2) — bases diretas deste documento
- [knowledge/core/objects/Organization.md](../../../knowledge/core/objects/Organization.md) — fonte primária de atributos, eventos, regras e ciclo de vida
- [knowledge/core/DOMAIN_MODEL.md](../../../knowledge/core/DOMAIN_MODEL.md), [knowledge/core/UBIQUITOUS_LANGUAGE.md](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md), [knowledge/core/BOM.md](../../../knowledge/core/BOM.md) — fontes de vocabulário e regras
- [services/kernel/identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md](../identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md) — precedente metodológico de rigor (não de conclusão — aquele documento **é** uma Freeze; este não é)
- [services/kernel/identity/IDENTITY_DOMAIN_CLOSURE.md](../identity/IDENTITY_DOMAIN_CLOSURE.md) — contrato de fronteira já congelado do lado Identity (§ 13 acima)
- [packages/shared-kernel/](../../../packages/shared-kernel/README.md) — blocos que uma futura implementação consumiria, quando/se as perguntas abertas forem decididas

## Status

🟡 Design proposto (Missão ENG-0003.3), **não congelado**. Nenhuma implementação de código. §§ 15-16 permanecem abertas — aguardando aprovação formal do CTO antes de qualquer missão de Freeze ou implementação.
