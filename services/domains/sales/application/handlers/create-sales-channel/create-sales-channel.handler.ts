import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { SalesChannel } from "../../../domain/aggregates/sales-channel/sales-channel.js";
import type { SalesChannelRepository } from "../../../domain/repositories/sales-channel-repository.js";
import type { CreateSalesChannelCommand } from "../../commands/create-sales-channel/create-sales-channel.command.js";

/** CreateSalesChannelHandler — Application Layer, Sales Domain (`ADR-0052`). */
export class CreateSalesChannelHandler {
  constructor(private readonly salesChannelRepository: SalesChannelRepository) {}

  async execute(command: CreateSalesChannelCommand): Promise<Result<SalesChannel, DomainError | InfrastructureError>> {
    const createResult = SalesChannel.create({
      organizationId: new UniqueEntityId(command.organizationId),
      name: command.name,
      type: command.type,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const salesChannel = createResult.getValue()!;

    const saveResult = await this.salesChannelRepository.save(salesChannel);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(salesChannel);
  }
}
