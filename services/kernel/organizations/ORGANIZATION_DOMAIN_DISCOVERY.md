# Organization Domain — Discovery

Versão: 0.1.0

Status: 🟢 Oficial — descoberta, sem implementação

Missão: ENG-0003.1 (Organization Domain Discovery) — EPIC-003

Escopo: exclusivamente descoberta e análise documental. Nenhum código, Entity, Value Object, Aggregate, Repository, Domain Service ou API foi criado nesta missão.

---

## Nota de Método (leia antes de tudo)

Mesma disciplina já usada em [IDENTITY_DOMAIN_MODEL.md § Nota de Método](../identity/IDENTITY_DOMAIN_MODEL.md): todo termo/objeto/regra abaixo que já é oficial em outro documento (`BOM.md`, `DOMAIN_MODEL.md`, `UBIQUITOUS_LANGUAGE.md`, `objects/Organization.md`) é **citado, não reescrito**, e marcado **Citada**. Onde nenhum documento anterior define algo (Aggregates, Value Objects, Domain Services), o conteúdo é marcado **Proposto** — uma leitura razoável para viabilizar descoberta futura, nunca uma decisão já tomada. Onde a base documental é insuficiente até para propor com confiança, o item é marcado **Hipótese** ou movido para § 13 (Perguntas Ainda Não Decididas), em vez de inventado.

**Nota sobre o caminho deste documento**: a ordem de missão pediu `services/kernel/organization/ORGANIZATION_DOMAIN_DISCOVERY.md` (singular). Esse caminho não existe — o módulo Kernel já estabelecido desde a Missão ARCH-001 é `services/kernel/organizations/` (plural, com `README.md` próprio). Criar uma segunda pasta singular duplicaria/confundiria a estrutura já existente (Constituição, Artigo 16 — proíbe duplicação), e o precedente já usado para o Identity Domain foi colocar toda a documentação de descoberta/modelagem no mesmo diretório do módulo Kernel já existente (`services/kernel/identity/`). Por isso este documento vive em **`services/kernel/organizations/ORGANIZATION_DOMAIN_DISCOVERY.md`** — mesmo padrão já usado em `ADM-0001` para o desvio de caminho `docs/architecture/` → `architecture/`.

---

## 1. Objetivo do Bounded Context

Responder "qual é a empresa (ou unidade de negócio) dona desta informação, e como ela se configura, se organiza internamente e se relaciona comercialmente com a plataforma" — o mecanismo central de isolamento multi-tenant de toda a NOVARIS (**Citada** — [objects/Organization.md](../../../knowledge/core/objects/Organization.md): "A Organization é o principal mecanismo de isolamento lógico, segurança, permissões, auditoria e faturamento da plataforma. Toda a arquitetura Multi-Tenant da NOVARIS gira em torno deste objeto.").

## 2. Responsabilidade dentro da Plataforma

**Citada** ([DOMAIN_MODEL.md § WORKSPACE DOMAIN](../../../knowledge/core/DOMAIN_MODEL.md)): organizações, times, espaços, configurações, branding, planos, billing, storage, feature flags.

**Citada, detalhada** ([objects/Organization.md § RESPONSABILIDADES](../../../knowledge/core/objects/Organization.md)): isolamento multiempresa, configurações, plano contratado, permissões globais, branding, billing, integrações, auditoria, feature flags, IA, storage, ambientes, licenciamento.

**Explicitamente NÃO é responsabilidade** (**Citada**, [objects/Organization.md § NÃO É RESPONSABILIDADE](../../../knowledge/core/objects/Organization.md)): gestão de usuários, CRM, financeiro, projetos, leads, negócios, agenda, marketing — "Todas essas responsabilidades pertencem aos módulos específicos."

**Tensão de nomenclatura registrada, não resolvida**: este mesmo conceito aparece com **quatro nomes diferentes** em documentos já oficiais, já parcialmente registrado em [UBIQUITOUS_LANGUAGE.md](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md) (linha "Camada arquitetural divergente"):

1. **"Workspace Domain"** — [DOMAIN_MODEL.md](../../../knowledge/core/DOMAIN_MODEL.md), um dos 13 Business Domains, mesmo nível de `Sales`/`Marketing`.
2. **"Organizations"** — pasta real do Kernel, `services/kernel/organizations/`, criada na Missão ARCH-001.
3. **Conceito equivalente tratado como Kernel Layer 1** (não Business Domain) em [SYSTEM_ARCHITECTURE.md § 3-4](../../../knowledge/core/SYSTEM_ARCHITECTURE.md) — camada arquitetural diferente da de `DOMAIN_MODEL.md`.
4. **"Organization Domain"** — nome usado por esta própria Ordem de Missão (ENG-0003.1).

Nenhuma fonte reconcilia os quatro. Não resolvido aqui — ver § 13.

## 3. Linguagem Ubíqua Inicial

Fonte canônica: [UBIQUITOUS_LANGUAGE.md § Domínio: Workspace](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md) — **citada, não duplicada em detalhe aqui**. Resumo dos 5 termos já oficiais:

| Termo | Definição (Citada) | Não Confundir Com |
|---|---|---|
| **Organization** | Empresa, unidade empresarial ou cliente (SaaS Tenant); mecanismo central de isolamento multi-tenant | `Team` (agrupamento interno); `External Organization` (empresa de contato, domínio Relationship) |
| **Workspace** | Ambiente lógico de trabalho dentro de uma organização | A própria `Organization` |
| **Team** | Agrupamento de usuários | `Role` (Team agrupa pessoas, Role agrupa permissões) |
| **Subscription** | Assinatura — vínculo de uma Organization a um plano pago | O pagamento individual (`Payment`, domínio Financial) |
| **Environment** | Ambiente de execução (produção, staging) | `Workspace` (que é organizacional, não técnico) |

Termos explicitamente **fora** deste domínio, já catalogados em outro (**Citada**, [UBIQUITOUS_LANGUAGE.md § Domínio: Relationship](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md)): `Party`, `Person`, `External Organization` — "não confundir com `Organization` (o tenant da plataforma)".

## 4. Possíveis Aggregates

| Candidato | Status | Justificativa |
|---|---|---|
| **Organization** | Proposto, alta confiança | Único item com identidade própria, ciclo de vida documentado (`Created → Pending Configuration → Active → Suspended → Archived → Deleted`, **Citada**, [objects/Organization.md § LIFECYCLE](../../../knowledge/core/objects/Organization.md)) e eventos de transição de estado já nomeados — mesmo critério que tornou `User` um Aggregate Root óbvio em `IDENTITY_DOMAIN_MODEL.md § 4` |
| **Workspace** | Hipótese, baixa confiança | `BOM.md` só tem uma linha ("ambiente lógico de trabalho dentro de uma organização"), sem atributos, relacionamentos ou eventos definidos — insuficiente para propor com confiança se é Aggregate próprio ou Entity interna de `Organization`. Ver § 13 |
| **Team** | Hipótese, baixa confiança | Mesma limitação de `Workspace` — `BOM.md`: "Agrupamento de usuários", sem mais detalhe. Ver § 13 |
| **Subscription** | Hipótese, baixa confiança | `DOMAIN_MODEL.md` o lista como objeto do Workspace Domain, mas `UBIQUITOUS_LANGUAGE.md` já registra que `DOMAIN_MODEL.md` o cita **também** em Financial — duplicidade já conhecida, não resolvida. Ver § 13 |
| **Environment** | Hipótese, muito baixa confiança | `BOM.md`: "Ambiente de execução" — pode ser conceito técnico (Infrastructure), não de domínio de negócio. Ver § 13 |

Nenhum destes 5 candidatos foi confirmado como Aggregate Root — apenas `Organization` tem base documental (ciclo de vida + eventos) equivalente ao que, no Identity Domain, precedeu a confirmação real de `User`/`Role` como Aggregates (`IDENTITY_TECHNICAL_BLUEPRINT.md § 1`, depois `IDENTITY_AGGREGATE_DESIGN_FREEZE.md`).

## 5. Possíveis Entities

Nenhuma Entity interna (não-raiz) pode ser proposta com confiança nesta missão. `Team` e `Workspace` são os candidatos mais prováveis a Entity (em vez de Aggregate Root próprio) — mas a base documental atual (§ 4) não permite decidir entre "Aggregate Root independente" e "Entity interna de `Organization`". Mesma disciplina de `IDENTITY_DOMAIN_MODEL.md § 5`: não decidir sem fonte suficiente.

## 6. Possíveis Value Objects

Nenhum Value Object está definido em nenhum documento oficial hoje. Candidatos **propostos**, com base nos atributos já agrupados em [objects/Organization.md § ATRIBUTOS](../../../knowledge/core/objects/Organization.md):

| Value Object Proposto | Base (atributos já citados) |
|---|---|
| **Address** | `address`, `number`, `district`, `complement`, `city`, `state`, `zip_code`, `country` — grupo coeso já presente nos atributos de `Organization` |
| **BrandingTheme** | `logo_url`, `favicon_url`, `primary_color`, `secondary_color`, `accent_color` — grupo coeso já presente |
| **Slug** | `slug` — já descrito como "Único"; candidato a Value Object com validação de formato/unicidade, mesmo padrão de `Email`/`Permission` no Identity Domain |
| **Document** | `document` (CNPJ), possivelmente com `state_registration`/`municipal_registration` — candidato a Value Object com validação de formato, não definida em nenhuma fonte |
| **Plan** | Hoje um enum simples (`Starter`/`Growth`/`Business`/`Enterprise`) nos atributos de `Organization` — candidato a Value Object **ou** a Aggregate próprio, tensão registrada em § 12/§ 13 |

Nenhum destes tem forma, validação ou comportamento definidos — apenas o agrupamento de campos já citado. Implementá-los é decisão de uma futura missão de Blueprint, não desta.

## 7. Regras de Negócio Identificadas

Todas **Citadas**, [objects/Organization.md § REGRAS DE NEGÓCIO](../../../knowledge/core/objects/Organization.md), reproduzidas sem reescrever:

| # | Regra |
|---|---|
| RN001 | Toda informação pertence obrigatoriamente a uma Organization |
| RN002 | Nenhuma consulta pode retornar dados de outra Organization |
| RN003 | Toda API deve validar `organization_id` |
| RN004 | Toda tabela obrigatoriamente possui `organization_id` |
| RN005 | Soft Delete obrigatório |
| RN006 | Auditoria obrigatória |
| RN007 | Feature Flags são definidas por Organization |
| RN008 | Integrações pertencem à Organization |
| RN009 | Storage pertence à Organization |
| RN010 | O Billing pertence à Organization |

RN001-RN004 são a base substantiva do modelo de isolamento multi-tenant, hoje o único conteúdo real de [architecture/multi-tenancy.md](../../../architecture/multi-tenancy.md) (ainda `TODO` como documento formal — já registrado em `objects/Organization.md § Relação com Outros Módulos`).

## 8. Relações com Identity Domain

- **Dependência oficial**: `Identity → Workspace` é o primeiro elo da cadeia de dependências da plataforma (**Citada**, [DOMAIN_MODEL.md § DEPENDÊNCIAS](../../../knowledge/core/DOMAIN_MODEL.md)) — todo domínio de negócio depende de Identity antes de Workspace, e Workspace vem logo em seguida.
- **Referência por identidade, nunca por objeto embutido**: `User`/`Role` (Identity) já carregam `organizationId: UniqueEntityId` como referência obrigatória (**Citada**, [IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 4, 6, 8](../identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md)) — "toda informação pertence obrigatoriamente a uma Organization" já é regra ativa no Identity Domain, referenciando este domínio só por id, nunca embutindo o Aggregate `Organization`.
- **Dependência mútua já registrada**: `services/kernel/organizations/README.md § Dependências` já lista `Identity` como dependência (**Citada**) — o fluxo de provisionamento de `objects/Organization.md § AUTOMAÇÕES` inclui "Criar Admin" logo após criar a Organization, o que implica Workspace precisar de Identity (para criar o primeiro `User`) tanto quanto Identity precisa de Workspace (para todo `User`/`Role` ter um `organizationId` válido). Esta dependência mútua já estava registrada em [IDENTITY_DOMAIN_MODEL.md § 10](../identity/IDENTITY_DOMAIN_MODEL.md) ("dependência mútua já registrada na estrutura real do Kernel") — reafirmada aqui, não resolvida.
- **Nenhuma decisão nova**: esta seção só consolida o que já estava documentado nos dois lados (Identity e Workspace); nenhuma relação nova foi proposta.

## 9. Relações Proibidas

- **Acesso direto a tabela de outro domínio** — proibido (**Citada**, [DOMAIN_MODEL.md § REGRAS](../../../knowledge/core/DOMAIN_MODEL.md): "Um domínio nunca acessa tabelas de outro domínio. Toda comunicação deve ocorrer por Eventos ou APIs.").
- **Embutir `User`/`Role` diretamente em `Organization`/`Workspace`/`Team`** — proibido por analogia direta com a mesma disciplina já congelada no lado Identity (`IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 8-9`: referência sempre por id, nunca por objeto embutido); nenhum documento do lado Workspace contradiz isso.
- **Implementar autenticação/autorização dentro do Organization Domain** — proibido; é responsabilidade exclusiva do Identity Domain (`IDENTITY_DOMAIN_MODEL.md § 3`: "quem é este usuário, e o que ele pode fazer" pertence inteiramente a Identity).
- **Controlar CRM, Financeiro, Projetos, Leads, Negócios, Agenda, Marketing** — proibido, explicitamente listado como "NÃO É RESPONSABILIDADE" (**Citada**, § 2 acima).

## 10. Possíveis Domain Services

Nenhum Domain Service pode ser proposto com confiança nesta missão. Os critérios oficiais de existência ([DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md § 2](../../../knowledge/engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md), reutilizados do Identity Domain) pressupõem Aggregates já confirmados — nenhum Aggregate deste domínio passou por esse processo ainda (§ 4).

**Único candidato hipotético identificado**: a cadeia de provisionamento descrita em [objects/Organization.md § AUTOMAÇÕES](../../../knowledge/core/objects/Organization.md) ("Quando criada: Criar Workspace padrão → Criar Admin → Criar Team padrão → Criar Pipeline padrão → Criar Dashboard padrão → ..."). Não modelável com confiança agora — atravessa múltiplos Bounded Contexts (Workspace, Identity, possivelmente Sales/Analytics), o que a torna candidata tanto a um Domain Service quanto a uma orquestração de nível ainda maior (Saga/Process Manager entre domínios, um conceito que nenhum documento oficial da NOVARIS define hoje). Decisão explicitamente adiada — ver § 13.

## 11. Eventos Candidatos

**Tensão já existente entre duas fontes oficiais, registrada, não resolvida**:

| Fonte | Eventos de `Organization` listados |
|---|---|
| [BOM.md § Organization](../../../knowledge/core/BOM.md) | `OrganizationCreated`, `OrganizationUpdated`, `OrganizationArchived` (3) |
| [objects/Organization.md § EVENTOS](../../../knowledge/core/objects/Organization.md) | `OrganizationCreated`, `OrganizationActivated`, `OrganizationUpdated`, `OrganizationSuspended`, `OrganizationPlanChanged`, `OrganizationBillingFailed`, `OrganizationArchived`, `OrganizationDeleted` (8) |

`OrganizationCreated` também aparece em [DOMAIN_MODEL.md § EVENT BUS](../../../knowledge/core/DOMAIN_MODEL.md) como um dos poucos "eventos oficiais" cross-domain da plataforma inteira — o único evento deste domínio com essa confirmação tripla.

**Nenhum evento oficial ainda** para `Workspace`, `Team`, `Subscription`, `Environment` — todos marcados `TODO` em [UBIQUITOUS_LANGUAGE.md](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md). Nenhum evento novo é proposto aqui para eles — seria fabricar conteúdo sem base.

## 12. Riscos Arquiteturais

- **Tensão de nomenclatura em quatro camadas** (§ 2) — risco de confusão de escopo entre "Workspace Domain" (Business Domain), "Organizations" (Kernel), e "Organization Domain" (esta missão) persistir até a implementação, se não resolvida antes de um futuro Blueprint.
- **`Plan` sem entrada própria em `BOM.md`** — `DOMAIN_MODEL.md` o lista como objeto do Workspace Domain, mas hoje é só um atributo enum (`plan`) de `Organization`. Risco: se planos customizados por Organization vierem a ser necessários, a modelagem atual (enum simples) não basta, e a divergência entre os dois documentos nunca foi resolvida.
- **Duplicidade de `Subscription` já registrada** (Workspace **e** Financial, `UBIQUITOUS_LANGUAGE.md`) — risco de a mesma entidade ser modelada duas vezes em domínios diferentes se não resolvida antes de qualquer Blueprint.
- **Divergência de eventos de `Organization`** (3 em `BOM.md` vs. 8 em `objects/Organization.md`, § 11) — risco de implementação inconsistente se não resolvida antes de codificar Domain Events reais.
- **Cadeia de provisionamento atravessa múltiplos Bounded Contexts** (§ 10) — risco de acoplamento indevido se implementada como chamada direta entre domínios em vez de orquestração via Eventos/APIs (`DOMAIN_MODEL.md § REGRAS`).
- **`Workspace`/`Team`/`Subscription`/`Environment` têm especificação extremamente rasa** (uma linha cada em `BOM.md`, nenhum tem Object Specification própria como `objects/Organization.md`) — risco de modelagem prematura sem base documental suficiente antes de Object Specifications próprias existirem.
- **Multi-tenancy é responsabilidade transversal, não exclusiva deste domínio** — RN001-RN004 já são aplicadas de forma independente em `IDENTITY_AGGREGATE_DESIGN_FREEZE.md` e `AGGREGATE_IMPLEMENTATION_STANDARD.md § 7`; risco de o Organization Domain ser tratado como "dono" de uma regra que, na prática, todo domínio da plataforma precisa implementar por conta própria.

## 13. Perguntas Ainda Não Decididas

Nenhuma decisão de negócio foi tomada para nenhum destes itens — `requer decisão` explícito, não inventado:

- `Workspace` é Aggregate Root próprio, Entity interna de `Organization`, ou um agrupamento lógico sem persistência própria?
- `Team` é Aggregate Root próprio ou Entity interna de `Organization`/`Workspace`?
- `Subscription` é Aggregate próprio do Workspace Domain, Value Object embutido em `Organization`, ou pertence inteiramente ao Financial Domain?
- `Environment` é conceito de domínio de negócio ou puramente técnico (Infrastructure)?
- `Plan` é um enum simples (como hoje) ou um objeto com ciclo de vida próprio (como `DOMAIN_MODEL.md` sugere)?
- Qual das duas listas de eventos de `Organization` (§ 11) é a canônica — a de `BOM.md` ou a de `objects/Organization.md`?
- Qual dos quatro nomes (§ 2) é o oficial para este domínio — "Workspace Domain", "Organizations", ou "Organization Domain"?
- A cadeia de provisionamento (§ 10, § 12) deve ser um Domain Service, uma Saga/Process Manager entre Bounded Contexts, ou pura orquestração de Application Layer via eventos?
- A estratégia técnica de isolamento multi-tenant (schema por tenant? RLS? coluna `organization_id`?) — `objects/Organization.md` já aponta para RLS, mas [architecture/multi-tenancy.md](../../../architecture/multi-tenancy.md) formal ainda é `TODO`.

## 14. Declaração de Não Implementação

Esta missão é exclusivamente de descoberta. **Nenhum código foi criado ou alterado** — nenhum arquivo `.ts`, nenhuma Entity, Value Object, Aggregate, Repository, Domain Service ou API. Nenhuma regra de negócio nova foi inventada — todo conteúdo marcado **Citada** já existia em documento oficial antes desta missão; todo conteúdo marcado **Proposto** ou **Hipótese** é explicitamente não vinculante, sujeito a confirmação em uma futura missão de Ubiquitous Language/Blueprint, seguindo o mesmo fluxo já formalizado para criação de novos domínios ([NOVARIS_ENGINEERING_HANDBOOK.md § 8](../../../knowledge/engineering/NOVARIS_ENGINEERING_HANDBOOK.md), validado pela sequência real do Identity Domain). Nenhum Aggregate, Repository ou Domain Service deste domínio pode ser implementado com base apenas neste documento — as perguntas da § 13 precisam de decisão explícita primeiro.

---

## Relação com Outros Módulos

- [services/kernel/organizations/README.md](README.md) — módulo Kernel já existente, cuja pasta este documento passa a habitar
- [knowledge/core/objects/Organization.md](../../../knowledge/core/objects/Organization.md) — Object Specification completa, fonte primária desta descoberta
- [knowledge/core/BOM.md](../../../knowledge/core/BOM.md), [knowledge/core/DOMAIN_MODEL.md](../../../knowledge/core/DOMAIN_MODEL.md), [knowledge/core/UBIQUITOUS_LANGUAGE.md](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md) — fontes de vocabulário e regras
- [services/kernel/identity/IDENTITY_DOMAIN_MODEL.md](../identity/IDENTITY_DOMAIN_MODEL.md) — precedente metodológico direto (mesma "Nota de Método", mesmo padrão Citada/Proposta) e origem da relação mútua já registrada (§ 8)
- [knowledge/engineering/NOVARIS_ENGINEERING_HANDBOOK.md § 8](../../../knowledge/engineering/NOVARIS_ENGINEERING_HANDBOOK.md) — fluxo formal de criação de novos domínios, próximo passo se esta descoberta for aprovada

## Status

🟢 Descoberta concluída (Missão ENG-0003.1). Nenhuma implementação de código. Aguardando aprovação do CTO antes de qualquer missão de Ubiquitous Language/Blueprint para este domínio.
