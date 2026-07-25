import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import { eventBus } from "@novaris/event-bus";
import {
  createUserRepository,
  createRoleRepository,
  CreateUserHandler,
  ActivateUserHandler,
  DisableUserHandler,
  CreateRoleHandler,
  GrantPermissionHandler,
  RevokePermissionHandler,
  AssignRoleHandler,
  RevokeRoleHandler,
  RoleAssignmentDomainService,
} from "@novaris/identity";
import { AuthModule } from "../auth/auth.module.js";
import { UserController } from "./user.controller.js";
import { RoleController } from "./role.controller.js";

const USER_REPOSITORY = "IDENTITY_CRUD_USER_REPOSITORY";
const ROLE_REPOSITORY = "IDENTITY_CRUD_ROLE_REPOSITORY";

/**
 * IdentityModule — Composition Root do ciclo de vida de User/Role
 * (`ENG-0128`). Token de repositório próprio (`IDENTITY_CRUD_*`, distinto do
 * `IDENTITY_USER_REPOSITORY` de `AuthModule`) — mesma instância de
 * `PrismaUserRepository` por trás (`prisma` é singleton), só evita reexportar
 * um provider privado de outro módulo.
 *
 * `CreateUserHandler` recebe o `eventBus` singleton (`@novaris/event-bus`,
 * mesmo padrão de `prisma`) — primeira integração real do Event Bus
 * (`ADR-0037`, `ENG-0139`): publica `UserCreated` depois de `save()`.
 */
@Module({
  imports: [AuthModule],
  controllers: [UserController, RoleController],
  providers: [
    { provide: USER_REPOSITORY, useFactory: () => createUserRepository(prisma) },
    { provide: ROLE_REPOSITORY, useFactory: () => createRoleRepository(prisma) },
    {
      provide: CreateUserHandler,
      useFactory: (repository: ReturnType<typeof createUserRepository>) => new CreateUserHandler(repository, eventBus),
      inject: [USER_REPOSITORY],
    },
    {
      provide: ActivateUserHandler,
      useFactory: (repository: ReturnType<typeof createUserRepository>) => new ActivateUserHandler(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: DisableUserHandler,
      useFactory: (repository: ReturnType<typeof createUserRepository>) => new DisableUserHandler(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: RevokeRoleHandler,
      useFactory: (repository: ReturnType<typeof createUserRepository>) => new RevokeRoleHandler(repository),
      inject: [USER_REPOSITORY],
    },
    {
      provide: RoleAssignmentDomainService,
      useFactory: (userRepository: ReturnType<typeof createUserRepository>, roleRepository: ReturnType<typeof createRoleRepository>) =>
        new RoleAssignmentDomainService(userRepository, roleRepository),
      inject: [USER_REPOSITORY, ROLE_REPOSITORY],
    },
    {
      provide: AssignRoleHandler,
      useFactory: (service: RoleAssignmentDomainService) => new AssignRoleHandler(service),
      inject: [RoleAssignmentDomainService],
    },
    {
      provide: CreateRoleHandler,
      useFactory: (repository: ReturnType<typeof createRoleRepository>) => new CreateRoleHandler(repository),
      inject: [ROLE_REPOSITORY],
    },
    {
      provide: GrantPermissionHandler,
      useFactory: (repository: ReturnType<typeof createRoleRepository>) => new GrantPermissionHandler(repository),
      inject: [ROLE_REPOSITORY],
    },
    {
      provide: RevokePermissionHandler,
      useFactory: (repository: ReturnType<typeof createRoleRepository>) => new RevokePermissionHandler(repository),
      inject: [ROLE_REPOSITORY],
    },
    { provide: "UserRepository", useExisting: USER_REPOSITORY },
    { provide: "RoleRepository", useExisting: ROLE_REPOSITORY },
  ],
})
export class IdentityModule {}
