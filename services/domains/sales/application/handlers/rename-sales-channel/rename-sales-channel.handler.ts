import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { SalesChannel } from "../../../domain/aggregates/sales-channel/sales-channel.js";
import type { SalesChannelRepository } from "../../../domain/repositories/sales-channel-repository.js";
import type { RenameSalesChannelCommand } from "../../commands/rename-sales-channel/rename-sales-channel.command.js";

/** RenameSalesChannelHandler — Application Layer, Sales Domain (`ADR-0052`). */
export class RenameSalesChannelHandler {
  constructor(private readonly salesChannelRepository: SalesChannelRepository) {}

  async execute(command: RenameSalesChannelCommand): Promise<Result<SalesChannel, DomainError | InfrastructureError>> {
    const findResult = await this.salesChannelRepository.findById(new UniqueEntityId(command.salesChannelId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`SalesChannel "${command.salesChannelId}" não encontrado`));
    }
    const salesChannel = option.getOrElse(null as never);

    const renameResult = salesChannel.rename(command.name);
    if (renameResult.isFailure) {
      return Result.fail(renameResult.getError()!);
    }

    const saveResult = await this.salesChannelRepository.save(salesChannel);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(salesChannel);
  }
}
