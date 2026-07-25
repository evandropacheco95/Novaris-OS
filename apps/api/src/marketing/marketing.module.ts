import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import { createCampaignRepository, CreateCampaignHandler, AddAssetToCampaignHandler } from "@novaris/marketing";
import { createFileRecordRepository } from "@novaris/files";
import { AuthModule } from "../auth/auth.module.js";
import { CampaignController } from "./campaign.controller.js";

const CAMPAIGN_REPOSITORY = "CAMPAIGN_REPOSITORY";
const FILE_RECORD_REPOSITORY = "MARKETING_FILE_RECORD_REPOSITORY";

/**
 * MarketingModule — Composition Root do Marketing Domain (`ENG-0133`).
 * `FILE_RECORD_REPOSITORY` é uma instância própria (mesmo `prisma`
 * compartilhado de `FilesModule`, mas sem importar o módulo — o Port é
 * stateless, não há necessidade de reaproveitar a mesma instância, diferente
 * de `CreatePartyHandler` em `SalesModule`, que precisa da mesma instância
 * já registrada por `CustomerModule`).
 */
@Module({
  imports: [AuthModule],
  controllers: [CampaignController],
  providers: [
    { provide: CAMPAIGN_REPOSITORY, useFactory: () => createCampaignRepository(prisma) },
    { provide: FILE_RECORD_REPOSITORY, useFactory: () => createFileRecordRepository(prisma) },
    {
      provide: CreateCampaignHandler,
      useFactory: (repository: ReturnType<typeof createCampaignRepository>) => new CreateCampaignHandler(repository),
      inject: [CAMPAIGN_REPOSITORY],
    },
    {
      // Composição Marketing→Kernel (`ADR-0048`) — confirma que o FileRecord
      // referenciado existe antes de associá-lo à Campaign.
      provide: AddAssetToCampaignHandler,
      useFactory: (
        campaignRepository: ReturnType<typeof createCampaignRepository>,
        fileRecordRepository: ReturnType<typeof createFileRecordRepository>,
      ) => new AddAssetToCampaignHandler(campaignRepository, fileRecordRepository),
      inject: [CAMPAIGN_REPOSITORY, FILE_RECORD_REPOSITORY],
    },
    { provide: "CampaignRepository", useExisting: CAMPAIGN_REPOSITORY },
  ],
})
export class MarketingModule {}
