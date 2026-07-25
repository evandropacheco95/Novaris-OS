import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { FileRecordRepository } from "@novaris/files";
import type { Campaign } from "../../../domain/aggregates/campaign/campaign.js";
import type { CampaignRepository } from "../../../domain/repositories/campaign-repository.js";
import type { AddAssetToCampaignCommand } from "../../commands/add-asset-to-campaign/add-asset-to-campaign.command.js";

/**
 * AddAssetToCampaignHandler — Application Layer, Marketing Domain
 * (`ADR-0048`). Injeta `FileRecordRepository` (Kernel, `@novaris/files`) além
 * de `CampaignRepository` — confirma que o `FileRecord` referenciado existe
 * antes de criar a associação, mesmo princípio de `AddQuotationLineItemHandler`
 * confirmando o `Product` real. Primeira composição Business Domain→Kernel
 * desta natureza (Marketing→Files) — Kernel nunca depende de Marketing, só o
 * inverso.
 */
export class AddAssetToCampaignHandler {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly fileRecordRepository: FileRecordRepository,
  ) {}

  async execute(command: AddAssetToCampaignCommand): Promise<Result<Campaign, DomainError | InfrastructureError>> {
    const findCampaignResult = await this.campaignRepository.findById(new UniqueEntityId(command.campaignId));
    if (findCampaignResult.isFailure) {
      return Result.fail(findCampaignResult.getError()!);
    }
    const campaignOption = findCampaignResult.getValue()!;
    if (campaignOption.isNone) {
      return Result.fail(new NotFoundError(`Campaign "${command.campaignId}" não encontrada`));
    }
    const campaign = campaignOption.getOrElse(null as never);

    const findFileResult = await this.fileRecordRepository.findById(new UniqueEntityId(command.fileRecordId));
    if (findFileResult.isFailure) {
      return Result.fail(findFileResult.getError()!);
    }
    const fileOption = findFileResult.getValue()!;
    if (fileOption.isNone) {
      return Result.fail(new NotFoundError(`FileRecord "${command.fileRecordId}" não encontrado`));
    }
    const fileRecord = fileOption.getOrElse(null as never);

    campaign.addAsset(fileRecord.id);

    const saveResult = await this.campaignRepository.save(campaign);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(campaign);
  }
}
