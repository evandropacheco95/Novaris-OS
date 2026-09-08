import { Module } from "@nestjs/common";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { prisma } from "@novaris/database";
import {
  createAdvertisingAccountRepository,
  createAdCampaignRepository,
  createAdGroupRepository,
  createKeywordRepository,
  createSearchTermRepository,
  createSyncRunRepository,
  CreateAdvertisingAccountHandler,
  ConnectAdvertisingAccountHandler,
  SyncAdvertisingAccountHandler,
  ImportAdvertisingReportHandler,
  HttpGoogleOAuthClient,
  type GoogleOAuthClient,
} from "@novaris/advertising";
import type { GoogleAdsProvider } from "@novaris/integration-hub";
import { CreateAuditEntryHandler } from "@novaris/audit";
import { createFileRecordRepository, LocalFileStorage, UploadFileHandler } from "@novaris/files";
import { AuthModule } from "../auth/auth.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { IntegrationHubModule } from "../integration-hub/integration-hub.module.js";
import { AdvertisingAccountController } from "./advertising-account.controller.js";

const ADVERTISING_ACCOUNT_REPOSITORY = "ADVERTISING_ACCOUNT_REPOSITORY";
const AD_CAMPAIGN_REPOSITORY = "AD_CAMPAIGN_REPOSITORY";
const AD_GROUP_REPOSITORY = "AD_GROUP_REPOSITORY";
const KEYWORD_REPOSITORY = "KEYWORD_REPOSITORY";
const SEARCH_TERM_REPOSITORY = "SEARCH_TERM_REPOSITORY";
const SYNC_RUN_REPOSITORY = "SYNC_RUN_REPOSITORY";
const GOOGLE_OAUTH_CLIENT = "GOOGLE_OAUTH_CLIENT";
const FILE_RECORD_REPOSITORY = "ADVERTISING_FILE_RECORD_REPOSITORY";
const FILE_STORAGE = "ADVERTISING_FILE_STORAGE";

/** Mesmo diretório físico de `FilesModule` (`apps/api/storage-data/`) — instância própria de `LocalFileStorage`, mesmo padrão de `MarketingModule` para `FILE_RECORD_REPOSITORY`. */
const STORAGE_BASE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "storage-data");

/**
 * AdvertisingModule — Composition Root do Advertising Domain (`ADR-0059`,
 * `ADR-0060`). Importa `AuditModule` (mesmo padrão de `OrganizationModule`,
 * `CreateAuditEntryHandler` já montado) e `IntegrationHubModule` (reaproveita
 * o token `"GoogleAdsProvider"` já registrado lá — troca de adapter Console
 * por HTTP real fica inteiramente dentro de `IntegrationHubModule`, sem
 * tocar aqui).
 */
@Module({
  imports: [AuthModule, AuditModule, IntegrationHubModule],
  controllers: [AdvertisingAccountController],
  providers: [
    { provide: ADVERTISING_ACCOUNT_REPOSITORY, useFactory: () => createAdvertisingAccountRepository(prisma) },
    { provide: AD_CAMPAIGN_REPOSITORY, useFactory: () => createAdCampaignRepository(prisma) },
    { provide: AD_GROUP_REPOSITORY, useFactory: () => createAdGroupRepository(prisma) },
    { provide: KEYWORD_REPOSITORY, useFactory: () => createKeywordRepository(prisma) },
    { provide: SEARCH_TERM_REPOSITORY, useFactory: () => createSearchTermRepository(prisma) },
    { provide: SYNC_RUN_REPOSITORY, useFactory: () => createSyncRunRepository(prisma) },
    { provide: FILE_RECORD_REPOSITORY, useFactory: () => createFileRecordRepository(prisma) },
    { provide: FILE_STORAGE, useFactory: () => new LocalFileStorage(STORAGE_BASE_DIR) },
    {
      provide: UploadFileHandler,
      useFactory: (repository: ReturnType<typeof createFileRecordRepository>, storage: LocalFileStorage) => new UploadFileHandler(repository, storage),
      inject: [FILE_RECORD_REPOSITORY, FILE_STORAGE],
    },
    {
      provide: GOOGLE_OAUTH_CLIENT,
      useFactory: (): GoogleOAuthClient =>
        new HttpGoogleOAuthClient({
          clientId: process.env.GOOGLE_CLIENT_ID ?? "",
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    },
    {
      provide: CreateAdvertisingAccountHandler,
      useFactory: (repository: ReturnType<typeof createAdvertisingAccountRepository>) => new CreateAdvertisingAccountHandler(repository),
      inject: [ADVERTISING_ACCOUNT_REPOSITORY],
    },
    {
      provide: ConnectAdvertisingAccountHandler,
      useFactory: (
        repository: ReturnType<typeof createAdvertisingAccountRepository>,
        googleOAuthClient: GoogleOAuthClient,
        createAuditEntryHandler: CreateAuditEntryHandler,
      ) => new ConnectAdvertisingAccountHandler(repository, googleOAuthClient, createAuditEntryHandler),
      inject: [ADVERTISING_ACCOUNT_REPOSITORY, GOOGLE_OAUTH_CLIENT, CreateAuditEntryHandler],
    },
    {
      provide: SyncAdvertisingAccountHandler,
      useFactory: (
        advertisingAccountRepository: ReturnType<typeof createAdvertisingAccountRepository>,
        adCampaignRepository: ReturnType<typeof createAdCampaignRepository>,
        adGroupRepository: ReturnType<typeof createAdGroupRepository>,
        keywordRepository: ReturnType<typeof createKeywordRepository>,
        searchTermRepository: ReturnType<typeof createSearchTermRepository>,
        syncRunRepository: ReturnType<typeof createSyncRunRepository>,
        googleAdsProvider: GoogleAdsProvider,
      ) =>
        new SyncAdvertisingAccountHandler(
          advertisingAccountRepository,
          adCampaignRepository,
          adGroupRepository,
          keywordRepository,
          searchTermRepository,
          syncRunRepository,
          googleAdsProvider,
        ),
      inject: [
        ADVERTISING_ACCOUNT_REPOSITORY,
        AD_CAMPAIGN_REPOSITORY,
        AD_GROUP_REPOSITORY,
        KEYWORD_REPOSITORY,
        SEARCH_TERM_REPOSITORY,
        SYNC_RUN_REPOSITORY,
        "GoogleAdsProvider",
      ],
    },
    {
      provide: ImportAdvertisingReportHandler,
      useFactory: (
        advertisingAccountRepository: ReturnType<typeof createAdvertisingAccountRepository>,
        adCampaignRepository: ReturnType<typeof createAdCampaignRepository>,
        adGroupRepository: ReturnType<typeof createAdGroupRepository>,
        keywordRepository: ReturnType<typeof createKeywordRepository>,
        syncRunRepository: ReturnType<typeof createSyncRunRepository>,
        uploadFileHandler: UploadFileHandler,
      ) =>
        new ImportAdvertisingReportHandler(
          advertisingAccountRepository,
          adCampaignRepository,
          adGroupRepository,
          keywordRepository,
          syncRunRepository,
          uploadFileHandler,
        ),
      inject: [ADVERTISING_ACCOUNT_REPOSITORY, AD_CAMPAIGN_REPOSITORY, AD_GROUP_REPOSITORY, KEYWORD_REPOSITORY, SYNC_RUN_REPOSITORY, UploadFileHandler],
    },
    { provide: "AdvertisingAccountRepository", useExisting: ADVERTISING_ACCOUNT_REPOSITORY },
  ],
})
export class AdvertisingModule {}
