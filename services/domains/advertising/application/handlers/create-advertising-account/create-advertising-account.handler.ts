import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { AdvertisingAccount } from "../../../domain/aggregates/advertising-account/advertising-account.js";
import type { AdvertisingAccountRepository } from "../../../domain/repositories/advertising-account-repository.js";
import type { CreateAdvertisingAccountCommand } from "../../commands/create-advertising-account/create-advertising-account.command.js";

/** CreateAdvertisingAccountHandler — orquestra: `CreateAdvertisingAccountCommand` → `AdvertisingAccount.create()` → `AdvertisingAccountRepository.save()`. */
export class CreateAdvertisingAccountHandler {
  constructor(private readonly advertisingAccountRepository: AdvertisingAccountRepository) {}

  async execute(command: CreateAdvertisingAccountCommand): Promise<Result<AdvertisingAccount, DomainError | InfrastructureError>> {
    const createResult = AdvertisingAccount.create({
      organizationId: new UniqueEntityId(command.organizationId),
      provider: command.provider,
      name: command.name,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }

    const advertisingAccount = createResult.getValue()!;
    const saveResult = await this.advertisingAccountRepository.save(advertisingAccount);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(advertisingAccount);
  }
}
