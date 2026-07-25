import type { PrismaClient } from "@novaris/database";
import type { ProjectRepository } from "../domain/repositories/project-repository.js";
import { PrismaProjectRepository } from "./repositories/prisma-project-repository.js";

/** Factory de Infrastructure — mantém `PrismaProjectRepository` privada ao pacote. */
export function createProjectRepository(client: PrismaClient): ProjectRepository {
  return new PrismaProjectRepository(client);
}
