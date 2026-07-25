import type { PrismaClient } from "@novaris/database";
import type { UserRepository } from "../domain/repositories/user-repository.js";
import type { RoleRepository } from "../domain/repositories/role-repository.js";
import type { PasswordVerifier } from "../domain/services/authentication/password-verifier.js";
import { PrismaUserRepository } from "./repositories/prisma-user-repository.js";
import { PrismaRoleRepository } from "./repositories/prisma-role-repository.js";
import { BcryptPasswordVerifier } from "./authentication/bcrypt-password-verifier.js";

/**
 * Factories de Infrastructure — mantêm as classes concretas privadas ao
 * pacote (nunca exportadas diretamente); uma Composition Root externa
 * (`apps/api`) recebe instâncias já prontas, tipadas apenas pelas interfaces
 * públicas. Mesmo padrão de `@novaris/sales`/`@novaris/organizations`.
 */
export function createUserRepository(client: PrismaClient): UserRepository {
  return new PrismaUserRepository(client);
}

export function createRoleRepository(client: PrismaClient): RoleRepository {
  return new PrismaRoleRepository(client);
}

export function createPasswordVerifier(client: PrismaClient): PasswordVerifier {
  return new BcryptPasswordVerifier(client);
}
