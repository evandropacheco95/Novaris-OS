import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Activity } from "../../../domain/aggregates/activity/activity.js";
import type { ActivityRepository } from "../../../domain/repositories/activity-repository.js";
import type { CompleteActivityCommand } from "../../commands/complete-activity/complete-activity.command.js";

/**
 * CompleteActivityHandler — Application Layer, Activity Domain.
 * Orquestra: `CompleteActivityCommand` → `ActivityRepository.findById()` →
 * `Activity.complete()` (dispara `ActivityCompleted`) → `ActivityRepository.save()`.
 */
export class CompleteActivityHandler {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async execute(command: CompleteActivityCommand): Promise<Result<Activity, DomainError | InfrastructureError>> {
    const activityId = new UniqueEntityId(command.activityId);

    const findResult = await this.activityRepository.findById(activityId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Activity "${command.activityId}" não encontrada`));
    }

    const activity = option.getOrElse(null as never);
    const completeResult = activity.complete();
    if (completeResult.isFailure) {
      return Result.fail(completeResult.getError()!);
    }

    const saveResult = await this.activityRepository.save(activity);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(activity);
  }
}
