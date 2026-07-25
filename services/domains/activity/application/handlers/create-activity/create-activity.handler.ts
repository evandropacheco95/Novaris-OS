import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Activity } from "../../../domain/aggregates/activity/activity.js";
import type { ActivityRepository } from "../../../domain/repositories/activity-repository.js";
import type { CreateActivityCommand } from "../../commands/create-activity/create-activity.command.js";

/** CreateActivityHandler — Application Layer, Activity Domain. Orquestra: `CreateActivityCommand` → `Activity.create()` → `ActivityRepository.save()`. */
export class CreateActivityHandler {
  constructor(private readonly activityRepository: ActivityRepository) {}

  async execute(command: CreateActivityCommand): Promise<Result<Activity, DomainError | InfrastructureError>> {
    const createResult = Activity.create({
      organizationId: new UniqueEntityId(command.organizationId),
      partyId: new UniqueEntityId(command.partyId),
      type: command.type,
      notes: command.notes,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }

    const activity = createResult.getValue()!;
    const saveResult = await this.activityRepository.save(activity);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(activity);
  }
}
