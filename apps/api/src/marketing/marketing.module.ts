import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import { createCampaignRepository, CreateCampaignHandler } from "@novaris/marketing";
import { AuthModule } from "../auth/auth.module.js";
import { CampaignController } from "./campaign.controller.js";

const CAMPAIGN_REPOSITORY = "CAMPAIGN_REPOSITORY";

/** MarketingModule — Composition Root do Marketing Domain (`ENG-0133`). */
@Module({
  imports: [AuthModule],
  controllers: [CampaignController],
  providers: [
    { provide: CAMPAIGN_REPOSITORY, useFactory: () => createCampaignRepository(prisma) },
    {
      provide: CreateCampaignHandler,
      useFactory: (repository: ReturnType<typeof createCampaignRepository>) => new CreateCampaignHandler(repository),
      inject: [CAMPAIGN_REPOSITORY],
    },
    { provide: "CampaignRepository", useExisting: CAMPAIGN_REPOSITORY },
  ],
})
export class MarketingModule {}
