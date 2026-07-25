import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Role } from "../../../domain/aggregates/role/role.js";
import type { RoleRepository } from "../../../domain/repositories/role-repository.js";
import { Permission } from "../../../domain/value-objects/permission.js";
import type { RevokePermissionCommand } from "../../commands/revoke-permission/revoke-permission.command.js";

/**
 * RevokePermissionHandler — Application Layer, Identity Domain. Mesmo
 * padrão de `GrantPermissionHandler` — `Role.revokePermission()` é
 * idempotente (`role.ts`), revogar uma permissão não concedida não falha.
 */
export class RevokePermissionHandler {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(command: RevokePermissionCommand): Promise<Result<Role, DomainError | InfrastructureError>> {
    const permissionResult = Permission.create(command.permissionCode);
    if (permissionResult.isFailure) {
      return Result.fail(permissionResult.getError()!);
    }

    const roleId = new UniqueEntityId(command.roleId);
    const findResult = await this.roleRepository.findById(roleId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Role "${command.roleId}" não encontrada`));
    }

    const role = option.getOrElse(null as never);
    const revokeResult = role.revokePermission(permissionResult.getValue()!, new UniqueEntityId(command.updatedBy));
    if (revokeResult.isFailure) {
      return Result.fail(revokeResult.getError()!);
    }

    const saveResult = await this.roleRepository.save(role);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(role);
  }
}
