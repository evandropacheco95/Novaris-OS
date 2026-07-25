import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Campaign } from "../../../domain/aggregates/campaign/campaign.js";
import type { CampaignRepository } from "../../../domain/repositories/campaign-repository.js";
import type { CreateCampaignCommand } from "../../commands/create-campaign/create-campaign.command.js";

/** CreateCampaignHandler — Application Layer, Marketing Domain. Orquestra: `CreateCampaignCommand` → `Campaign.create()` → `CampaignRepository.save()`. */
export class CreateCampaignHandler {
  constructor(private readonly campaignRepository: CampaignRepository) {}

  async execute(command: CreateCampaignCommand): Promise<Result<Campaign, DomainError | InfrastructureError>> {
    const createResult = Campaign.create({
      organizationId: new UniqueEntityId(command.organizationId),
      name: command.name,
      startDate: command.startDate ? new Date(command.startDate) : undefined,
      endDate: command.endDate ? new Date(command.endDate) : undefined,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }

    const campaign = createResult.getValue()!;
    const saveResult = await this.campaignRepository.save(campaign);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(campaign);
  }
}
