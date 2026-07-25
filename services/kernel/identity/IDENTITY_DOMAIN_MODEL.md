# Identity — Domain Model & Ubiquitous Language

Versão: 0.1.0

Status: 🟢 Oficial — modelagem, sem implementação

Missão: ENG-0002.1 (Identity Ubiquitous Language) — EPIC-002, Sprint-002

Escopo: exclusivamente modelagem de domínio. Nenhum código, Entity, Value Object, Repository, Service ou API foi implementado nesta missão.

---

## Nota de Método (leia antes de tudo)

Todo termo/objeto/evento abaixo que já é oficial em outro documento (`BOM.md`, `DOMAIN_MODEL.md`, `UBIQUITOUS_LANGUAGE.md`, `services/kernel/identity/CONTRACT.md`, `objects/User.md`) é **citado, não reescrito**. Onde a missão pede algo que nenhum documento anterior definiu (Aggregates, Value Objects, casos de uso, regras de negócio de alto nível), o conteúdo é marcado explicitamente como **proposto** — uma leitura razoável para viabilizar a implementação futura, não uma decisão já tomada. Nenhuma proposta aqui vira regra vinculante sem ADR ou aprovação explícita quando a implementação (fora do escopo desta missão) começar.

---

## 1. Ubiquitous Language

A fonte canônica do vocabulário oficial é [knowledge/core/UBIQUITOUS_LANGUAGE.md § "Domínio: Core (= Identity Domain)"](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md) — **não duplicado aqui**. Contém hoje: `User`, `Role`, `Permission`, `API Key` (os 4 objetos do domínio Identity que já estão catalogados em [BOM.md](../../../knowledge/core/BOM.md)).

### Lacuna registrada, não uma nova entrada oficial

[DOMAIN_MODEL.md — Identity Domain](../../../knowledge/core/DOMAIN_MODEL.md) lista 7 objetos para o domínio Identity: `User`, `Role`, `Permission`, `Session`, `IdentityProvider`, `Token`, `API Key`. Apenas 4 estão em `BOM.md` — `Session`, `IdentityProvider` e `Token` **não são termos oficiais** ainda (regra de `UBIQUITOUS_LANGUAGE.md § Nota de Método 1`: nenhum termo entra no dicionário sem estar no BOM). Termos **propostos** abaixo, para uso interno desta missão até uma extensão formal do BOM (por ADR, `BOM.md § 1`):

| Termo Proposto | Definição Proposta | Por que ainda não é oficial |
|---|---|---|
| **Session** | Representa uma sessão autenticada ativa de um `User`, com tempo de vida próprio | Não catalogado em `BOM.md`; já usado em `services/kernel/identity/CONTRACT.md` (`createSession`, `revokeSession`) sem definição formal |
| **IdentityProvider** | Representa uma fonte externa de autenticação (SSO) associada a uma Organization ou User | Não catalogado em `BOM.md`; nasce da responsabilidade "SSO" do Identity Domain |
| **Token** | Representa uma credencial de curta duração (ex.: access token, refresh token) associada a uma Session | Não catalogado em `BOM.md`; distinto de `API Key` (que é de longa duração, sistema-a-sistema) |

## 2. Bounded Context

**Nome**: Identity Domain (equivalente ao termo "Core" usado em algumas ordens de missão anteriores — ver `UBIQUITOUS_LANGUAGE.md § Nota de Método 2`).

**Responsabilidade** ([DOMAIN_MODEL.md](../../../knowledge/core/DOMAIN_MODEL.md)): usuários, autenticação, autorização, perfis, roles, permissões, sessões, tokens, SSO, MFA, audit login.

**Posição na plataforma**: primeiro domínio sob o Platform Kernel, primeiro elo da cadeia de dependências oficial — [DOMAIN_MODEL.md § DEPENDÊNCIAS](../../../knowledge/core/DOMAIN_MODEL.md): `Identity → Workspace → Relationship → Sales → Activity → Project → Marketing → Knowledge → AI → Automation → Financial → Analytics → System`. Nenhum outro domínio pode ser implementado antes de Identity.

**⚠️ Tensão registrada, não resolvida por esta missão**: `DOMAIN_MODEL.md` trata "Identity" como **um** bounded context. A estrutura real do Kernel já o divide em **4 módulos de serviço separados**: [services/kernel/identity/](README.md) (autenticação/sessão), [services/kernel/users/](../users/README.md) (gestão de usuário), [services/kernel/roles/](../roles/README.md) (papéis) e [services/kernel/permissions/](../permissions/README.md) (permissões granulares) — cada um com seu próprio `README.md` e grafo de dependência entre si (`users`→Identity, `roles`→Identity, `permissions`→Identity+Organizations). Esta mesma tensão já estava registrada em `PROJECT_RULES.md § Nota sobre knowledge/core/IMPLEMENTATION_ROADMAP.md`. Esta missão documenta o Bounded Context **conforme `DOMAIN_MODEL.md` o define** (um domínio); a decisão de manter os 4 módulos de serviço separados ou consolidá-los fica para uma missão de implementação futura, com ADR se alterar a estrutura já existente.

**Fora do escopo do Bounded Context Identity** (pertencem a outros domínios): Organization/Workspace em si (Workspace Domain), Teams como unidade organizacional própria além de "agrupamento de usuários" (BOM.md `Team`, sem domínio definido em `DOMAIN_MODEL.md` — ver `UBIQUITOUS_LANGUAGE.md § Sem Domínio Atribuído`).

## 3. Domain Model — Visão Geral

O domínio Identity resolve uma pergunta central: **"quem é este usuário, e o que ele pode fazer?"** — dividida em duas responsabilidades que hoje já aparecem separadas na estrutura real do Kernel:

1. **Autenticação/Sessão** (`services/kernel/identity/`): estabelecer e verificar "quem é o usuário" — login, sessão, token, SSO, MFA.
2. **Autorização** (`services/kernel/roles/`, `services/kernel/permissions/`): estabelecer "o que o usuário pode fazer" — Role como agrupamento nomeado de Permissions, Permission como ação autorizável granular no formato `<domínio>.<recurso>.<ação>` ([BOM.md § Permission](../../../knowledge/core/BOM.md)).

Todo objeto do domínio pertence a uma Organization (multi-tenancy) — "Toda informação pertence obrigatoriamente a uma Organization" ([objects/Organization.md](../../../knowledge/core/objects/Organization.md)); Identity não é exceção.

## 4. Principais Aggregates (propostos)

| Aggregate Root | Justificativa |
|---|---|
| **User** | Já é o objeto central do domínio em `BOM.md`/`DOMAIN_MODEL.md`; tem eventos próprios (`UserCreated`, `UserInvited`, `UserActivated`, `UserDisabled`) que só fazem sentido como transições de estado de um Aggregate. Fronteira de consistência proposta: um `User` mais suas Sessions ativas (referenciadas, não embutidas — Session tem ciclo de vida próprio). |
| **Role** | Agrupamento nomeado de Permissions ([BOM.md § Role](../../../knowledge/core/BOM.md)); candidato a Aggregate Root separado de `User` porque Roles são compartilhados/reutilizados entre múltiplos Users — não fazem sentido como parte da fronteira de consistência de um único User. |
| **Permission** | Já tem Object Specification própria (`objects/Permission.md`) e é referenciada por `Role`, não o contrário — candidato a Aggregate Root próprio, embora pequeno (pode vir a ser reavaliado como Value Object em uma futura ADR, ver § 6). |

**Não proposto como Aggregate**: `Session`, `IdentityProvider`, `Token` — ainda não são termos oficiais (§ 1); qualquer fronteira de consistência para eles é prematura antes de uma extensão formal do BOM.

## 5. Principais Entities (propostas)

Mesma lista de Aggregate Roots do § 4 — nenhuma Entity interna (não-raiz) foi identificada nas fontes já oficiais. Se `Session` for formalizada no BOM futuramente, é candidata a Entity referenciada por `User` (tem identidade própria e ciclo de vida, mas não é o Aggregate Root do domínio).

## 6. Principais Value Objects (previstos)

Nenhum Value Object para o domínio Identity está definido em nenhum documento oficial hoje. Candidatos propostos, com base no formato/uso já documentado:

| Value Object Proposto | Base |
|---|---|
| **PermissionCode** | O formato `<domínio>.<recurso>.<ação>` de `Permission` já é citado com exemplos reais (`crm.leads.read`, `financial.invoice.delete` — [BOM.md](../../../knowledge/core/BOM.md)) — candidato natural a Value Object que valida o formato, em vez de tratar o código como `string` livre. |
| **Email** | `verifyCredentials(email: string, password: string)` já existe em `CONTRACT.md`; nenhum documento formaliza `Email` como Value Object ainda, mas é o padrão já usado em `ValueObject<T>` (Shared Kernel, ENG-0001.2) para dados com validação de formato. |

**Explicitamente fora desta lista**: `Password`/`HashedPassword` — a missão proíbe qualquer decisão de tecnologia de hashing (nenhum `PasswordHasher` foi implementado nem mencionado em nenhum documento); modelar o Value Object antes de decidir o mecanismo seria antecipar uma decisão de infraestrutura.

## 7. Domain Events Previstos

**Já oficiais** ([BOM.md § User](../../../knowledge/core/BOM.md)): `UserCreated`, `UserInvited`, `UserActivated`, `UserDisabled`.

**Propostos** (nenhum documento oficial nomeia eventos para Role/Permission ainda — `UBIQUITOUS_LANGUAGE.md` marca "Eventos Relacionados: TODO" para ambos):

| Evento Proposto | Aggregate |
|---|---|
| `RoleCreated`, `RoleAssignedToUser`, `RoleRevokedFromUser` | Role |
| `PermissionGrantedToRole`, `PermissionRevokedFromRole` | Permission / Role |
| `SessionCreated`, `SessionRevoked` | Session (termo ainda proposto, § 1) — nomes já usados como funções em `CONTRACT.md` (`createSession`, `revokeSession`), aqui propostos como Domain Events equivalentes |

Todo evento, oficial ou proposto, segue o contrato `DomainEvent` do Shared Kernel (`eventId`, `aggregateId`, `occurredAt`, `eventName` — ENG-0001.5) quando a implementação começar.

## 8. Casos de Uso Previstos

Derivados da interface já esboçada em [CONTRACT.md](CONTRACT.md) e das responsabilidades de [DOMAIN_MODEL.md](../../../knowledge/core/DOMAIN_MODEL.md):

| Caso de Uso | Fonte |
|---|---|
| Autenticar usuário (verificar credenciais) | `CONTRACT.md § verifyCredentials` |
| Criar sessão | `CONTRACT.md § createSession` |
| Revogar sessão (idempotente — revogar sessão já revogada não é erro) | `CONTRACT.md § revokeSession`, citado literalmente |
| Consultar usuário por id | `CONTRACT.md § getUser` |
| Convidar usuário | Evento `UserInvited` já oficial (`BOM.md`) — implica um caso de uso de convite |
| Ativar / Desativar usuário | Eventos `UserActivated`/`UserDisabled` já oficiais |
| Atribuir Role a um usuário | Responsabilidade "Roles" (`DOMAIN_MODEL.md`) + relacionamento `User`↔`Roles` (`BOM.md`) |
| Verificar permissão (autorização) | Responsabilidade "Permissões" (`DOMAIN_MODEL.md`); `services/kernel/permissions/README.md § Objetivo` ("verificação de autorização") |
| Login via SSO | Responsabilidade "SSO" (`DOMAIN_MODEL.md`) — sem detalhamento técnico ainda, `requer decisão` |
| Habilitar/verificar MFA | Responsabilidade "MFA" (`DOMAIN_MODEL.md`) — sem detalhamento técnico ainda, `requer decisão` |
| Registrar login para auditoria | Responsabilidade "Audit Login" (`DOMAIN_MODEL.md`); `objects/User.md § 17 Auditoria` |

## 9. Regras de Negócio de Alto Nível

Apenas regras já inferíveis de fontes oficiais — nenhum parâmetro numérico ou de política (expiração de sessão, complexidade de senha, tentativas de login) foi definido em nenhum documento, então nenhum é declarado aqui:

- Todo `User` pertence a uma `Organization` (multi-tenancy obrigatório — `objects/Organization.md`: "Toda informação pertence obrigatoriamente a uma Organization").
- `User` não define suas próprias permissões diretamente — é titular de `Role`(s); `Role` é quem agrupa `Permission`(s) (`objects/User.md § 4 Não Responsabilidades`).
- Revogar uma sessão já revogada não é erro — operação idempotente (`CONTRACT.md § revokeSession`).
- `verifyCredentials` nunca retorna a senha nem qualquer dado sensível além da sessão (`CONTRACT.md`).
- `Permission` segue o formato `<domínio>.<recurso>.<ação>` (`BOM.md`).

**Explicitamente `requer decisão`** (não inventado): política de expiração de sessão/token, regras de complexidade de senha, número de tentativas de login antes de bloqueio, mecanismo de MFA, provedores de SSO suportados, condições de falha e como são sinalizadas (`CONTRACT.md § Erros`, já marcado TODO).

## 10. Dependências com Outros Domínios

| Dependência | Direção | Fonte |
|---|---|---|
| Logging | Identity depende de | `CONTRACT.md`, `README.md` |
| Event Bus | Identity depende de | `CONTRACT.md`, `README.md` |
| Workspace (Organization) | Identity depende de | Multi-tenancy obrigatório (§ 9); `services/kernel/organizations/README.md` também depende de Identity — dependência mútua já registrada na estrutura real do Kernel |
| Todos os demais 12 domínios | Dependem de Identity | `DOMAIN_MODEL.md § DEPENDÊNCIAS` — Identity é o primeiro elo da cadeia; nenhum domínio de negócio pode ser implementado antes dele |

---

## Relação com Outros Módulos

- [README.md](README.md) — visão geral do módulo de serviço `identity`
- [CONTRACT.md](CONTRACT.md) — interface pública já esboçada (Missão ARCH-001)
- [knowledge/core/DOMAIN_MODEL.md](../../../knowledge/core/DOMAIN_MODEL.md) — definição oficial do Identity Domain
- [knowledge/core/UBIQUITOUS_LANGUAGE.md](../../../knowledge/core/UBIQUITOUS_LANGUAGE.md) — dicionário oficial (fonte canônica dos termos já no BOM)
- [knowledge/core/BOM.md](../../../knowledge/core/BOM.md) — catálogo de objetos (`User`, `Role`, `Permission`, `API Key`)
- [knowledge/core/objects/User.md](../../../knowledge/core/objects/User.md), [Role.md](../../../knowledge/core/objects/Role.md), [Permission.md](../../../knowledge/core/objects/Permission.md) — Object Specifications parciais
- [packages/shared-kernel/](../../../packages/shared-kernel/README.md) — `AggregateRoot<T>`, `ValueObject<T>`, `DomainEvent`, `Repository<T>`, `DomainService`, `Specification<T>` — blocos que a futura implementação de Identity vai consumir

## Status

🟢 Modelagem de domínio concluída (Missão ENG-0002.1). Nenhuma implementação de código, Entity, Value Object, Repository, Service ou API. Aguardando aprovação do CTO antes de qualquer missão de implementação.
