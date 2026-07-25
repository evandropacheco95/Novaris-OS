import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Subscription } from "../../../domain/aggregates/subscription/subscription.js";
import type { SubscriptionRepository } from "../../../domain/repositories/subscription-repository.js";
import type { CreateSubscriptionCommand } from "../../commands/create-subscription/create-subscription.command.js";

/** CreateSubscriptionHandler — Application Layer, Financial Domain. */
export class CreateSubscriptionHandler {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  async execute(command: CreateSubscriptionCommand): Promise<Result<Subscription, DomainError | InfrastructureError>> {
    const createResult = Subscription.create({
      organizationId: new UniqueEntityId(command.organizationId),
      name: command.name,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }

    const subscription = createResult.getValue()!;
    const saveResult = await this.subscriptionRepository.save(subscription);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(subscription);
  }
}
