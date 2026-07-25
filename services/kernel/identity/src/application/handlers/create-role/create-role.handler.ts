import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Role } from "../../../domain/aggregates/role/role.js";
import type { RoleRepository } from "../../../domain/repositories/role-repository.js";
import type { CreateRoleCommand } from "../../commands/create-role/create-role.command.js";

/**
 * CreateRoleHandler — Application Layer, Identity Domain.
 *
 * Orquestra: `CreateRoleCommand` → `Role.create()` → `RoleRepository.save()`.
 * `Role` nasce sem nenhuma `Permission` (`role.ts`) — conceder permissões é
 * um caso de uso separado (`GrantPermissionHandler`).
 */
export class CreateRoleHandler {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(command: CreateRoleCommand): Promise<Result<Role, DomainError | InfrastructureError>> {
    const createResult = Role.create({
      organizationId: new UniqueEntityId(command.organizationId),
      name: command.name,
      createdBy: new UniqueEntityId(command.createdBy),
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }

    const role = createResult.getValue()!;
    const saveResult = await this.roleRepository.save(role);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(role);
  }
}
