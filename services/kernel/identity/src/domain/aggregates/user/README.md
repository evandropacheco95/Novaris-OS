# user

`User` — Aggregate Root do Identity Domain.

## Conteúdo (Missão ENG-0002.7)

- [user.ts](user.ts) — `User extends AggregateRoot<UserProps>`, `implements Auditable, Versionable, HasMetadata<UserMetadata>` ([IDENTITY_TECHNICAL_BLUEPRINT.md § 1](../../../../IDENTITY_TECHNICAL_BLUEPRINT.md), congelado em [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](../../../../IDENTITY_AGGREGATE_DESIGN_FREEZE.md)).
  - `static create(input: CreateUserInput): Result<User, DomainError>` — status inicial `"created"`, dispara `UserCreated`.
  - `static reconstitute(props, id): User` — sem validação, sem eventos (ENS-0001 § 8).
  - `invite(updatedBy)`, `activate(updatedBy)`, `disable(updatedBy)` — transições de `UserStatus` conforme o ciclo de vida congelado (Freeze § 11), cada uma disparando o Domain Event correspondente ou devolvendo `ConflictError` para transição inválida.
  - `assignRole(roleId, updatedBy)`, `revokeRole(roleId, updatedBy)` — mutam `roleIds` (referências, nunca o objeto `Role`), disparando `RoleAssignedToUser`/`RoleRevokedFromUser`.

## Invariantes Implementadas

- Transições de `UserStatus` restritas ao ciclo de vida congelado — `created → invited → active → disabled`, sem reativação (Freeze § 11, `requer decisão`).
- `User` não pode ser seu próprio `createdBy`: garantido estruturalmente — `create()` nunca aceita um `id` fornecido pelo chamador, então nenhum `createdBy` pode coincidir com o `id` gerado internamente.
- `roleIds` guarda só `UniqueEntityId` (referências) — nunca o objeto `Role` embutido (Freeze §§ 8-9).

## Fora do Escopo desta Missão

Verificação de que um `roleId` pertence à mesma Organization do `User` (Freeze § 9, "proposta, não confirmada") — exige carregar o `Role` via Repository, proibido nesta missão. Fica para a Application Layer/Domain Service.

## Status

🟢 Implementado e testado (Missão ENG-0002.7). `Role` (segundo Aggregate Root) ainda não implementado.
