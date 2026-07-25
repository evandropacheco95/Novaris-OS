import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { User } from "../../../domain/aggregates/user/user.js";
import type { UserRepository } from "../../../domain/repositories/user-repository.js";
import type { DisableUserCommand } from "../../commands/disable-user/disable-user.command.js";

/**
 * DisableUserHandler — Application Layer, Identity Domain.
 *
 * Orquestra: `DisableUserCommand` → `UserRepository.findById()` →
 * `User.disable()` (transição "active" → "disabled",
 * `IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 11`; reativação `requer decisão`,
 * não implementada) → `UserRepository.save()`.
 */
export class DisableUserHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: DisableUserCommand): Promise<Result<User, DomainError | InfrastructureError>> {
    const userId = new UniqueEntityId(command.userId);

    const findResult = await this.userRepository.findById(userId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`User "${command.userId}" não encontrado`));
    }

    const user = option.getOrElse(null as never);
    const disableResult = user.disable(new UniqueEntityId(command.updatedBy));
    if (disableResult.isFailure) {
      return Result.fail(disableResult.getError()!);
    }

    const saveResult = await this.userRepository.save(user);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(user);
  }
}
