# Identity — Aggregate Design Freeze

Versão: 1.0.0

Status: 🟢 Oficial — definição definitiva, sem implementação

Missão: ENG-0002.5 (Identity Aggregate Design Freeze) — EPIC-002, Sprint-002

Escopo: consolidar e congelar a definição estrutural dos Aggregates do domínio Identity, sobre a base já aprovada em [IDENTITY_DOMAIN_MODEL.md](IDENTITY_DOMAIN_MODEL.md) (ENG-0002.1), [IDENTITY_TECHNICAL_BLUEPRINT.md](IDENTITY_TECHNICAL_BLUEPRINT.md) (ENG-0002.2) e os Value Objects reais (ENG-0002.3). Nenhum código TypeScript, Entity, Repository, Service ou Infrastructure criados aqui.

**O que "congelar" significa aqui**: a **estrutura** (quais Aggregates existem, o que cada um possui, seus limites transacionais, suas relações) fica fixa — mudá-la exige ADR a partir de agora. Isso é diferente de **parâmetros de regra de negócio** ainda não decididos (ex.: se `Email` é único por Organization ou globalmente) — esses continuam `requer decisão`, e decidi-los não altera a estrutura, então não precisam de ADR quando forem resolvidos.

---

## 1. Aggregate Roots

Definitivo — dois Aggregate Roots, sem mudança em relação a `IDENTITY_TECHNICAL_BLUEPRINT.md § 1`:

| Aggregate Root | Fonte |
|---|---|
| `User` | `extends AggregateRoot<UserProps>`, `implements Auditable, Versionable, HasMetadata<UserMetadata>` |
| `Role` | `extends AggregateRoot<RoleProps>`, `implements Auditable, Versionable` |

Nenhum terceiro Aggregate Root — `Permission` permanece Value Object (reclassificado na ENG-0002.2, código real na ENG-0002.3, avaliação de Policy na ENG-0002.4 não alterou isso).

## 2. Child Entities

Definitivo — **nenhuma**. Confirmado três vezes agora (`IDENTITY_DOMAIN_MODEL.md § 5`, `IDENTITY_TECHNICAL_BLUEPRINT.md § 2`, esta missão): nem `User` nem `Role` têm filhos com identidade própria dentro de sua fronteira de consistência.

## 3. Value Objects por Aggregate

| Aggregate | Value Object | Cardinalidade | Código real |
|---|---|---|---|
| `User` | `Email` | 1:1 | [src/domain/value-objects/email.ts](src/domain/value-objects/email.ts) (ENG-0002.3) |
| `Role` | `Permission` | 1:N (array) | [src/domain/value-objects/permission.ts](src/domain/value-objects/permission.ts) (ENG-0002.3) |

## 4. Ownership

"Owns" = vive dentro da fronteira transacional do Aggregate, é salvo/carregado junto com ele. "References" = aponta para a identidade (`UniqueEntityId`) de outro Aggregate, carregado separadamente via seu próprio Repository.

| Aggregate | Owns (dentro da fronteira) | References (fora da fronteira) |
|---|---|---|
| `User` | `id`, `email: Email`, `status`, `createdAt/updatedAt/createdBy/updatedBy`, `version`, `metadata` | `organizationId` (Organization, domínio Workspace), `roleIds: UniqueEntityId[]` (Role) |
| `Role` | `id`, `name`, `permissions: Permission[]`, `createdAt/updatedAt/createdBy/updatedBy`, `version` | `organizationId` (Organization, domínio Workspace) |

`Permission` não aparece como "owner" de nada — é Value Object terminal, não possui referências próprias.

## 5. Limites Transacionais

Definitivo — reafirma `IDENTITY_TECHNICAL_BLUEPRINT.md § 9`:

- Uma transação de escrita nunca cruza dois Aggregates. `UserRepository.save()` grava só `User`; `RoleRepository.save()` grava só `Role`.
- Atribuir/revogar `Role` a um `User` é uma operação transacional só sobre `User` (`roleIds` é uma lista de referências).
- Conceder/revogar `Permission` em um `Role` é uma operação transacional só sobre `Role` (`permissions` é embutido).

## 6. Invariantes

Definitivo (estrutura) / continua aberto (parâmetros) — reafirma `IDENTITY_TECHNICAL_BLUEPRINT.md § 8`, sem alteração:

| Invariante | Aggregate | Status |
|---|---|---|
| `id` é imutável após a criação | User, Role | Citada |
| Todo `User`/`Role` pertence a exatamente uma Organization | User, Role | Citada |
| `Permission.code` segue `<domínio>.<recurso>.<ação>` | Permission (VO) | Citada, validada em código (ENG-0002.3) |
| `User` "disabled" não pode autenticar | User | Proposta |
| `Role.name` único dentro de uma Organization | Role | Proposta |
| `User` não pode ser seu próprio `createdBy` na criação | User | Proposta |

`Email` único por Organization ou globalmente, número máximo de `Role`s por `User`, remoção de `Role` com `User`s atribuídos: continuam `requer decisão` — não são decisões estruturais, não bloqueiam o freeze desta missão.

## 7. Navegação entre Objetos

- **`User` → `Role`**: indireta, via `RoleRepository.findById(roleId)` para cada id em `user.roleIds` — nunca um ponteiro em memória, sempre uma nova consulta.
- **`Role` → `Permission`**: direta, `role.permissions` já é o array de Value Objects em memória — nenhuma consulta necessária.
- **`Role` → `User`**: **não existe** — nenhum Aggregate mantém referência reversa. Encontrar "quais Users têm este Role" é uma consulta (`UserRepository`, filtro por `roleIds` contém o id), não uma navegação de grafo a partir de `Role`.
- **`User`/`Role` → `Organization`**: indireta, via `organizationId` e um repositório do domínio Workspace (fora do escopo de Identity).

## 8. Relações Permitidas

- `User` referencia `Role` por `UniqueEntityId` (nunca embute o objeto `Role`).
- `Role` embute `Permission` por valor (Value Object, nunca por referência/id).
- `User`/`Role` referenciam `Organization` por `UniqueEntityId`.

## 9. Relações Proibidas

- `Role` **nunca** mantém referência (`userIds` ou similar) de volta para `User` — quebraria a independência do Aggregate e gargalos de escrita (todo `Role` compartilhado por muitos `User`s viraria hotspot de transação).
- `User` **nunca** embute o objeto `Role` completo — violaria o limite transacional (§ 5) e criaria cópias obsoletas.
- `Permission` **nunca** referencia nada — é Value Object terminal.
- Nenhum Aggregate muta o estado interno de outro diretamente; toda mudança passa pelos métodos do próprio Aggregate, após carregá-lo via seu Repository.
- **Proposta, não confirmada em nenhuma fonte anterior**: `User.roleIds` só pode referenciar `Role`s da mesma Organization do `User` (cross-Organization proibido) — decorre da invariante de multi-tenancy já citada (§ 6), tornada explícita aqui pela primeira vez.

## 10. Regras de Consistência

- **Forte, dentro de um Aggregate**: toda invariante de `User` ou `Role` (§ 6) vale imediatamente após qualquer operação sobre aquele Aggregate, dentro da mesma transação/`save()`.
- **Eventual, entre Aggregates**: não há garantia transacional entre `User` e o(s) `Role`(s) que ele referencia. Se um `Role` for removido enquanto ainda referenciado por `roleIds` de algum `User`, isso é uma referência órfã — **requer decisão** (política de remoção de `Role`, já registrada como aberta em `IDENTITY_TECHNICAL_BLUEPRINT.md § 8/§ 13`, não resolvida por este freeze).

## 11. Ciclo de Vida

Definitivo — reafirma `IDENTITY_TECHNICAL_BLUEPRINT.md § 13`:

```
User:  [Criado] --UserInvited--> [Convidado] --UserActivated--> [Ativo] --UserDisabled--> [Desativado]
Role:  [Criado] --PermissionGrantedToRole/PermissionRevokedFromRole--> permissions muda
Permission: sem ciclo de vida próprio — existe só dentro de um Role
```

Reativação de `User` desativado e remoção de `Role`: continuam `requer decisão`.

## 12. Matriz Aggregate × Components

| Componente | User | Role |
|---|---|---|
| Child Entities | — | — |
| Value Objects próprios | `Email` (1:1) | `Permission` (1:N) |
| Domain Events | `UserCreated`, `UserInvited`, `UserActivated`, `UserDisabled` | `RoleCreated`, `RoleAssignedToUser`\*, `RoleRevokedFromUser`\*, `PermissionGrantedToRole`, `PermissionRevokedFromRole` |
| Specifications aplicáveis | `UserIsActiveSpecification` | `RoleHasPermissionSpecification` |
| Repository | `UserRepository` (`ReadRepository<User>` + `WriteRepository<User>`) | `RoleRepository` (`ReadRepository<Role>` + `WriteRepository<Role>`) |
| Domain Services associados | `AuthenticationDomainService` (produz `User`), `AuthorizationDomainService` (lê `User`) | `AuthorizationDomainService` (lê `Role`) |

\* `RoleAssignedToUser`/`RoleRevokedFromUser` mudam `User.roleIds` — listados sob `Role` porque nomeiam o `Role` envolvido, mas tecnicamente são eventos do Aggregate `User` (consistente com § 5: a operação é transacional sobre `User`). Ambiguidade herdada de `IDENTITY_TECHNICAL_BLUEPRINT.md § 7`, esclarecida aqui, não alterada.

---

## Validação de Consistência

- **Shared Kernel**: ✅ — todo componente citado (`AggregateRoot`, `ValueObject`, `Auditable`/`Versionable`/`HasMetadata`, `DomainEvent`, `Specification`/`AbstractSpecification`, `Repository`/`ReadRepository`/`WriteRepository`, `DomainService`/`AsyncDomainService`) já existe em `@novaris/shared-kernel` (EPIC-001); nenhum componente novo necessário.
- **Identity Domain Model**: ✅ — nenhuma contradição com `IDENTITY_DOMAIN_MODEL.md`; Bounded Context e Ubiquitous Language não alterados.
- **Identity Technical Blueprint**: ✅ — este documento consolida `IDENTITY_TECHNICAL_BLUEPRINT.md §§ 1, 2, 3, 8, 9, 12, 13`; nenhum valor divergente, só reorganização + 5 seções novas (Ownership, Navegação, Relações Permitidas/Proibidas, Regras de Consistência, Matriz).
- **Ubiquitous Language**: ✅ — nenhum termo novo introduzido; `User`, `Role`, `Permission`, `Email`, `Organization` já são todos termos existentes.
- **DDD Tactical Patterns**: ✅ — Aggregate Root, Value Object, referência por id entre Aggregates, embedding só dentro da própria fronteira — padrão clássico (Evans/Vernon), consistente com `ENGINEERING_PLAYBOOK.md § 3`.
- **ENGINEERING_PLAYBOOK.md**: ✅ — Domain Layer isolada (§ 2-3), nenhuma dependência de Infrastructure/Interface.

## Declaração de Freeze

A partir desta missão, o desenho estrutural dos Aggregates `User` e `Role` está **congelado**: adicionar/remover um Aggregate, mudar seu Ownership (§ 4), seu limite transacional (§ 5) ou suas Relações Permitidas/Proibidas (§§ 8-9) exige um ADR. Decidir um parâmetro já marcado `requer decisão` (§§ 6, 9, 10, 11) **não** exige ADR — não é mudança estrutural.

## Relação com Outros Módulos

- [IDENTITY_DOMAIN_MODEL.md](IDENTITY_DOMAIN_MODEL.md), [IDENTITY_TECHNICAL_BLUEPRINT.md](IDENTITY_TECHNICAL_BLUEPRINT.md) — bases consolidadas aqui
- [src/domain/value-objects/](src/domain/value-objects/README.md) — código real de `Email`/`Permission` (ENG-0002.3)
- [packages/shared-kernel/](../../../packages/shared-kernel/README.md) — todos os componentes reutilizados
- [FOUNDATION_STATUS.md](../../../FOUNDATION_STATUS.md), [ADR-0008](../../../adr/ADR-0008-foundation-freeze.md) — mesmo padrão de "freeze declarado, mudança futura exige ADR", aqui aplicado ao desenho de Aggregate de um domínio específico, não à governança do repositório inteiro

## Status

🟢 Design de Aggregate congelado (Missão ENG-0002.5). Nenhum código implementado. Aguardando aprovação do CTO antes de qualquer missão de implementação (Entities, Repositories, Services).
