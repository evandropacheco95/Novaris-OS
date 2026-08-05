import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { SalesChannel } from "../../../domain/aggregates/sales-channel/sales-channel.js";
import type { SalesChannelRepository } from "../../../domain/repositories/sales-channel-repository.js";
import type { ActivateSalesChannelCommand } from "../../commands/activate-sales-channel/activate-sales-channel.command.js";

/** ActivateSalesChannelHandler — Application Layer, Sales Domain (`ADR-0052`). */
export class ActivateSalesChannelHandler {
  constructor(private readonly salesChannelRepository: SalesChannelRepository) {}

  async execute(command: ActivateSalesChannelCommand): Promise<Result<SalesChannel, DomainError | InfrastructureError>> {
    const findResult = await this.salesChannelRepository.findById(new UniqueEntityId(command.salesChannelId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`SalesChannel "${command.salesChannelId}" não encontrado`));
    }
    const salesChannel = option.getOrElse(null as never);

    const activateResult = salesChannel.activate();
    if (activateResult.isFailure) {
      return Result.fail(activateResult.getError()!);
    }

    const saveResult = await this.salesChannelRepository.save(salesChannel);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(salesChannel);
  }
}
