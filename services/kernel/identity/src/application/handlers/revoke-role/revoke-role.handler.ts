import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { User } from "../../../domain/aggregates/user/user.js";
import type { UserRepository } from "../../../domain/repositories/user-repository.js";
import type { RevokeRoleCommand } from "../../commands/revoke-role/revoke-role.command.js";

/**
 * RevokeRoleHandler — Application Layer, Identity Domain.
 *
 * Diferente de `AssignRoleHandler`, não delega a um Domain Service — revogar
 * não exige a checagem cruzada de Organization que `RoleAssignmentDomainService`
 * faz para atribuir (não há risco de "vazar" um Role de outra Organization ao
 * remover uma referência já existente). `User.revokeRole()` é idempotente
 * (`user.ts`) — revogar um `roleId` não atribuído não falha.
 */
export class RevokeRoleHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: RevokeRoleCommand): Promise<Result<User, DomainError | InfrastructureError>> {
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
    const revokeResult = user.revokeRole(new UniqueEntityId(command.roleId), new UniqueEntityId(command.updatedBy));
    if (revokeResult.isFailure) {
      return Result.fail(revokeResult.getError()!);
    }

    const saveResult = await this.userRepository.save(user);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(user);
  }
}
