import type { PrismaClient } from "@novaris/database";
import type { DashboardRepository } from "../domain/repositories/dashboard-repository.js";
import { PrismaDashboardRepository } from "./repositories/prisma-dashboard-repository.js";

/** Factories de Infrastructure — mantêm as classes concretas privadas ao pacote. */
export function createDashboardRepository(client: PrismaClient): DashboardRepository {
  return new PrismaDashboardRepository(client);
}
