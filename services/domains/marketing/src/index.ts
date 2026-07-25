// Marketing Domain Service — barrel de exportação pública.
// Populado conforme cada camada ganha implementação real.

export { Campaign, type CampaignProps, type CreateCampaignInput } from "../domain/aggregates/campaign/campaign.js";
export { Asset, type AssetProps, type CreateAssetInput } from "../domain/entities/asset/asset.js";

export type { CampaignRepository } from "../domain/repositories/campaign-repository.js";

// Application Layer
export { CreateCampaignCommand } from "../application/commands/create-campaign/create-campaign.command.js";
export { CreateCampaignHandler } from "../application/handlers/create-campaign/create-campaign.handler.js";
export { AddAssetToCampaignCommand } from "../application/commands/add-asset-to-campaign/add-asset-to-campaign.command.js";
export { AddAssetToCampaignHandler } from "../application/handlers/add-asset-to-campaign/add-asset-to-campaign.handler.js";

// Factories de Infrastructure — mantêm as classes concretas privadas ao pacote.
export { createCampaignRepository } from "../infrastructure/factories.js";
