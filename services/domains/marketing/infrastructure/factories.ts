import type { PrismaClient } from "@novaris/database";
import type { CampaignRepository } from "../domain/repositories/campaign-repository.js";
import { PrismaCampaignRepository } from "./repositories/prisma-campaign-repository.js";

/** Factories de Infrastructure — mantêm as classes concretas privadas ao pacote. */
export function createCampaignRepository(client: PrismaClient): CampaignRepository {
  return new PrismaCampaignRepository(client);
}
