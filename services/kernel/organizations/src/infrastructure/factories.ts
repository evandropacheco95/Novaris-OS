import type { PrismaClient } from "@novaris/database";
import type { OrganizationRepository } from "../domain/repositories/organization-repository.js";
import { PrismaOrganizationRepository } from "./repositories/prisma-organization-repository.js";

/**
 * Factory de Infrastructure — mantém `PrismaOrganizationRepository` privada ao
 * pacote (nunca exportada diretamente); uma Composition Root externa
 * (`apps/api`) recebe uma instância já pronta, tipada apenas pela interface
 * pública. Mesmo padrão de `services/domains/sales/infrastructure/factories.ts`.
 */
export function createOrganizationRepository(client: PrismaClient): OrganizationRepository {
  return new PrismaOrganizationRepository(client);
}
