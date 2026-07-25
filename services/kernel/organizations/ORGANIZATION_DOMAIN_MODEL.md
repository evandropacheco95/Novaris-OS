# Organization Domain — Domain Model & Ubiquitous Language

Versão: 0.1.0

Status: 🟢 Oficial — modelagem, sem implementação

Missão: ENG-0003.2 (Organization Domain Model) — EPIC-003

Escopo: exclusivamente modelagem documental. Nenhum código, Aggregate, Entity, Value Object, Repository, Service ou Event real foi criado nesta missão. Nenhuma decisão ainda aberta em [ORGANIZATION_DOMAIN_DISCOVERY.md § 13](ORGANIZATION_DOMAIN_DISCOVERY.md) foi congelada — onde a descoberta não permitiu confiança suficiente, este documento reproduz a mesma incerteza, explicitamente, em vez de resolvê-la.

---

## Nota de Método (leia antes de tudo)

Mesma disciplina de [IDENTITY_DOMAIN_MODEL.md § Nota de Método](../identity/IDENTITY_DOMAIN_MODEL.md) e de [ORGANIZATION_DOMAIN_DISCOVERY.md § Nota de Método](ORGANIZATION_DOMAIN_DISCOVERY.md): todo conteúdo é marcado **Citada** (já oficial, fonte exata), **Proposta** (leitura razoável, não vinculante) ou **Em Aberto** (a Descoberta já registrou isso como não decidido — este documento não decide agora). Esta missão constrói **a partir exclusivamente** de `ORGANIZATION_DOMAIN_DISCOVERY.md` e das fontes já oficiais que ela já citou (`DOMAIN_MODEL.md`, `UBIQUITOUS_LANGUAGE.md`, `BOM.md`, `objects/Organization.md`) — nenhuma fonte nova foi consultada além do que a Descoberta já trazia, e [IDENTITY_DOMAIN_CLOSURE.md](../identity/IDENTITY_DOMAIN_CLOSURE.md), para o contrato de fronteira com o Identity Domain (§ 11).

**Regra explícita desta missão, diferente de `ENG-0002.1`**: onde a Descoberta marcou algo como "Hipótese, baixa confiança" ou item de § 13 (Perguntas Ainda Não Decididas), este documento **não escolhe um vencedor**. Ao contrário do que aconteceu com `Permission` em `IDENTITY_DOMAIN_MODEL.md § 4` (proposto como Aggregate Root, depois reclassificado no Blueprint seguinte), aqui a ambiguidade já identificada na Descoberta é preservada intacta — decidir precocemente seria "congelar decisão ainda aberta", expressamente proibido pela ordem de missão.

---

## 1. Ubiquitous Language

Fonte canônica: [UBIQUITOUS_LANGUAGE.md § Domínio: Workspace](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md) — **citada, não duplicada em detalhe** (já reproduzida em resumo em [ORGANIZATION_DOMAIN_DISCOVERY.md § 3](ORGANIZATION_DOMAIN_DISCOVERY.md)). Contém hoje 5 termos oficiais: `Organization`, `Workspace`, `Team`, `Subscription`, `Environment`.

### Termos explicitamente fora deste dicionário

`Party`, `Person`, `External Organization` — já catalogados no domínio `Relationship` (**Citada**, `UBIQUITOUS_LANGUAGE.md § Domínio: Relationship`); `Payment` — domínio `Financial`. Nenhum é redefinido aqui.

### Lacuna registrada, não uma nova entrada oficial

Nenhum dos 5 termos de `Workspace` tem os campos `Objetos Relacionados`/`Eventos Relacionados`/`APIs Relacionadas` completos em `UBIQUITOUS_LANGUAGE.md`, exceto `Organization` — os outros 4 têm `TODO` em pelo menos um campo. Mesma regra de método já usada em `UBIQUITOUS_LANGUAGE.md § Nota de Método 5`: nenhum campo `TODO` é preenchido aqui por inferência — permanece `TODO`.

---

## 2. Bounded Context

**Nome de trabalho usado neste documento**: **Organization Domain** — mesmo nome desta cadeia de missões (`ENG-0003.x`). Equivalente a **"Workspace Domain"** em [DOMAIN_MODEL.md](../../../knowledge/core/DOMAIN_MODEL.md) e à pasta real **`services/kernel/organizations/`** — os três nomes coexistem, nenhum foi eliminado. Qual é o nome oficial definitivo permanece **Em Aberto** (`ORGANIZATION_DOMAIN_DISCOVERY.md §§ 2, 13`) — usar um nome de trabalho aqui é necessário para escrever prosa legível, não é uma decisão sobre qual nome vence.

**Responsabilidade** (**Citada**, `DOMAIN_MODEL.md § WORKSPACE DOMAIN`, `objects/Organization.md § RESPONSABILIDADES`): organizações, times, espaços, configurações, branding, planos, billing, storage, feature flags, isolamento multi-tenant, permissões globais, integrações, auditoria, IA, ambientes, licenciamento.

**Posição na plataforma** (**Citada**, [DOMAIN_MODEL.md § DEPENDÊNCIAS](../../../knowledge/core/DOMAIN_MODEL.md)): segundo domínio da cadeia oficial — `Identity → Workspace → Relationship → Sales → Activity → Project → Marketing → Knowledge → AI → Automation → Financial → Analytics → System`. Depende de Identity; todos os domínios a partir de `Relationship` dependem, direta ou indiretamente, de Workspace já ter sido resolvido antes deles.

**⚠️ Tensão herdada, não resolvida por esta missão**: os quatro nomes para este domínio (`ORGANIZATION_DOMAIN_DISCOVERY.md § 2`), a divergência de eventos de `Organization` entre `BOM.md` e `objects/Organization.md` (§ 8 abaixo), e a dupla listagem de `Subscription` em Workspace e Financial — todas já registradas na Descoberta, reafirmadas aqui sem solução.

---

## 3. Domain Model — Visão Geral

O Organization Domain resolve uma pergunta central: **"qual empresa é dona desta informação, e como ela está configurada?"** — o mecanismo de isolamento multi-tenant que toda a plataforma depende (**Citada**, `objects/Organization.md`: "Toda a arquitetura Multi-Tenant da NOVARIS gira em torno deste objeto").

Diferente do Identity Domain — que na sua Descoberta equivalente (`IDENTITY_DOMAIN_MODEL.md`) já tinha três candidatos a Aggregate com base documental suficiente para propor com confiança — o Organization Domain tem **apenas um** candidato com essa mesma confiança (`Organization`); os demais (`Workspace`, `Team`, `Subscription`) têm apenas uma linha de definição em `BOM.md`, sem atributos, relacionamentos ou eventos — insuficientes para uma modelagem técnica real sem uma Object Specification própria (mesmo padrão que `objects/Organization.md` já é para `Organization`).

---

## 4. Principais Aggregates (propostos)

| Aggregate Root Proposto | Confiança | Justificativa |
|---|---|---|
| **Organization** | Alta — Proposta | Identidade própria, ciclo de vida documentado (`Created → Pending Configuration → Active → Suspended → Archived → Deleted`), eventos de transição de estado já nomeados (§ 8) — mesmo critério que confirmou `User` como Aggregate Root no Identity Domain (`IDENTITY_DOMAIN_MODEL.md § 4`) |

### Candidatos em aberto — não decididos nesta missão

| Candidato | Situação |
|---|---|
| **Workspace** | **Em Aberto** — pode ser Aggregate Root próprio ou Entity interna de `Organization`; `BOM.md` não define atributos, relacionamentos nem eventos (`ORGANIZATION_DOMAIN_DISCOVERY.md §§ 4, 13`) |
| **Team** | **Em Aberto** — mesma limitação de `Workspace` |
| **Subscription** | **Em Aberto** — além da limitação de especificação, ainda tem dupla listagem entre Workspace e Financial (`UBIQUITOUS_LANGUAGE.md`), não resolvida |

**Não proposto como Aggregate**: `Environment` — hipótese de ser conceito técnico (Infrastructure: ambiente de execução, produção/staging), não objeto de domínio de negócio; propor um Aggregate para ele seria transformar um objeto técnico em domínio, expressamente proibido por esta missão (`ORGANIZATION_DOMAIN_DISCOVERY.md §§ 4, 12, 13`).

---

## 5. Principais Entities (propostas)

Nenhuma Entity interna (não-raiz) pode ser proposta com confiança — mesma conclusão de `ORGANIZATION_DOMAIN_DISCOVERY.md § 5`. `Workspace` e `Team` são os candidatos mais prováveis a Entity (em vez de Aggregate Root independente), mas essa própria pergunta está **Em Aberto** (§ 4) — propor uma delas como Entity aqui seria decidir metade da pergunta sem decidir a outra metade, uma forma indireta de congelar uma decisão ainda aberta.

---

## 6. Principais Value Objects (previstos)

Nenhum Value Object está definido em nenhum documento oficial. Candidatos **propostos**, herdados sem alteração de `ORGANIZATION_DOMAIN_DISCOVERY.md § 6`, com base nos atributos já agrupados em [objects/Organization.md § ATRIBUTOS](../../../knowledge/core/objects/Organization.md):

| Value Object Proposto | Base |
|---|---|
| **Address** | `address`, `number`, `district`, `complement`, `city`, `state`, `zip_code`, `country` |
| **BrandingTheme** | `logo_url`, `favicon_url`, `primary_color`, `secondary_color`, `accent_color` |
| **Slug** | `slug` — já descrito como "Único"; candidato a validação de formato/unicidade |
| **Document** | `document` (CNPJ), possivelmente `state_registration`/`municipal_registration` |
| **Plan** | Hoje um enum simples (`Starter`/`Growth`/`Business`/`Enterprise`); se é Value Object ou Aggregate próprio permanece **Em Aberto** (`ORGANIZATION_DOMAIN_DISCOVERY.md § 13`) |

Nenhum destes tem forma, regra de validação ou comportamento definidos nesta missão — proposta de agrupamento de campos já citados, nada mais.

---

## 7. Domain Events Previstos

**⚠️ Fontes já oficiais divergem entre si — reproduzido sem escolher um vencedor** (mesma tensão de `ORGANIZATION_DOMAIN_DISCOVERY.md § 11`):

| Fonte | Eventos de `Organization` |
|---|---|
| [BOM.md § Organization](../../../knowledge/core/BOM.md) | `OrganizationCreated`, `OrganizationUpdated`, `OrganizationArchived` |
| [objects/Organization.md § EVENTOS](../../../knowledge/core/objects/Organization.md) | `OrganizationCreated`, `OrganizationActivated`, `OrganizationUpdated`, `OrganizationSuspended`, `OrganizationPlanChanged`, `OrganizationBillingFailed`, `OrganizationArchived`, `OrganizationDeleted` |

`OrganizationCreated` é o único confirmado nas duas listas **e** em [DOMAIN_MODEL.md § EVENT BUS](../../../knowledge/core/DOMAIN_MODEL.md) como evento oficial cross-domain — o único evento deste domínio com confirmação tripla.

**Nenhum evento proposto** para `Workspace`, `Team`, `Subscription` — todos `TODO` em `UBIQUITOUS_LANGUAGE.md`, e seus Aggregates/Entities de origem ainda **Em Aberto** (§ 4). Propor um evento para um objeto cuja própria natureza de Aggregate não foi decidida seria inventar estrutura sobre uma base que ainda não existe.

---

## 8. Casos de Uso Previstos

Derivados exclusivamente do que já está esboçado em [objects/Organization.md §§ API, AUTOMAÇÕES](../../../knowledge/core/objects/Organization.md) — **Citada**:

| Caso de Uso | Fonte |
|---|---|
| Criar Organization | `POST /organizations` |
| Consultar Organization (por id ou lista) | `GET /organizations`, `GET /organizations/:id` |
| Atualizar Organization | `PATCH /organizations/:id` |
| Remover Organization (soft delete, RN005) | `DELETE /organizations/:id` |
| Suspender Organization | `POST /organizations/:id/suspend` |
| Ativar Organization | `POST /organizations/:id/activate` |
| Alterar Plano da Organization | `POST /organizations/:id/change-plan` |
| Provisionar Organization (cadeia de automação ao criar) | `objects/Organization.md § AUTOMAÇÕES` — "Criar Workspace padrão → Criar Admin → Criar Team padrão → ..." |

O caso de uso "Provisionar Organization" atravessa múltiplos Bounded Contexts (já registrado como risco em `ORGANIZATION_DOMAIN_DISCOVERY.md §§ 10, 12`) — listado aqui como caso de uso observável, sem propor **como** ele deveria ser implementado (Domain Service, Saga, ou orquestração de Application Layer — pergunta **Em Aberto**).

---

## 9. Regras de Negócio de Alto Nível

Apenas regras já inferíveis de fontes oficiais — nenhum parâmetro não definido em nenhum documento foi inventado:

- Toda informação pertence obrigatoriamente a uma Organization (RN001, **Citada**, `objects/Organization.md`).
- Nenhuma consulta pode retornar dados de outra Organization (RN002).
- Toda API deve validar `organization_id` (RN003).
- Toda tabela obrigatoriamente possui `organization_id` (RN004).
- Soft Delete obrigatório para Organization (RN005).
- Auditoria obrigatória (RN006).
- Feature Flags, integrações, storage e billing pertencem à Organization, não a outro objeto (RN007-RN010).

**⚠️ Tensão interna encontrada em `objects/Organization.md`, registrada, não resolvida**: o diagrama de `§ LIFECYCLE` desenha uma cadeia estritamente linear (`Created → Pending Configuration → Active → Suspended → Archived → Deleted`, sem setas de volta), mas o próprio documento lista um endpoint `POST /organizations/:id/activate` e um evento `OrganizationActivated` (na lista de 8 eventos, § 7 acima) — o que sugere, sem confirmar explicitamente, que `Suspended → Active` (reativação) pode ser uma transição real, diferente do caso de `User` no Identity Domain, onde nenhuma fonte jamais sugeriu reativação (`IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 11`, "requer decisão", sem nenhuma evidência a favor). Aqui a evidência existe mas é ambígua (diagrama linear vs. API/evento não-linear) — **Em Aberto**, não presumido.

**Explicitamente `requer decisão`** (não inventado): regras de transição completas do ciclo de vida (quais transições são permitidas além da leitura direta do diagrama linear); política de mudança de plano (upgrade/downgrade, proração); limites (`max_users`, `max_storage`) — o que acontece ao excedê-los; unicidade de `slug` (por si só ou globalmente — o atributo diz "Único" mas não especifica o escopo).

---

## 10. Dependências com Outros Domínios

| Dependência | Direção | Fonte |
|---|---|---|
| Identity | Organization Domain depende de | `objects/Organization.md § AUTOMAÇÕES` ("Criar Admin" no provisionamento); `services/kernel/organizations/README.md § Dependências` já lista `Identity` |
| Identity | Identity também depende de Organization | `IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 4, 6` — todo `User`/`Role` carrega `organizationId` obrigatório; dependência mútua já registrada em `IDENTITY_DOMAIN_MODEL.md § 10` e reafirmada em `ORGANIZATION_DOMAIN_DISCOVERY.md § 8` |
| Logging, Event Bus | Organization Domain depende de | `services/kernel/organizations/README.md § Dependências` |
| Financial | Tensão de sobreposição, não dependência confirmada | `Subscription` citado em Workspace **e** Financial por `DOMAIN_MODEL.md` (`UBIQUITOUS_LANGUAGE.md`) — não resolvido, ver § 4 |
| Todos os domínios a partir de `Relationship` | Dependem de Workspace | `DOMAIN_MODEL.md § DEPENDÊNCIAS` |

### Contrato de fronteira com o Identity Domain (já congelado do lado de lá)

**Citada integralmente**, [IDENTITY_DOMAIN_CLOSURE.md §§ 8-9](../identity/IDENTITY_DOMAIN_CLOSURE.md) — este domínio, ao consumir Identity, deve respeitar o contrato **já fechado**:

- **Permitido**: referenciar `UserId`, `OrganizationId`, `RoleId` (todos `UniqueEntityId`), e valores de `Permission`.
- **Proibido**: acessar tabelas internas do Identity Domain, conhecer suas regras internas (transições de status de `User`, formato de `Permission`), ou alterar `User`/`Role` diretamente — toda mutação passa pelos métodos públicos dos Aggregates de Identity, nunca por manipulação externa.

Nenhuma violação deste contrato é proposta neste documento — nenhum Aggregate/Entity/VO deste domínio (§§ 4-6) referencia `User`/`Role` de nenhuma forma além de, no futuro, um `UserId` de referência (ex.: "quem é o administrador desta Organization" — não modelado aqui, apenas citado como uso legítimo já previsto pelo contrato).

---

## Relação com Outros Módulos

- [ORGANIZATION_DOMAIN_DISCOVERY.md](ORGANIZATION_DOMAIN_DISCOVERY.md) — base exclusiva desta missão (Missão ENG-0003.1)
- [README.md](README.md), [services/kernel/organizations/](README.md) — módulo de serviço `organizations`
- [knowledge/core/DOMAIN_MODEL.md](../../../knowledge/core/DOMAIN_MODEL.md), [knowledge/core/UBIQUITOUS_LANGUAGE.md](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md), [knowledge/core/BOM.md](../../../knowledge/core/BOM.md) — fontes de vocabulário e regras
- [knowledge/core/objects/Organization.md](../../../knowledge/core/objects/Organization.md) — Object Specification, fonte primária de atributos/eventos/regras
- [services/kernel/identity/IDENTITY_DOMAIN_MODEL.md](../identity/IDENTITY_DOMAIN_MODEL.md) — precedente metodológico direto (mesma Nota de Método)
- [services/kernel/identity/IDENTITY_DOMAIN_CLOSURE.md](../identity/IDENTITY_DOMAIN_CLOSURE.md) — contrato de fronteira já congelado do lado Identity (§ 10 acima)
- [packages/shared-kernel/](../../../packages/shared-kernel/README.md) — blocos que uma futura implementação deste domínio vai consumir (`AggregateRoot<T>`, `ValueObject<T>`, `DomainEvent`, `Repository<T>`, `DomainService` — quando/se as perguntas em aberto forem decididas)

## Status

🟢 Modelagem de domínio concluída (Missão ENG-0003.2). Nenhuma implementação de código. Nenhuma decisão ainda aberta em `ORGANIZATION_DOMAIN_DISCOVERY.md § 13` foi congelada por esta missão. Aguardando aprovação do CTO antes de qualquer missão de implementação.
