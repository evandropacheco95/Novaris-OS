# role

`Role` — Aggregate Root do Identity Domain.

## Conteúdo (Missão ENG-0002.8)

- [role.ts](role.ts) — `Role extends AggregateRoot<RoleProps>`, `implements Auditable, Versionable` ([IDENTITY_TECHNICAL_BLUEPRINT.md § 1](../../../../IDENTITY_TECHNICAL_BLUEPRINT.md), congelado em [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](../../../../IDENTITY_AGGREGATE_DESIGN_FREEZE.md)). Mesmo padrão estrutural de [user/](../user/README.md) (ENG-0002.7): construtor privado, `create`/`reconstitute`, `Result<T, DomainError>` em toda operação, `updatedBy` sempre fornecido pelo chamador.
  - `static create(input: CreateRoleInput): Result<Role, DomainError>` — `permissions` inicial vazio, dispara `RoleCreated`.
  - `static reconstitute(props, id): Role` — sem validação, sem eventos (ENS-0001 § 8).
  - `grantPermission(permission, updatedBy)`, `revokePermission(permission, updatedBy)` — mutam `permissions` (Value Objects embutidos por valor, nunca por referência), disparando `PermissionGrantedToRole`/`PermissionRevokedFromRole`.

## Diferenças Deliberadas em Relação a `User`

Decorrem das regras próprias do domínio `Role`, não de inconsistência de implementação:

- **Sem `HasMetadata`**: `IDENTITY_TECHNICAL_BLUEPRINT.md § 1` já decide que nenhuma fonte associa metadados a `Role` — não implementado.
- **Sem `status`/máquina de estados**: `Role` não tem ciclo de vida com transições (Freeze § 11) — só `permissions` cresce/diminui. Por isso `grantPermission`/`revokePermission` não têm caminho de falha por estado conflitante, ao contrário de `invite`/`activate`/`disable` de `User` — mesma assimetria já existente entre `assignRole`/`revokeRole` (sem guarda) e as transições de status (com guarda) dentro do próprio `User`.
- **`permissions` embute Value Objects por valor**, enquanto `roleIds` de `User` guarda só referências — decorre de `Permission` ser Value Object e `Role` ser Aggregate Root (Freeze §§ 4, 8), não de uma escolha de implementação diferente.

## Invariantes Implementadas

- `permissions` guarda só Value Objects `Permission`, embutidos por valor (Freeze §§ 4, 8).
- `organizationId` é referência por `UniqueEntityId`, nunca objeto embutido.
- `Role` nunca conhece nem referencia `User` (Freeze § 9 — isolamento de Aggregate).

## Fora do Escopo desta Missão

`Role.name` único dentro de uma Organization (Freeze § 6, "proposta") — exige consultar todos os `Role`s da Organization via Repository, proibido nesta missão. Fica para a Application Layer.

## Status

🟢 Implementado e testado (Missão ENG-0002.8). Segundo e último Aggregate Root do Identity Domain congelado em `IDENTITY_AGGREGATE_DESIGN_FREEZE.md`.
