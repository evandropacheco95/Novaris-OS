# Identity — Technical Blueprint

Versão: 0.1.0

Status: 🟢 Oficial — modelagem técnica, sem implementação

Missão: ENG-0002.2 (Identity Technical Blueprint) — EPIC-002, Sprint-002

Escopo: modelo técnico completo do domínio Identity, reutilizando explicitamente os componentes já implementados no Shared Kernel (EPIC-001). Nenhum código TypeScript, classe, interface real, Repository, API, banco, ORM, JWT, OAuth, Session, MFA ou infraestrutura foi criado nesta missão — apenas assinaturas e diagramas textuais, no mesmo padrão já usado em [CONTRACT.md](CONTRACT.md) ("apenas assinaturas — sem corpo de implementação").

**Pré-requisito**: este documento assume [IDENTITY_DOMAIN_MODEL.md](IDENTITY_DOMAIN_MODEL.md) (ENG-0002.1) como base — não repete Bounded Context, Ubiquitous Language ou justificativas já registradas lá, só referencia.

**Exclusão explícita desta missão**: `Session`, `MFA`, `JWT`, `OAuth` — citados como responsabilidades do Identity Domain em `DOMAIN_MODEL.md` e como termos propostos em `IDENTITY_DOMAIN_MODEL.md § 1` — estão **fora do escopo técnico deste blueprint** por proibição explícita da ordem de missão. Nenhum Aggregate, Entity, Value Object, Domain Service, Repository, Specification ou Domain Event abaixo cobre esses conceitos; ficam para uma missão futura, quando as decisões de infraestrutura associadas (mecanismo de token, provedor de SSO) forem tomadas.

---

## 1. Aggregate Roots

Dois Aggregate Roots — não três como `IDENTITY_DOMAIN_MODEL.md § 4` havia proposto como candidatos. `Permission` foi reclassificado para Value Object nesta missão (§ 3, com justificativa) — decisão de modelagem técnica, não de arquitetura/stack, portanto sem ADR.

### User

```
class User extends AggregateRoot<UserProps>
  implements Auditable, Versionable, HasMetadata<UserMetadata>
```

- Estende `AggregateRoot<UserProps>` (Shared Kernel, ENG-0001.2) — ganha `id: UniqueEntityId`, igualdade por identidade, coleção de `DomainEvent` (`domainEvents`, `addDomainEvent`, `removeDomainEvent`, `clearEvents`).
- Implementa `Auditable` (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`), `Versionable` (`version: number`), `HasMetadata<UserMetadata>` — os 3 contratos estruturais aplicáveis do Shared Kernel (ENG-0001.9). `HasIdentity` já é satisfeito estruturalmente via `AggregateRoot`, sem `implements` explícito (mesmo padrão de `interfaces.test.ts`).
- `UserProps` (assinatura, não implementação): `{ organizationId: UniqueEntityId, email: Email, status: UserStatus, roleIds: UniqueEntityId[] }`.

### Role

```
class Role extends AggregateRoot<RoleProps>
  implements Auditable, Versionable
```

- `RoleProps`: `{ organizationId: UniqueEntityId, name: string, permissions: Permission[] }`.
- Não implementa `HasMetadata` — nenhuma fonte oficial ou proposta em `IDENTITY_DOMAIN_MODEL.md` associa metadados a `Role`; não inventado aqui.

## 2. Entities

Nenhuma Entity interna (não-raiz) identificada — mesma conclusão de `IDENTITY_DOMAIN_MODEL.md § 5`, reconfirmada agora que `Permission` é Value Object (§ 3): nem `User` nem `Role` têm filhos com identidade própria dentro de sua fronteira de consistência.

## 3. Value Objects

🟢 **Implementados** (Missão ENG-0002.3): [src/domain/value-objects/permission.ts](src/domain/value-objects/permission.ts), [src/domain/value-objects/email.ts](src/domain/value-objects/email.ts) — código real substitui as assinaturas abaixo, mantidas como registro da decisão de design.

### Permission (reclassificado de candidato a Aggregate Root para Value Object)

```
class Permission extends ValueObject<PermissionProps>
```

- `PermissionProps extends Record<string, unknown>`: `{ code: string }` — formato `<domínio>.<recurso>.<ação>` ([BOM.md](../../../knowledge/core/BOM.md), exemplos: `crm.leads.read`, `financial.invoice.delete`).
- **Justificativa da reclassificação**: `Permission` é imutável, definida inteiramente pelo seu valor (`code`), sem ciclo de vida ou comportamento próprio além de existir dentro de um `Role` — o encaixe de `ValueObject<T>` (ENG-0001.2: imutável via `Object.freeze`, igualdade por deep equality) é mais preciso do que `AggregateRoot` (que implica identidade própria e consistência transacional independente). Múltiplos `Role`s podem referenciar a mesma `Permission` por valor, sem precisar de identidade compartilhada. `IDENTITY_DOMAIN_MODEL.md § 4` já sinalizava essa possibilidade como reavaliação futura — esta é essa reavaliação.
- Consequência: `Permission` não tem `Repository` próprio (§ 5) — é persistida como parte do Aggregate `Role`.

### Email

```
class Email extends ValueObject<EmailProps>
```

- `EmailProps extends Record<string, unknown>`: `{ value: string }` — validação de formato na construção (mesma técnica que `Permission`).
- Campo `email: Email` em `UserProps` (§ 1).

## 4. Domain Services

Dois candidatos — operações que cruzam mais de um Aggregate, não pertencem a nenhum dos dois isoladamente:

### AuthenticationDomainService

```
class AuthenticationDomainService
  implements AsyncDomainService<VerifyCredentialsInput, User>
```

- `execute(input: VerifyCredentialsInput): Promise<DomainServiceResult<User>>` — `VerifyCredentialsInput = { email: Email, password: string }`.
- Compatível com `AsyncDomainService<TInput, TOutput>` (ENG-0001.8) — devolve `DomainServiceResult<User>` (= `Result<User, DomainError | InfrastructureError>`).
- **Mecanismo de verificação de senha (hash) não definido** — proibido nesta missão (`PasswordHasher` já era proibido desde ENG-0001.8) e fora do escopo aqui (`JWT`/`OAuth` explicitamente excluídos). Assinatura apenas.

### AuthorizationDomainService

```
class AuthorizationDomainService
  implements AsyncDomainService<CheckPermissionInput, boolean>
```

- `execute(input: CheckPermissionInput): Promise<DomainServiceResult<boolean>>` — `CheckPermissionInput = { userId: UniqueEntityId, permissionCode: string }`.
- Motivo de ser Domain Service, não método de `User` ou `Role`: precisa carregar `User` (para suas `roleIds`) **e** os `Role`s correspondentes (para suas `Permission`s) — nenhum dos dois Aggregates tem, sozinho, todo o dado necessário.

## 5. Repository Contracts

```
interface UserRepository extends ReadRepository<User>, WriteRepository<User> {}
interface RoleRepository extends ReadRepository<Role>, WriteRepository<Role> {}
```

- Reaproveitam `ReadRepository<T>`/`WriteRepository<T>` (ENG-0001.7) sem adicionar método algum — `findById`, `findAll`, `exists`, `save`, `delete` já cobrem as operações necessárias identificadas até aqui. Nenhum método novo (ex.: `findByEmail`) foi proposto porque nenhuma fonte oficial ainda define os índices/consultas reais do Identity Service — seria antecipar decisão de infraestrutura.
- **Sem `PermissionRepository`**: `Permission` é Value Object (§ 3), persistida como parte de `Role` — não tem ciclo de persistência independente.

## 6. Specifications

Duas Specifications concretas propostas, ambas estendendo `AbstractSpecification<T>` (ENG-0001.6):

```
class UserIsActiveSpecification extends AbstractSpecification<User> {
  isSatisfiedBy(user: User): boolean
}

class RoleHasPermissionSpecification extends AbstractSpecification<Role> {
  constructor(private readonly permission: Permission) { super(); }
  isSatisfiedBy(role: Role): boolean
}
```

- `UserIsActiveSpecification` — candidata a guarda antes de `AuthenticationDomainService` prosseguir (§ 4, § 10).
- `RoleHasPermissionSpecification` — parametrizada por construtor (padrão clássico do Specification Pattern), usada internamente por `AuthorizationDomainService` depois de carregar os `Role`s do `User`.
- Ambas herdam `and`/`or`/`not` de `AbstractSpecification` de graça — composição fluente sem código adicional (ex.: uma futura `UserIsActiveSpecification().and(...)`).

## 7. Domain Events

| Evento | Aggregate | Origem |
|---|---|---|
| `UserCreated`, `UserInvited`, `UserActivated`, `UserDisabled` | User | Já oficiais ([BOM.md](../../../knowledge/core/BOM.md)) |
| `RoleCreated`, `RoleAssignedToUser`, `RoleRevokedFromUser` | Role | Propostos em `IDENTITY_DOMAIN_MODEL.md § 7` |
| `PermissionGrantedToRole`, `PermissionRevokedFromRole` | Role | Propostos em `IDENTITY_DOMAIN_MODEL.md § 7` — permanecem eventos de `Role` mesmo com `Permission` agora Value Object (§ 3), porque a mudança de estado pertence à fronteira de consistência de `Role` |

Todo evento implementa `DomainEvent` (ENG-0001.5): `{ eventId: string, aggregateId: UniqueEntityId, occurredAt: Date, eventName: string }`. Nenhum Event Bus ou publisher — só o contrato de dado, consistente com `AggregateRoot.addDomainEvent` (armazena, não publica).

**Removidos do escopo desta missão**: `SessionCreated`, `SessionRevoked` (propostos em `IDENTITY_DOMAIN_MODEL.md § 7`) — `Session` está explicitamente fora do escopo técnico aqui.

## 8. Invariantes

Citadas (já oficiais) e propostas (marcadas), nenhuma inventada sem base:

| Invariante | Aggregate | Status |
|---|---|---|
| `id` é imutável após a criação | User, Role | Citada — `UniqueEntityId`/`Entity` (ENG-0001.2) |
| Todo `User` pertence a exatamente uma Organization | User | Citada — `objects/Organization.md`, já usada em `IDENTITY_DOMAIN_MODEL.md § 9` |
| `Permission.code` segue o formato `<domínio>.<recurso>.<ação>` | Permission (VO) | Citada — `BOM.md` |
| Um `User` com status "disabled" (`UserDisabled`) não pode autenticar | User | Proposta — inferida da existência do evento, sem fonte que declare a regra explicitamente |
| `Role.name` é único dentro de uma Organization | Role | Proposta — nenhuma fonte declara isso; segue o padrão de unicidade escopada por Organization já visto em `Organization.md` |
| Um `User` não pode ser seu próprio `createdBy` na criação inicial | User | Proposta — decorre de `Auditable` (ENG-0001.9), sem fonte que declare o caso de borda |

**Explicitamente não definidas** (`requer decisão`): unicidade de `Email` (por Organization ou global — nenhuma fonte decide), número máximo de `Role`s por `User`, se `Role`s podem ser removidos com `User`s ainda atribuídos.

## 9. Regras Transacionais

- **Atribuir/revogar `Role` a um `User`** é uma operação transacional só sobre o Aggregate `User` — `User.roleIds` guarda referências (`UniqueEntityId[]`), nunca o objeto `Role` embutido. Não há necessidade de transação distribuída entre `User` e `Role`.
- **Conceder/revogar `Permission` em um `Role`** é uma operação transacional só sobre o Aggregate `Role` — `Role.permissions` embute os Value Objects `Permission` diretamente (§ 3), dentro da própria fronteira de consistência.
- **Consequência da regra acima**: nenhuma operação de escrita desta missão precisa tocar dois Aggregates na mesma transação — cada `Repository.save()` (§ 5) grava exatamente um Aggregate.
- `AuthorizationDomainService` (§ 4) é **somente leitura** — carrega `User` e `Role`(s) via `ReadRepository`, nunca escreve.

## 10. Fluxos Principais

```
Convidar Usuário
  Application Layer → UserRepository.findById / cria novo User (status: invited)
    → User dispara UserInvited
    → UserRepository.save(user)

Ativar Usuário
  UserRepository.findById(id) → Result<Option<User>, InfrastructureError>
    → user.activate() [assinatura futura, sem corpo aqui]
    → User dispara UserActivated
    → UserRepository.save(user)

Autenticar Usuário
  AuthenticationDomainService.execute({ email, password })
    → UserRepository.findById/busca por email [índice não definido, § 5]
    → UserIsActiveSpecification.isSatisfiedBy(user) — se falhar, DomainServiceResult de falha (AuthenticationError)
    → verificação de senha [mecanismo fora de escopo]
    → DomainServiceResult<User> de sucesso

Atribuir Role a Usuário
  UserRepository.findById(userId), RoleRepository.findById(roleId)
    → user.assignRole(roleId) [assinatura futura]
    → User dispara RoleAssignedToUser
    → UserRepository.save(user) — RoleRepository não é tocado (§ 9)

Verificar Permissão
  AuthorizationDomainService.execute({ userId, permissionCode })
    → UserRepository.findById(userId)
    → RoleRepository.findAll() filtrado pelos roleIds do User [ou findById em loop — decisão de índice fora de escopo]
    → RoleHasPermissionSpecification(permission).isSatisfiedBy(role) para cada Role
    → DomainServiceResult<boolean>
```

Todos os passos entre colchetes (`[...]`) marcam decisão de implementação explicitamente fora do escopo desta missão — não código, só o ponto onde uma decisão futura entra.

## 11. Dependências com Outros Kernel Services

Reafirma `IDENTITY_DOMAIN_MODEL.md § 10`, com detalhamento técnico:

| Serviço | Uso |
|---|---|
| `services/kernel/logging/` | Toda operação relevante (login, atribuição de role) gera log estruturado — `ENGINEERING_PLAYBOOK.md § 11` |
| `services/kernel/event-bus/` | Futuro consumidor dos `DomainEvent`s listados em § 7 — não implementado, nem aqui nem em `event-bus/` ainda |
| `services/kernel/organizations/` | Toda `UserProps`/`RoleProps` carrega `organizationId` (§ 1) — multi-tenancy obrigatório |
| `services/kernel/audit/` | Responsabilidade "Audit Login" de `DOMAIN_MODEL.md` — mecanismo concreto ainda não definido |
| `services/kernel/users/`, `services/kernel/roles/`, `services/kernel/permissions/` | ⚠️ Tensão já registrada em `IDENTITY_DOMAIN_MODEL.md § 2`: este blueprint modela `User`/`Role`/`Permission` como parte de **um** domínio Identity; a estrutura real do Kernel os divide em módulos de serviço separados. Não resolvida aqui. |

## 12. Limites do Aggregate

```
┌─────────────────────────────────────────┐
│ User (Aggregate Root)                    │
│                                           │
│  id: UniqueEntityId                      │
│  organizationId: UniqueEntityId  ─────────┼──▶ (referência, fora da fronteira)
│  email: Email (Value Object)             │
│  status: UserStatus                      │
│  roleIds: UniqueEntityId[]  ──────────────┼──▶ (referências, Role fora da fronteira)
│  createdAt/updatedAt/createdBy/updatedBy │
│  version: number                         │
│  metadata: UserMetadata                  │
│                                           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Role (Aggregate Root)                    │
│                                           │
│  id: UniqueEntityId                      │
│  organizationId: UniqueEntityId  ─────────┼──▶ (referência, fora da fronteira)
│  name: string                            │
│  permissions: Permission[]  ◀── embutido, dentro da fronteira (Value Object)
│  createdAt/updatedAt/createdBy/updatedBy │
│  version: number                         │
│                                           │
└─────────────────────────────────────────┘
```

`Session` deliberadamente ausente de ambos os diagramas — fora do escopo técnico desta missão (ver cabeçalho).

## 13. Ciclo de Vida dos Objetos

### User

```
[Criado] --UserCreated--> [Criado]
[Criado] --UserInvited--> [Convidado] (opcional, se o fluxo de convite for usado)
[Convidado ou Criado] --UserActivated--> [Ativo]
[Ativo] --UserDisabled--> [Desativado]
```

Transições marcadas apenas até onde os 4 eventos já oficiais permitem inferir — se `Desativado` pode voltar a `Ativo` (reativação) não é definido em nenhuma fonte; **requer decisão**.

### Role

```
[Criado] (RoleCreated, proposto)
  --PermissionGrantedToRole--> permissions cresce
  --PermissionRevokedFromRole--> permissions diminui
```

Nenhum evento de exclusão de `Role` (`RoleDeleted`/`RoleArchived`) proposto em nenhuma missão até aqui — **requer decisão** se/quando um `Role` com `User`s ainda atribuídos puder ser removido (relaciona-se à invariante não definida em § 8).

### Permission (Value Object)

Não tem ciclo de vida próprio — é criada e destruída junto com a operação de `Role` que a adiciona/remove (§ 9); não existe fora da fronteira de um `Role`.

## 14. Domain Policies — Avaliação (Missão ENG-0002.4)

A Ordem de Missão ENG-0002.4 pediu a implementação exclusiva das "Domain Policies previstas no Identity Technical Blueprint". **Nenhuma Policy foi modelada nas 13 seções acima** — o escopo original da ENG-0002.2 não incluía "Policies" como item, e nenhuma das seções (nem `Invariantes` § 8, nem `Specifications` § 6) usa esse nome ou conceito.

**Decisão desta missão, seguindo a observação estratégica registrada na própria ordem de missão**: não fabricar Policies preventivamente. As duas rotas possíveis para uma regra de decisão neste domínio já estão cobertas por construções existentes:

- Regras de negócio combináveis e testáveis isoladamente → `Specification<T>` (§ 6) — já modelado (`UserIsActiveSpecification`, `RoleHasPermissionSpecification`), ainda não implementado em código (fora do escopo desta missão, que é exclusiva de Policies).
- Regras que dependem do comportamento de uma Entity para emergir (ex.: "posso desativar este usuário?", "posso remover este Role?") → ainda não podem ser extraídas, porque `User`/`Role` (§ 1) não existem como código — só como assinatura.

**Nenhum código foi criado nesta missão.** Recomendação registrada para a próxima missão do EPIC-002: implementar `User`/`Role` (Aggregate Roots, § 1) primeiro; extrair uma Policy real somente quando um caso de uso concreto expuser uma regra de decisão complexa demais para caber diretamente na Entity ou for reaproveitável entre Entities — não antes.

---

## Relação com Outros Módulos

- [IDENTITY_DOMAIN_MODEL.md](IDENTITY_DOMAIN_MODEL.md) — Bounded Context, Ubiquitous Language, base desta missão
- [README.md](README.md), [CONTRACT.md](CONTRACT.md) — módulo de serviço `identity`
- [packages/shared-kernel/](../../../packages/shared-kernel/README.md) — todos os componentes reutilizados: `Entity`, `AggregateRoot`, `ValueObject`, `UniqueEntityId`, `DomainEvent`, `Result`/`DomainServiceResult`, `DomainService`/`AsyncDomainService`, `Specification`/`AbstractSpecification`, `Repository`/`ReadRepository`/`WriteRepository`, `HasIdentity`/`Auditable`/`Versionable`/`HasMetadata`
- [knowledge/engineering/ENGINEERING_PLAYBOOK.md](../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md) — padrão de Domain Layer (§ 3), Error Handling (§ 10), Logging (§ 11) seguidos aqui

## Status

🟢 Blueprint técnico concluído (Missão ENG-0002.2). **Value Objects (§ 3) implementados** (Missão ENG-0002.3, `src/domain/value-objects/`) — primeiro código real do EPIC-002. **Domain Policies avaliadas, nenhuma encontrada/criada** (§ 14, Missão ENG-0002.4). **Desenho dos Aggregates `User`/`Role` congelado** ([IDENTITY_AGGREGATE_DESIGN_FREEZE.md](IDENTITY_AGGREGATE_DESIGN_FREEZE.md), Missão ENG-0002.5) — §§ 1, 2, 3, 8, 9, 12, 13 consolidados lá; mudança estrutural agora exige ADR. Aggregate Roots (§ 1), Domain Services (§ 4) e Repository Contracts (§ 5) ainda não implementados em código. Nenhum Repository, API, banco, ORM, JWT, OAuth, Session, MFA ou infraestrutura implementados.
