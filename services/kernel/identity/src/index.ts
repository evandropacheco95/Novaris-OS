// Identity Service — barrel de exportação pública.
// Populado conforme cada camada de src/ ganha implementação real.

export { Permission } from "./domain/value-objects/permission.js";
export { Email } from "./domain/value-objects/email.js";

export {
  User,
  type UserProps,
  type UserStatus,
  type UserMetadata,
  type CreateUserInput,
} from "./domain/aggregates/user/user.js";

export {
  Role,
  type RoleProps,
  type CreateRoleInput,
} from "./domain/aggregates/role/role.js";

export type { UserRepository } from "./domain/repositories/user-repository.js";
export type { RoleRepository } from "./domain/repositories/role-repository.js";

export {
  AuthenticationDomainService,
  type VerifyCredentialsInput,
} from "./domain/services/authentication/authentication-domain-service.js";
export type { PasswordVerifier } from "./domain/services/authentication/password-verifier.js";

export {
  AuthorizationDomainService,
  type CheckPermissionInput,
} from "./domain/services/authorization/authorization-domain-service.js";

export {
  RoleAssignmentDomainService,
  type AssignRoleInput,
} from "./domain/services/role-assignment/role-assignment-domain-service.js";

export { UserCreated } from "./domain/domain-events/user-created.js";
export { UserInvited } from "./domain/domain-events/user-invited.js";
export { UserActivated } from "./domain/domain-events/user-activated.js";
export { UserDisabled } from "./domain/domain-events/user-disabled.js";
export { RoleAssignedToUser } from "./domain/domain-events/role-assigned-to-user.js";
export { RoleRevokedFromUser } from "./domain/domain-events/role-revoked-from-user.js";
export { RoleCreated } from "./domain/domain-events/role-created.js";
export { PermissionGrantedToRole } from "./domain/domain-events/permission-granted-to-role.js";
export { PermissionRevokedFromRole } from "./domain/domain-events/permission-revoked-from-role.js";

// Application Layer — adicionado nesta fase (Identity/Auth MVP, `ENG-0122`)
// para permitir que uma Composition Root real (`apps/api`) monte o caso de
// uso de autenticação completo. Mesma disciplina de `@novaris/sales`.
export { AuthenticateUserCommand } from "./application/commands/authenticate-user/authenticate-user.command.js";
export { AuthenticateUserHandler } from "./application/handlers/authenticate-user/authenticate-user.handler.js";

// Application Layer — ciclo de vida completo de User/Role (`ENG-0128`,
// Identity Domain CRUD), seguindo a receita provada em Sales/Customer.
export { CreateUserCommand } from "./application/commands/create-user/create-user.command.js";
export { CreateUserHandler } from "./application/handlers/create-user/create-user.handler.js";
export { ActivateUserCommand } from "./application/commands/activate-user/activate-user.command.js";
export { ActivateUserHandler } from "./application/handlers/activate-user/activate-user.handler.js";
export { DisableUserCommand } from "./application/commands/disable-user/disable-user.command.js";
export { DisableUserHandler } from "./application/handlers/disable-user/disable-user.handler.js";
export { CreateRoleCommand } from "./application/commands/create-role/create-role.command.js";
export { CreateRoleHandler } from "./application/handlers/create-role/create-role.handler.js";
export { GrantPermissionCommand } from "./application/commands/grant-permission/grant-permission.command.js";
export { GrantPermissionHandler } from "./application/handlers/grant-permission/grant-permission.handler.js";
export { RevokePermissionCommand } from "./application/commands/revoke-permission/revoke-permission.command.js";
export { RevokePermissionHandler } from "./application/handlers/revoke-permission/revoke-permission.handler.js";
export { AssignRoleCommand } from "./application/commands/assign-role/assign-role.command.js";
export { AssignRoleHandler } from "./application/handlers/assign-role/assign-role.handler.js";
export { RevokeRoleCommand } from "./application/commands/revoke-role/revoke-role.command.js";
export { RevokeRoleHandler } from "./application/handlers/revoke-role/revoke-role.handler.js";

// Factories de Infrastructure — mantêm as classes concretas privadas ao
// pacote (mesmo padrão de `@novaris/sales`/`@novaris/organizations`).
export { createUserRepository, createRoleRepository, createPasswordVerifier } from "./infrastructure/factories.js";
export { setCredential } from "./infrastructure/authentication/credential-writer.js";
