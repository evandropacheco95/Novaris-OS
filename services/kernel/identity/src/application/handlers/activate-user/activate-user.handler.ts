import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { User } from "../../../domain/aggregates/user/user.js";
import type { UserRepository } from "../../../domain/repositories/user-repository.js";
import type { ActivateUserCommand } from "../../commands/activate-user/activate-user.command.js";

/**
 * ActivateUserHandler — Application Layer, Identity Domain.
 *
 * Orquestra: `ActivateUserCommand` → `UserRepository.findById()` →
 * `User.activate()` (transição "created"/"invited" → "active",
 * `IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 11`) → `UserRepository.save()`.
 * Mesmo padrão de `AdvanceOpportunityStageHandler` (Sales) — `findById()`/
 * `save()` sempre verificados (`ENG-0126`).
 */
export class ActivateUserHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: ActivateUserCommand): Promise<Result<User, DomainError | InfrastructureError>> {
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
    const activateResult = user.activate(new UniqueEntityId(command.updatedBy));
    if (activateResult.isFailure) {
      return Result.fail(activateResult.getError()!);
    }

    const saveResult = await this.userRepository.save(user);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(user);
  }
}
