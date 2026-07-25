import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { prisma } from "@novaris/database";
import {
  AuthenticationDomainService,
  AuthenticateUserHandler,
  AuthorizationDomainService,
  createUserRepository,
  createRoleRepository,
  createPasswordVerifier,
} from "@novaris/identity";
import { AuthController } from "./auth.controller.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { PermissionGuard } from "./permission.guard.js";

const USER_REPOSITORY = "IDENTITY_USER_REPOSITORY";
const ROLE_REPOSITORY = "IDENTITY_AUTH_ROLE_REPOSITORY";
const PASSWORD_VERIFIER = "IDENTITY_PASSWORD_VERIFIER";

/**
 * AuthModule — Composition Root da autenticação/autorização (`ENG-0122`,
 * `ADR-0036`). Único lugar onde `PrismaUserRepository`/`PrismaRoleRepository`/
 * `BcryptPasswordVerifier` (Infrastructure) são instanciados e conectados a
 * `AuthenticationDomainService`/`AuthorizationDomainService` (Domain) — mesmo
 * padrão de `SalesModule` para o Sales Domain. `ROLE_REPOSITORY` é um token
 * próprio, independente do `IDENTITY_CRUD_ROLE_REPOSITORY` de `IdentityModule`
 * — mesma instância de `PrismaRoleRepository` por trás (`prisma` é singleton),
 * só evita reexportar um provider privado de outro módulo.
 *
 * Exporta `JwtAuthGuard`, `PermissionGuard` e `JwtModule` para que qualquer
 * outro módulo proteja suas rotas com `@UseGuards(JwtAuthGuard, PermissionGuard)`
 * sem duplicar configuração de JWT nem a montagem de `AuthorizationDomainService`.
 */
@Module({
  imports: [
    // `registerAsync` (não `register`) — `process.env.JWT_SECRET` só existe
    // depois que `main.ts` chama `process.loadEnvFile()`, mas imports ESM são
    // resolvidos antes do código do próprio `main.ts` rodar. `register()`
    // leria `process.env.JWT_SECRET` no momento da avaliação do módulo
    // (undefined); `useFactory` só é chamado em tempo de execução, dentro de
    // `NestFactory.create()`, já depois do `.env` carregado. Achado real,
    // confirmado por `secretOrPrivateKey must have a value` na primeira
    // tentativa de login.
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: "8h" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useFactory: () => createUserRepository(prisma),
    },
    {
      provide: ROLE_REPOSITORY,
      useFactory: () => createRoleRepository(prisma),
    },
    {
      provide: PASSWORD_VERIFIER,
      useFactory: () => createPasswordVerifier(prisma),
    },
    {
      provide: AuthenticationDomainService,
      useFactory: (userRepository: ReturnType<typeof createUserRepository>, passwordVerifier: ReturnType<typeof createPasswordVerifier>) =>
        new AuthenticationDomainService(userRepository, passwordVerifier),
      inject: [USER_REPOSITORY, PASSWORD_VERIFIER],
    },
    {
      provide: AuthenticateUserHandler,
      useFactory: (service: AuthenticationDomainService) => new AuthenticateUserHandler(service),
      inject: [AuthenticationDomainService],
    },
    {
      provide: AuthorizationDomainService,
      useFactory: (userRepository: ReturnType<typeof createUserRepository>, roleRepository: ReturnType<typeof createRoleRepository>) =>
        new AuthorizationDomainService(userRepository, roleRepository),
      inject: [USER_REPOSITORY, ROLE_REPOSITORY],
    },
    JwtAuthGuard,
    PermissionGuard,
  ],
  exports: [JwtAuthGuard, PermissionGuard, AuthorizationDomainService, JwtModule],
})
export class AuthModule {}
