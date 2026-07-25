# Organization — Aggregate Design Freeze

Versão: 1.0.0

Status: 🟢 Oficial — definição definitiva do Aggregate `Organization`, sem implementação

Missão: ENG-0003.5 (Organization Aggregate Design Freeze) — EPIC-003

Escopo: consolidar em contrato vinculante tudo o que já foi decidido para o Aggregate `Organization` — [ORGANIZATION_DOMAIN_DISCOVERY.md](ORGANIZATION_DOMAIN_DISCOVERY.md) (ENG-0003.1), [ORGANIZATION_DOMAIN_MODEL.md](ORGANIZATION_DOMAIN_MODEL.md) (ENG-0003.2), [ORGANIZATION_AGGREGATE_DESIGN.md](ORGANIZATION_AGGREGATE_DESIGN.md) (ENG-0003.3), [ORGANIZATION_DOMAIN_DECISIONS.md](ORGANIZATION_DOMAIN_DECISIONS.md) (ENG-0003.4), [ADR-ORG-001](../../../adr/ADR-ORG-001-organization-status-strategy.md). Nenhum código, Aggregate, Repository, Domain Service, Blueprint ou teste foi criado. Padrão estrutural de rigor seguido de [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](../identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md) — só a forma, não o conteúdo.

**O que "congelar" significa aqui**: apenas o que já passou por decisão explícita (Discovery → Model → Design → `DEC-ORG-001..005` → `ADR-ORG-001`) vira contrato vinculante. Tudo que nunca recebeu decisão explícita — estrutura interna de `Workspace`/`Team`, natureza de `Subscription`/`Plan`, tabela completa de transições de `status` — **não é congelado por este documento** e aparece apenas em § 16, como restrição permanente sobre o que este Freeze não cobre, nunca como conteúdo hipotético apresentado como decidido.

---

## 1. Aggregate Root

**`Organization`** — definitivo, único Aggregate Root coberto por este Freeze. Identidade própria, ciclo de vida documentado, eventos de transição nomeados (**Proposta consolidada**, `ORGANIZATION_DOMAIN_MODEL.md § 4`, `ORGANIZATION_AGGREGATE_DESIGN.md § 2`). `Workspace`, `Team` e `Subscription` **não são cobertos por este Freeze** — permanecem candidatos a Aggregate Root próprio (`DEC-ORG-002`, `DEC-ORG-003`, `DEC-ORG-004`), sem estrutura interna própria definida; uma futura missão de Freeze específica para cada um seria necessária antes de qualquer implementação deles.

## 2. Responsabilidades

**Citada**, [objects/Organization.md § RESPONSABILIDADES](../../../knowledge/core/objects/Organization.md), consolidada em `ORGANIZATION_AGGREGATE_DESIGN.md § 3`: manter identidade única e estável (`id`, `slug`); manter dados cadastrais (nome comercial, razão social, documento, contato, endereço); governar seu próprio ciclo de vida (`status`); ser a raiz de referência de `organizationId` para toda a plataforma (RN001-RN004); manter branding, feature flags e settings como parte de si mesma.

## 3. Não Responsabilidades

**Citada integralmente**, [objects/Organization.md § NÃO É RESPONSABILIDADE](../../../knowledge/core/objects/Organization.md): gestão de usuários, CRM, financeiro, projetos, leads, negócios, agenda, marketing. **Consolidada**, `ORGANIZATION_AGGREGATE_DESIGN.md § 4`: não gerencia autenticação/autorização (Identity Domain, `IDENTITY_DOMAIN_CLOSURE.md § 8`); não implementa isolamento técnico diretamente (RN002-RN004 são Infrastructure, § 15 abaixo); não decide a estrutura interna de `Workspace`/`Team`/`Subscription` (§ 1).

## 4. Estado Interno

**Consolidado**, `ORGANIZATION_AGGREGATE_DESIGN.md § 5`, com `status` definitivo por `ADR-ORG-001`:

| Campo | Fonte | Status |
|---|---|---|
| `id` | Identidade própria | Definitivo |
| `slug` | `objects/Organization.md § ATRIBUTOS` ("Único") | Campo definitivo; escopo da unicidade **não coberto por este Freeze** (§ 16) |
| `name`, `legalName` | atributos homônimos | Definitivo |
| `document` | atributo `document` | Campo definitivo; candidato a Value Object `Document` (§ 5) |
| `contactInfo` (`email`/`phone`/`website`) | atributos homônimos | Agrupamento proposto, não confirmado como Value Object próprio |
| `address` | atributos de endereço | Campo definitivo; candidato a Value Object `Address` (§ 5) |
| `branding` | atributos de branding | Campo definitivo; candidato a Value Object `BrandingTheme` (§ 5) |
| `plan` | atributo `plan` | Campo definitivo como atributo simples; **natureza (Value Object vs. Aggregate próprio) não coberta por este Freeze** (§ 16) |
| `billingStatus`, `trialEnd` | atributos homônimos | Definitivo |
| `maxUsers`, `maxStorage`, `storageUsed` | atributos homônimos | Definitivo |
| `featureFlags`, `settings`, `metadata` | atributos homônimos | Definitivo como campos; forma estruturada interna não coberta |
| `status` | **`ADR-ORG-001`** | Definitivo — ver § 7 |
| `createdAt`/`updatedAt`/`deletedAt` | atributos homônimos, RN005 | Definitivo |

## 5. Value Objects

**Definitivo**, agrupamento de campos (não validação/comportamento interno, ainda não definidos):

| Value Object | Campos | Status |
|---|---|---|
| `Address` | `address`, `number`, `district`, `complement`, `city`, `state`, `zip_code`, `country` | Agrupamento congelado |
| `BrandingTheme` | `logo_url`, `favicon_url`, `primary_color`, `secondary_color`, `accent_color` | Agrupamento congelado |
| `Slug` | `slug` | Agrupamento congelado; validação de formato/escopo de unicidade não definida |
| `Document` | `document`, possivelmente `state_registration`/`municipal_registration` | Agrupamento congelado; formato de validação não definido |

**`Plan` explicitamente NÃO confirmado como Value Object por este Freeze** — sua natureza (Value Object simples vs. Aggregate com ciclo de vida próprio) nunca recebeu decisão explícita em nenhuma `DEC-ORG` (§ 16).

## 6. Invariantes

| Invariante | Status | Fonte |
|---|---|---|
| `id` é imutável após a criação | Definitivo | Padrão estrutural de `Entity`/`AggregateRoot` |
| Toda `Organization` tem `slug` único | Definitivo na existência; escopo **não coberto** | `objects/Organization.md § ATRIBUTOS` |
| `status` assume exatamente um dos 5 valores de § 7 | Definitivo | `ADR-ORG-001` |
| `Deleted` é representado por `deletedAt`, nunca por `status` | Definitivo | `ADR-ORG-001` |
| `name`/`slug` são obrigatórios na criação | Definitivo | Inferência mínima de `§ ATRIBUTOS`, consolidada em `ORGANIZATION_AGGREGATE_DESIGN.md § 8` |

## 7. Estados

**Definitivo**, [ADR-ORG-001](../../../adr/ADR-ORG-001-organization-status-strategy.md): `status` tem exatamente 5 valores — `"active"`, `"suspended"`, `"trial"`, `"blocked"`, `"archived"`. `§ LIFECYCLE` de `objects/Organization.md` é narrativa, não um enum à parte.

## 8. Transições Válidas

**Não coberto por este Freeze.** [ADR-ORG-001 § 13](../../../adr/ADR-ORG-001-organization-status-strategy.md) já registra explicitamente que a tabela completa de transições entre os 5 valores de `status` (§ 7) não foi decidida — inclusive se `suspended → active` (reativação) é uma transição real. Nenhuma tabela de transição é inventada aqui. Uma futura missão de implementação não pode presumir nenhuma transição além do que vier a ser decidido explicitamente.

## 9. Eventos de Domínio

**Não coberto por este Freeze — divergência entre fontes, não resolvida por nenhuma `DEC-ORG`**:

| Fonte | Eventos |
|---|---|
| `BOM.md § Organization` | `OrganizationCreated`, `OrganizationUpdated`, `OrganizationArchived` |
| `objects/Organization.md § EVENTOS` | `OrganizationCreated`, `OrganizationActivated`, `OrganizationUpdated`, `OrganizationSuspended`, `OrganizationPlanChanged`, `OrganizationBillingFailed`, `OrganizationArchived`, `OrganizationDeleted` |

`OrganizationCreated` é o único confirmado nas duas fontes **e** em `DOMAIN_MODEL.md § EVENT BUS` — o único evento com confirmação tripla, tratado aqui como o único evento **definitivo**. Os demais permanecem candidatos, sem lista canônica escolhida por este Freeze.

## 10. Relações Permitidas

- `Organization` é a raiz de referência de `organizationId` — todo outro Aggregate de qualquer domínio referencia `Organization` por id (RN001).
- `Organization` pode, no futuro, referenciar `UserId` (ex.: "quem criou esta Organization") — permitido pelo contrato já fechado em [IDENTITY_DOMAIN_CLOSURE.md § 9](../identity/IDENTITY_DOMAIN_CLOSURE.md) ("Permitido: `UserId`, `OrganizationId`, `RoleId`, `Permission`"); não modelado como campo real por nenhuma fonte ainda.
- Se `Workspace`/`Team` vierem a ser confirmados como Aggregates Roots próprios (`DEC-ORG-002`, `DEC-ORG-004`), referenciam `Organization` só por `organizationId`, nunca por objeto embutido — mesmo princípio já congelado no Identity Domain (`IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 8-9`).

## 11. Relações Proibidas

- `Organization` nunca embute `User`/`Role` — proibido por [IDENTITY_DOMAIN_CLOSURE.md § 9](../identity/IDENTITY_DOMAIN_CLOSURE.md) ("Proibido: alterar Aggregates [de Identity] diretamente" e conhecer suas regras internas).
- `Organization` nunca acessa tabelas de outro domínio — **Citada**, [DOMAIN_MODEL.md § REGRAS](../../../knowledge/core/DOMAIN_MODEL.md): "Um domínio nunca acessa tabelas de outro domínio. Toda comunicação deve ocorrer por Eventos ou APIs."
- `Organization` nunca implementa autenticação/autorização (§ 3).
- `Organization` nunca controla CRM, Financeiro, Projetos, Leads, Negócios, Agenda, Marketing (§ 3, **Citada**).

## 12. Limites Transacionais

**Definitivo**, `ORGANIZATION_AGGREGATE_DESIGN.md § 14`: `Organization` é sua própria fronteira transacional — toda mutação de seu estado é uma operação isolada sobre a instância de `Organization`, sem cruzar outro Aggregate. Não se estende a `Workspace`/`Team`/`Subscription` — sua fronteira transacional própria só poderá ser definida quando (e se) forem confirmados como Aggregates independentes, em Freeze própria.

## 13. Regras Protegidas pelo Aggregate

**Consolidado**, `ORGANIZATION_AGGREGATE_DESIGN.md § 11`:

- RN005 (Soft Delete obrigatório) — protegida estruturalmente via um comportamento próprio de arquivamento (§ 2), nunca exclusão física.
- RN007-RN010 (Feature Flags, Integrações, Storage, Billing pertencem à Organization) — protegidas estruturalmente por manter esses campos como parte de si mesma (§ 4), nunca delegados a outro objeto.
- `status` assumir só um dos 5 valores definidos (§ 7) — protegida pela própria forma do campo (tipagem), independentemente da tabela de transições (§ 8) ainda não coberta.

## 14. Regras que Pertencem a Domain Services

**Nenhuma identificada.** Diferente do Identity Domain neste mesmo estágio (que já tinha 3 Domain Services aprovados em `DOMAIN_SERVICE_IDENTIFICATION.md`), nenhuma regra do Organization Domain foi confirmada como exigindo colaboração entre múltiplos Aggregates ou dependência de Repository além do próprio `Organization`. O único candidato hipotético já registrado — a cadeia de provisionamento (`objects/Organization.md § AUTOMAÇÕES`, `ORGANIZATION_DOMAIN_DISCOVERY.md §§ 10, 12`) — permanece não modelado, fora do escopo deste Freeze.

## 15. Regras que Pertencem a Infrastructure

**Definitivo**, [DEC-ORG-005](ORGANIZATION_DOMAIN_DECISIONS.md), confirmando [AGGREGATE_IMPLEMENTATION_STANDARD.md § 7](../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001): RN002 (nenhuma consulta cross-tenant), RN003 (toda API valida `organization_id`), RN004 (toda tabela possui `organization_id`) — nenhuma é responsabilidade do Aggregate `Organization`; são escopadas por Repository/Application Layer, com RLS como última barreira (`objects/Organization.md § RLS`). Algoritmo/formato de validação de `Document`/`Slug` (§ 5) também são Infrastructure/Blueprint futuro, não definidos aqui.

## 16. Restrições Permanentes

Este Freeze **não cobre**, e nenhuma implementação pode presumir decidido, os seguintes itens — cada um exige decisão explícita futura antes de qualquer código:

- Estrutura interna de `Workspace` e `Team` (só sua candidatura a Aggregate Root está resolvida, `DEC-ORG-002`/`004` — não sua Object Specification, atributos, eventos ou invariantes).
- Natureza de `Subscription` (Aggregate próprio, Value Object, ou parte de outro objeto) além de seu domínio de pertencimento já resolvido (`DEC-ORG-003`).
- Natureza de `Plan` (Value Object simples vs. Aggregate com ciclo de vida próprio).
- Tabela completa de transições de `status` (§ 8), incluindo se `suspended → active` é real.
- Valor inicial de `status` na criação de uma `Organization`.
- Lista canônica de Domain Events de `Organization` além de `OrganizationCreated` (§ 9).
- Escopo de unicidade de `slug` (global ou outro critério).
- Regras de limite (`maxUsers`/`maxStorage`) — o que acontece ao exceder.
- Política de troca de plano (upgrade/downgrade, proração).

Mudar qualquer item já congelado (§§ 1-15) exige ADR, mesmo padrão já vigente para o Identity Domain (`IDENTITY_AGGREGATE_DESIGN_FREEZE.md § Declaração de Freeze`). **Decidir** um item desta lista pela primeira vez não exige ADR por si só (não é mudança de algo já congelado) — mas se a decisão resultante contrariar algo já congelado em §§ 1-15, a mudança exige ADR.

## 17. Declaração Formal de Freeze

A partir desta missão, o desenho estrutural do Aggregate `Organization` está **congelado**: Aggregate Root (§ 1), Responsabilidades/Não Responsabilidades (§§ 2-3), Estado Interno (§ 4), Value Objects — como agrupamento (§ 5), Invariantes (§ 6), Estados (§ 7), Relações Permitidas/Proibidas (§§ 10-11), Limites Transacionais (§ 12) e a separação de responsabilidade entre Aggregate/Domain Service/Infrastructure (§§ 13-15). Mudar qualquer um desses itens exige ADR. Os itens de § 16 permanecem explicitamente fora deste Freeze — decidi-los pela primeira vez é trabalho de uma futura missão, não uma reabertura deste documento.

Nenhuma implementação deste Aggregate deve começar a partir apenas deste documento sem que os itens de § 16 relevantes à implementação pretendida (em especial §§ 7-8, transições, e § 5, natureza de `Plan`) tenham sido decididos.

---

## Status

🟢 Design do Aggregate `Organization` congelado (Missão ENG-0003.5). Nenhum código implementado. Aguardando aprovação do CTO antes de qualquer missão de Blueprint ou implementação.
