import { Result, UniqueEntityId, NotFoundError, AuthorizationError, InfrastructureError } from "@novaris/shared-kernel";
import type { DomainError } from "@novaris/shared-kernel";
import { UploadFileCommand, type UploadFileHandler } from "@novaris/files";
import { SyncRun } from "../../../domain/aggregates/sync-run/sync-run.js";
import type { AdvertisingAccountRepository } from "../../../domain/repositories/advertising-account-repository.js";
import type { AdCampaignRepository } from "../../../domain/repositories/ad-campaign-repository.js";
import type { AdGroupRepository } from "../../../domain/repositories/ad-group-repository.js";
import type { KeywordRepository } from "../../../domain/repositories/keyword-repository.js";
import type { SyncRunRepository } from "../../../domain/repositories/sync-run-repository.js";
import type { ImportAdvertisingReportCommand } from "../../commands/import-advertising-report/import-advertising-report.command.js";
import { parseGoogleAdsCsv } from "../../../infrastructure/csv/google-ads-csv-parser.js";
import { mapCampaignCsvRows, mapAdGroupCsvRows, mapKeywordCsvRows } from "../../../infrastructure/csv/google-ads-csv-column-map.js";
import { upsertCampaigns, upsertAdGroupsAndKeywords, upsertKeywordsByAdGroupName } from "../../shared/advertising-row-upsert.js";

export interface ImportAdvertisingReportResult {
  reportType: ImportAdvertisingReportCommand["reportType"];
  campaignsSynced: number;
  adGroupsSynced: number;
  keywordsSynced: number;
  skipped: number;
}

/**
 * ImportAdvertisingReportHandler — Application Layer, Advertising Domain.
 *
 * Caminho alternativo ao sync ao vivo (`SyncAdvertisingAccountHandler`) para
 * quando o developer token do Google Ads ainda está preso em nível "Test
 * Account" — parseia um CSV exportado pela própria UI do Google Ads e chama
 * a mesma lógica de upsert idempotente por natural key
 * (`application/shared/advertising-row-upsert.ts`), garantindo que dado
 * importado manualmente e dado sincronizado via API nunca duplicam.
 *
 * Diferente de `SyncAdvertisingAccountHandler`, **não** aciona a máquina de
 * estados de conexão (`requestSync()`/`startSync()`/`completeSync()`) —
 * essas transições exigem `connectionStatus === "CONNECTED"`
 * (`AdvertisingAccount.requestSync()`), e o import de CSV é justamente o
 * caminho para quando a conta ainda não está conectada via OAuth. A conta
 * em si não é modificada; só `AdCampaign`/`AdGroup`/`Keyword` e o `SyncRun`
 * (`source: "CSV_IMPORT"`) resultantes.
 *
 * Upload do arquivo original via `UploadFileHandler` é best-effort — mesmo
 * critério do audit-entry em `ConnectAdvertisingAccountHandler`: falha ao
 * persistir o arquivo não impede o import, só deixa `SyncRun.sourceFileRecordId`
 * vazio.
 */
export class ImportAdvertisingReportHandler {
  constructor(
    private readonly advertisingAccountRepository: AdvertisingAccountRepository,
    private readonly adCampaignRepository: AdCampaignRepository,
    private readonly adGroupRepository: AdGroupRepository,
    private readonly keywordRepository: KeywordRepository,
    private readonly syncRunRepository: SyncRunRepository,
    private readonly uploadFileHandler: UploadFileHandler,
  ) {}

  async execute(command: ImportAdvertisingReportCommand): Promise<Result<ImportAdvertisingReportResult, DomainError | InfrastructureError>> {
    const advertisingAccountId = new UniqueEntityId(command.advertisingAccountId);

    const findResult = await this.advertisingAccountRepository.findById(advertisingAccountId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`AdvertisingAccount "${command.advertisingAccountId}" não encontrada`));
    }

    const account = option.getOrElse(null as never);
    if (!account.organizationId.equals(new UniqueEntityId(command.organizationId))) {
      return Result.fail(new AuthorizationError("AdvertisingAccount não pertence à Organization do usuário autenticado"));
    }

    let parsed;
    try {
      parsed = parseGoogleAdsCsv(command.fileContent.toString("utf-8"));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao parsear CSV "${command.filename}": ${(error as Error).message}`));
    }

    const uploadResult = await this.uploadFileHandler.execute(
      new UploadFileCommand({
        organizationId: command.organizationId,
        filename: command.filename,
        mimeType: "text/csv",
        content: command.fileContent,
      }),
    );
    const sourceFileRecordId = uploadResult.isSuccess ? uploadResult.getValue()!.id : undefined;

    const syncRunResult = SyncRun.create({
      organizationId: account.organizationId,
      advertisingAccountId: account.id,
      source: "CSV_IMPORT",
      sourceFileRecordId,
    });
    const syncRun = syncRunResult.getValue()!;
    await this.syncRunRepository.save(syncRun);

    try {
      let campaignsSynced = 0;
      let adGroupsSynced = 0;
      let keywordsSynced = 0;
      let skipped = 0;

      switch (command.reportType) {
        case "campaigns": {
          const rows = mapCampaignCsvRows(parsed);
          campaignsSynced = await upsertCampaigns(account, { adCampaignRepository: this.adCampaignRepository }, rows);
          break;
        }
        case "ad_groups": {
          const rows = mapAdGroupCsvRows(parsed);
          const result = await upsertAdGroupsAndKeywords(
            account,
            { adCampaignRepository: this.adCampaignRepository, adGroupRepository: this.adGroupRepository, keywordRepository: this.keywordRepository },
            { adGroups: rows, keywords: [] },
          );
          adGroupsSynced = result.adGroupsSynced;
          skipped = rows.length - adGroupsSynced;
          break;
        }
        case "keywords": {
          const rows = mapKeywordCsvRows(parsed);
          const result = await upsertKeywordsByAdGroupName(
            account,
            { adGroupRepository: this.adGroupRepository, keywordRepository: this.keywordRepository },
            rows,
          );
          keywordsSynced = result.keywordsSynced;
          skipped = result.skipped;
          break;
        }
      }

      syncRun.complete({ campaignsSynced, adGroupsSynced, keywordsSynced, searchTermsSynced: 0 });
      await this.syncRunRepository.save(syncRun);

      return Result.ok({ reportType: command.reportType, campaignsSynced, adGroupsSynced, keywordsSynced, skipped });
    } catch (error) {
      const message = (error as Error).message;
      syncRun.fail(message);
      await this.syncRunRepository.save(syncRun);
      return Result.fail(new InfrastructureError(`Falha ao importar CSV "${command.filename}": ${message}`));
    }
  }
}
