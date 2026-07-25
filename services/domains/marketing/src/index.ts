// Marketing Domain Service — barrel de exportação pública.
// Populado conforme cada camada ganha implementação real.

export { Campaign, type CampaignProps, type CreateCampaignInput } from "../domain/aggregates/campaign/campaign.js";

export type { CampaignRepository } from "../domain/repositories/campaign-repository.js";

// Application Layer
export { CreateCampaignCommand } from "../application/commands/create-campaign/create-campaign.command.js";
export { CreateCampaignHandler } from "../application/handlers/create-campaign/create-campaign.handler.js";

// Factories de Infrastructure — mantêm as classes concretas privadas ao pacote.
export { createCampaignRepository } from "../infrastructure/factories.js";
