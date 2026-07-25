import { Body, Controller, Delete, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  CreateRoleCommand,
  CreateRoleHandler,
  GrantPermissionCommand,
  GrantPermissionHandler,
  RevokePermissionCommand,
  RevokePermissionHandler,
  type RoleRepository,
} from "@novaris/identity";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface RoleResponse {
  id: string;
  organizationId: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

/** RoleController — API do Identity Domain (`ENG-0128`). Mesma receita de `UserController`. */
@Controller("roles")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("identity.roles.manage")
export class RoleController {
  constructor(
    private readonly createHandler: CreateRoleHandler,
    private readonly grantHandler: GrantPermissionHandler,
    private readonly revokeHandler: RevokePermissionHandler,
    @Inject("RoleRepository") private readonly repository: RoleRepository,
  ) {}

  @Post()
  async create(@Body() body: { name: string }, @Req() req: AuthenticatedRequest): Promise<RoleResponse> {
    const command = new CreateRoleCommand({ organizationId: req.user.organizationId, name: body.name, createdBy: req.user.userId });
    const result = await this.createHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<RoleResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Roles" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((role) => role.organizationId.toString() === req.user.organizationId)
      .map((role) => toResponse(role));
  }

  @Post(":id/permissions")
  async grantPermission(@Param("id") id: string, @Body() body: { permissionCode: string }, @Req() req: AuthenticatedRequest): Promise<RoleResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const command = new GrantPermissionCommand({ roleId: id, permissionCode: body.permissionCode, updatedBy: req.user.userId });
    const result = await this.grantHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Delete(":id/permissions/:code")
  async revokePermission(@Param("id") id: string, @Param("code") code: string, @Req() req: AuthenticatedRequest): Promise<RoleResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const command = new RevokePermissionCommand({ roleId: id, permissionCode: code, updatedBy: req.user.userId });
    const result = await this.revokeHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Role" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Role "${id}" não encontrada` });
    }
    const role = option.getOrElse(null as never);
    if (role.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Role "${id}" não encontrada` });
    }
    return role;
  }
}

function toResponse(role: {
  id: { toString(): string };
  organizationId: { toString(): string };
  name: string;
  permissions: ReadonlyArray<{ code: string }>;
  createdAt: Date;
  updatedAt: Date;
}): RoleResponse {
  return {
    id: role.id.toString(),
    organizationId: role.organizationId.toString(),
    name: role.name,
    permissions: role.permissions.map((permission) => permission.code),
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  };
}
