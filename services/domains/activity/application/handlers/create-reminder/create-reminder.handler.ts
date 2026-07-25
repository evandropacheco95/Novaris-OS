import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Reminder } from "../../../domain/aggregates/reminder/reminder.js";
import type { ReminderRepository } from "../../../domain/repositories/reminder-repository.js";
import type { CreateReminderCommand } from "../../commands/create-reminder/create-reminder.command.js";

/** CreateReminderHandler — Application Layer, Activity Domain (`ADR-0045`). */
export class CreateReminderHandler {
  constructor(private readonly reminderRepository: ReminderRepository) {}

  async execute(command: CreateReminderCommand): Promise<Result<Reminder, DomainError | InfrastructureError>> {
    const createResult = Reminder.create({
      organizationId: new UniqueEntityId(command.organizationId),
      partyId: new UniqueEntityId(command.partyId),
      message: command.message,
      remindAt: new Date(command.remindAt),
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const reminder = createResult.getValue()!;

    const saveResult = await this.reminderRepository.save(reminder);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(reminder);
  }
}
