# Permission Domain — EPIC Planning

Versão: 1.0.0

Status: 🟡 EPIC-004 INITIALIZED — planejamento oficial, nenhuma arquitetura detalhada, nenhum código

Missão: ENG-0004.0 (Permission Domain Planning) — abre EPIC-004

Escopo: planejar integralmente o EPIC-004 antes de qualquer modelagem detalhada ou implementação, seguindo [KERNEL_DOMAIN_LIFECYCLE_V2.md](../../../knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md) (Fase 1). Nenhum Aggregate, Entity, Repository, Mapper, Value Object, Domain Service, teste, ADR ou código foi criado. Nenhum documento existente foi alterado.

---

## ⚠️ Achado Central — Registrado Antes do Planejamento

Antes de qualquer seção abaixo, um achado que molda todo este documento: **`Permission` já existe, implementada, congelada e fechada — dentro do Identity Domain, não como um domínio próprio.**

- [`IDENTITY_TECHNICAL_BLUEPRINT.md § 1, § 3`](../identity/IDENTITY_TECHNICAL_BLUEPRINT.md) (ENG-0002.2, 🟢 Oficial): `Permission` foi **reclassificada de candidato a Aggregate Root para Value Object** — "imutável, definida inteiramente pelo seu valor (`code`), sem ciclo de vida ou comportamento próprio além de existir dentro de um `Role`". Consequência explícita: "`Permission` não tem `Repository` próprio — é persistida como parte do Aggregate `Role`."
- Implementado em código real: [`services/kernel/identity/src/domain/value-objects/permission.ts`](../identity/src/domain/value-objects/permission.ts) (ENG-0002.3) — `Permission extends ValueObject<PermissionProps>`, formato `<domínio>.<recurso>.<ação>`.
- Os únicos Domain Events já nomeados sobre permissão (`PermissionGrantedToRole`, `PermissionRevokedFromRole`) já pertencem ao Identity Domain (`src/domain/domain-events/`, ENG-0002.7/.8).
- `IDENTITY_DOMAIN_CLOSURE.md` (ENG-0002.11) formalizou o Identity Domain como **congelado** — mudar essa decisão (reclassificar `Permission` de volta para Aggregate) exigiria uma ADR explícita, não uma missão de planejamento de outro Epic.

Ao mesmo tempo, `services/kernel/permissions/` existe como módulo de Kernel **separado**, desde `ARCH-001`/`ADR-0003`/`ADR-0004` (lista original de 20 módulos, "Fase B — Identidade": `identity`, `organizations`, `users`, `roles`, `permissions`, cinco pastas distintas). Na prática, `EPIC-002` já absorveu `users`/`roles`/`permissions` inteiramente dentro de `services/kernel/identity/` — as três pastas irmãs permanecem `🚧` scaffolding vazio, nunca usadas para código real (confirmado em `services/kernel/README.md § Status`).

**Isto não é resolvido por este documento.** É o objeto central da primeira missão do EPIC (§ 8, `ENG-0004.1`). Este Planning assume como possibilidades igualmente abertas: (a) o EPIC-004 conclui que não há domínio novo — `permissions/` é redirecionado para `identity/`, mesma disciplina de `NES/README.md` (ADR-0009); ou (b) existe um problema de domínio genuíno e distinto do já decidido (catálogo de permissões, motor de política/conflito), que não duplica `Permission` como Value Object.

## 1. Objetivo do Permission Domain

**Problema que este domínio *poderia* resolver**, condicionado à resolução do achado acima: `objects/Permission.md § 10` já registra, desde `ARCH-001`, uma lacuna nunca fechada — "nenhuma regra de resolução de conflito (ex.: permissão negada explicitamente vs. herdada de Role) foi definida ainda". O `AuthorizationDomainService` do Identity Domain (ENG-0002.10C) resolve hoje apenas o caso mais simples (um `Role` tem ou não tem uma `Permission`) — não resolve conflito, herança, negação explícita, nem validação de que um `code` de permissão corresponde a algo realmente registrado em algum domínio de negócio (`crm.leads.read` é só uma string validada por formato, nunca validada contra um catálogo real).

**O que este Epic definitivamente não é**: uma reimplementação do `Permission` Value Object, do `AuthorizationDomainService`, ou de qualquer Domain Event já implementado no Identity Domain. Fazer isso duplicaria uma decisão já congelada (`IDENTITY_DOMAIN_CLOSURE.md`) sem ADR.

## 2. Escopo

**Pode pertencer ao domínio** (candidatos a confirmar em `ENG-0004.1`/`.4`, nenhum decidido aqui):
- Um catálogo/registro de permissões válidas por domínio de negócio (existência/registro, não formato — formato já é resolvido pelo VO `Permission`).
- Regras de resolução de conflito entre permissões concedidas e negadas (`objects/Permission.md § 10`, lacuna nunca fechada).
- Composição/herança de permissões além do que `Role` já resolve hoje.

**Não pertence ao domínio** (fora de escopo, sem exceção):
- O Value Object `Permission` em si — já implementado e congelado no Identity Domain; qualquer mudança a ele exige ADR, não uma missão deste Epic.
- `AuthorizationDomainService`, `RoleAssignmentDomainService` — já implementados e congelados no Identity Domain.
- Qualquer Domain Event de concessão/revogação de permissão a um `Role` — já existe (`PermissionGrantedToRole`/`PermissionRevokedFromRole`, Identity).
- Autenticação, sessão, identidade de usuário — Identity Domain (`IDENTITY_DOMAIN_CLOSURE.md § 8`).
- Feature Flags por Organization — `services/kernel/feature-flags/` (módulo Kernel distinto, RN007 de `objects/Organization.md`).
- Configuração por Organization — `services/kernel/configuration/` (módulo Kernel distinto).
- Qualquer regra de negócio específica de CRM/Financial/Projects — Business Domains, nunca modelados por um módulo de Kernel.

## 3. Relações

- **Identity**: relação de dependência, nunca de duplicação. Se o EPIC-004 confirmar um Aggregate/Catálogo real, ele **referencia** `Permission` (o VO já existente) por valor — nunca reimplementa seu formato ou sua validação. `AuthorizationDomainService` continua sendo o único ponto de checagem simples Role↔Permission; um eventual motor de política deste domínio (se existir) seria consumido *por* uma futura evolução daquele Domain Service, não o substituiria unilateralmente sem uma missão própria de Identity.
- **Organization**: relação de referência, nunca de posse. Códigos de permissão são namespaced por domínio de negócio (`crm.leads.read`), não por `organizationId` — o VO `Permission` não é multi-tenant. Uma pergunta em aberto (não decidida aqui): um futuro catálogo de permissões precisaria de granularidade por Organization (ex.: permissões customizadas por plano)? Marcado como candidato a decisão futura, não presumido.
- **Audit**: dependência unidirecional — qualquer concessão, revogação ou verificação de permissão que este domínio vier a modelar deve ser auditável (mesmo requisito já registrado como RN006/bloqueado para `Organization`, `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md § 14`). `services/kernel/audit/` é quem resolve *como*; Permission Domain nunca implementa seu próprio mecanismo de auditoria.
- **Shared Kernel**: mesma base de todo domínio do Kernel — `AggregateRoot<T>`/`ValueObject<T>`/`Result<T,E>`/`Repository<T>`/hierarquia de erros — nenhuma abstração nova.
- **CRM**: relação estritamente inversa — CRM (e todo Business Domain) **consome** permissões para autorizar suas próprias ações; nunca o contrário. Permission Domain nunca depende de CRM ou de qualquer Business Domain — dependência nessa direção violaria `DOMAIN_MODEL.md § REGRAS` ("um domínio nunca acessa tabelas de outro domínio").

## 4. Aggregate Candidates

**Não é candidato**: `Permission` — já decidido como Value Object, congelado (`IDENTITY_TECHNICAL_BLUEPRINT.md § 3`). Reabri-lo como Aggregate exigiria ADR, fora do escopo de planejamento deste Epic.

**Candidatos a avaliar** (apenas identificados, nenhuma modelagem, nenhuma garantia de que sobrevivam à Discovery/Decisions):
- `PermissionCatalogEntry` (ou nome equivalente) — um registro formal de que um código de permissão existe e pertence a um domínio de negócio real, distinto da validação de formato que o VO `Permission` já faz.
- `PermissionPolicy` (ou nome equivalente) — se a lacuna de `objects/Permission.md § 10` (resolução de conflito) for confirmada como precisando de um objeto com ciclo de vida próprio, e não apenas de uma regra dentro do `AuthorizationDomainService` existente.

## 5. Value Object Candidates

Sem modelagem, sem implementação — apenas nomes candidatos a avaliar, todos sem definição em nenhuma fonte oficial hoje:
- `PermissionScope` — se um catálogo precisar descrever a que domínio/recurso uma entrada pertence, além do que o `code` do VO `Permission` já expressa.
- `PolicyEffect` (`Allow`/`Deny`) — só relevante se `PermissionPolicy` (§ 4) for confirmado.

Nenhum dos dois tem base documental hoje — ambos dependem inteiramente do resultado de `ENG-0004.1`/`.4`.

## 6. Domain Events Candidates

Sem definição — apenas nomes candidatos:
- `PermissionCatalogEntryRegistered` — só se `PermissionCatalogEntry` (§ 4) for confirmado.
- `PermissionPolicyDefined` — só se `PermissionPolicy` (§ 4) for confirmado.

**Explicitamente não candidatos**: `PermissionGranted`/`PermissionRevoked` (a um `Role`) — já existem como `PermissionGrantedToRole`/`PermissionRevokedFromRole` no Identity Domain; um evento com o mesmo significado neste domínio duplicaria um evento já implementado.

## 7. Riscos Arquiteturais

| Risco | Classificação |
|---|---|
| Reabrir, sem querer, uma decisão já congelada (`Permission` como VO, `IDENTITY_DOMAIN_CLOSURE.md`) durante a Discovery deste Epic | **Alto** |
| O Epic concluir que não há domínio novo genuíno — resultado válido (mesmo padrão de `ENG-0003.8`, zero código por falta de definição), mas deve ser aceito como desfecho possível desde já, não tratado como falha | **Alto** |
| Sobreposição de um eventual `PermissionPolicy`/`PermissionCatalogEntry` com `services/kernel/feature-flags/` ou `services/kernel/configuration/` (ambos também "regras configuráveis", ainda não implementados) | **Médio** |
| `objects/Permission.md` está quase inteiramente `TODO` (17 de 20 seções) — a Discovery pode não ter fonte suficiente para decidir sem correr risco de inventar | **Médio** |
| Nome/localização do módulo (`services/kernel/permissions/`) — já consistente com a convenção existente, sem risco de redirecionamento de caminho como ocorreu em `ENG-0003.1` | **Baixo** |

## 8. Plano do EPIC

Segue integralmente [KERNEL_DOMAIN_LIFECYCLE_V2.md § 3](../../../knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md) (Fase 1), sem pular etapas apesar de o achado central (acima) tornar plausível um encerramento antecipado:

```
ENG-0004.1 — Permission Domain Discovery
  Investigar e registrar formalmente a tensão com IDENTITY_TECHNICAL_BLUEPRINT.md § 3 /
  IDENTITY_DOMAIN_CLOSURE.md como primeiro entregável. Se a conclusão for "nenhum domínio
  novo" — o Epic pode encerrar já aqui, com um Domain Closure Review equivalente a
  "MERGED INTO IDENTITY", sem prosseguir às fases seguintes.
    ↓
ENG-0004.2 — Permission Domain Model (somente se Discovery confirmar domínio novo)
    ↓
ENG-0004.3 — Aggregate Design (rascunho, não congelado)
    ↓
ENG-0004.4 — Domain Decisions (+ ADR, se resolver a tensão com Identity exigir)
    ↓
ENG-0004.5 — Aggregate Design Freeze
    ↓
ENG-0004.6 — Technical Blueprint
    ↓
  [GATE: Architecture Approval — CTO]
    ↓
ENG-0004.7 — Aggregate Implementation
    ↓
ENG-0004.8 — Value Objects Review
    ↓
ENG-0004.9 — Repository Contract
    ↓
ENG-0004.10 — Repository Contract Tests
    ↓
  [GATE: Architecture Review — ARG]
    ↓
ENG-0004.11 — Persistence & Mapper Blueprint (documento único, per Lifecycle v2 § 4)
    ↓
ENG-0004.12 — Implementation Readiness Audit
    ↓
  [GATE: CTO Readiness Approval]
    ↓
ENG-0004.13 — Domain Closure Review
    ↓
  [GATE: CTO Final Approval] → EPIC-004 encerrado
```

## 9. Critérios de Encerramento

O EPIC-004 pode ser considerado concluído quando **um** dos dois desfechos ocorrer:

1. **Encerramento antecipado (Fase 1)** — `ENG-0004.1`/`.4` concluir formalmente que `Permission Domain` não tem existência independente além do que `Identity` já resolve; `services/kernel/permissions/README.md` é então candidato a redirecionamento (mesma disciplina de `NES/README.md`, ADR-0009) numa missão própria, futura, autorizada explicitamente para essa alteração.
2. **Encerramento pleno (Fase 5)** — um Domain Closure Review (`ENG-0004.13`) resulta em `APPROVED`, `APPROVED WITH RESTRICTIONS` ou `NOT APPROVED`, com todo Gate obrigatório de `KERNEL_DOMAIN_LIFECYCLE_V2.md § 4` executado.

Exige ADR quando: a resolução da tensão com Identity (§ "Achado Central") concluir que `Permission` deveria ter sido modelada de outra forma desde `ENG-0002.2` — mesmo critério já usado para `DEC-ORG-001`→`ADR-ORG-001`.

## 10. Status

🟡 **EPIC-004 INITIALIZED**. Planejamento oficial concluído. Nenhuma arquitetura detalhada, nenhum Aggregate, nenhum código. Próxima missão: `ENG-0004.1` (Permission Domain Discovery), condicionada à aprovação formal do CTO sobre este planejamento.

---

## Relação com Outros Módulos

- [KERNEL_DOMAIN_LIFECYCLE_V2.md](../../../knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md) — processo oficial que rege este Epic
- [IDENTITY_TECHNICAL_BLUEPRINT.md § 3](../identity/IDENTITY_TECHNICAL_BLUEPRINT.md), [IDENTITY_DOMAIN_CLOSURE.md](../identity/IDENTITY_DOMAIN_CLOSURE.md) — fonte do achado central desta missão
- [ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md](../organizations/ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md) — precedente direto de Domain Closure Review
- [knowledge/core/objects/Permission.md](../../../knowledge/core/objects/Permission.md) — Object Specification parcial, fonte de § 1, § 7
- [adr/ADR-0004](../../../adr/ADR-0004-mover-kernel-para-services.md), [adr/ADR-0006](../../../adr/ADR-0006-monorepo-structure-decision.md) — origem do módulo `services/kernel/permissions/` como scaffolding independente

## Status do Arquivo

🟡 Documento criado (Missão ENG-0004.0). Nenhum código, ADR, Aggregate, Value Object, Domain Service ou teste criado. Nenhum documento existente alterado. Aguardando aprovação formal do CTO.
