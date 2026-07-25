import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Reminder } from "../../../domain/aggregates/reminder/reminder.js";
import type { ReminderRepository } from "../../../domain/repositories/reminder-repository.js";
import type { DismissReminderCommand } from "../../commands/dismiss-reminder/dismiss-reminder.command.js";

/** DismissReminderHandler — Application Layer, Activity Domain (`ADR-0045`). */
export class DismissReminderHandler {
  constructor(private readonly reminderRepository: ReminderRepository) {}

  async execute(command: DismissReminderCommand): Promise<Result<Reminder, DomainError | InfrastructureError>> {
    const findResult = await this.reminderRepository.findById(new UniqueEntityId(command.reminderId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Reminder "${command.reminderId}" não encontrado`));
    }
    const reminder = option.getOrElse(null as never);

    const dismissResult = reminder.dismiss();
    if (dismissResult.isFailure) {
      return Result.fail(dismissResult.getError()!);
    }

    const saveResult = await this.reminderRepository.save(reminder);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(reminder);
  }
}
