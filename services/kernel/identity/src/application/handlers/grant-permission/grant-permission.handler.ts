import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Role } from "../../../domain/aggregates/role/role.js";
import type { RoleRepository } from "../../../domain/repositories/role-repository.js";
import { Permission } from "../../../domain/value-objects/permission.js";
import type { GrantPermissionCommand } from "../../commands/grant-permission/grant-permission.command.js";

/**
 * GrantPermissionHandler — Application Layer, Identity Domain.
 *
 * Orquestra: `GrantPermissionCommand` → `Permission.create()` (valida o
 * formato `<domínio>.<recurso>.<ação>`) → `RoleRepository.findById()` →
 * `Role.grantPermission()` → `RoleRepository.save()`.
 */
export class GrantPermissionHandler {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(command: GrantPermissionCommand): Promise<Result<Role, DomainError | InfrastructureError>> {
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
    const grantResult = role.grantPermission(permissionResult.getValue()!, new UniqueEntityId(command.updatedBy));
    if (grantResult.isFailure) {
      return Result.fail(grantResult.getError()!);
    }

    const saveResult = await this.roleRepository.save(role);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(role);
  }
}
