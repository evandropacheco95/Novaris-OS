import type { PrismaClient } from "@novaris/database";
import type { PartyRepository } from "../domain/repositories/party-repository.js";
import type { RelationshipRepository } from "../domain/repositories/relationship-repository.js";
import { PrismaPartyRepository } from "./repositories/prisma-party-repository.js";
import { PrismaRelationshipRepository } from "./repositories/prisma-relationship-repository.js";

/**
 * Factories de Infrastructure — mantêm as classes concretas privadas ao
 * pacote; uma Composition Root externa (`apps/api`) recebe instâncias já
 * prontas, tipadas apenas pelas interfaces públicas. Mesmo padrão de
 * `@novaris/sales`/`@novaris/identity`/`@novaris/organizations`.
 */
export function createPartyRepository(client: PrismaClient): PartyRepository {
  return new PrismaPartyRepository(client);
}

export function createRelationshipRepository(client: PrismaClient): RelationshipRepository {
  return new PrismaRelationshipRepository(client);
}
