import { Body, Controller, Delete, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  CreateUserCommand,
  CreateUserHandler,
  ActivateUserCommand,
  ActivateUserHandler,
  DisableUserCommand,
  DisableUserHandler,
  AssignRoleCommand,
  AssignRoleHandler,
  RevokeRoleCommand,
  RevokeRoleHandler,
  type UserRepository,
} from "@novaris/identity";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface UserResponse {
  id: string;
  organizationId: string;
  email: string;
  status: string;
  roleIds: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * UserController — API do Identity Domain (`ENG-0128`), mesma receita
 * provada em `PartyController` (Customer, `ENG-0125`). Expõe o ciclo de
 * vida completo já modelado no Domain Layer: criar, ativar, desativar,
 * atribuir/revogar Role.
 *
 * Isolamento de tenant reforçado em código, mesmo padrão de
 * `OpportunityController`/`PartyController` (RLS não protege nada nesta API,
 * `DATABASE_ARCHITECTURE.md § 7`).
 */
@Controller("users")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("identity.users.manage")
export class UserController {
  constructor(
    private readonly createHandler: CreateUserHandler,
    private readonly activateHandler: ActivateUserHandler,
    private readonly disableHandler: DisableUserHandler,
    private readonly assignRoleHandler: AssignRoleHandler,
    private readonly revokeRoleHandler: RevokeRoleHandler,
    @Inject("UserRepository") private readonly repository: UserRepository,
  ) {}

  @Post()
  async create(@Body() body: { email: string }, @Req() req: AuthenticatedRequest): Promise<UserResponse> {
    const command = new CreateUserCommand({ organizationId: req.user.organizationId, email: body.email, createdBy: req.user.userId });
    const result = await this.createHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<UserResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Users" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((user) => user.organizationId.toString() === req.user.organizationId)
      .map((user) => toResponse(user));
  }

  @Get(":id")
  async findById(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<UserResponse> {
    const user = await this.loadAndAssertOwnership(id, req.user);
    return toResponse(user);
  }

  @Post(":id/activate")
  async activate(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<UserResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const command = new ActivateUserCommand({ userId: id, updatedBy: req.user.userId });
    const result = await this.activateHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/disable")
  async disable(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<UserResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const command = new DisableUserCommand({ userId: id, updatedBy: req.user.userId });
    const result = await this.disableHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/roles")
  async assignRole(@Param("id") id: string, @Body() body: { roleId: string }, @Req() req: AuthenticatedRequest): Promise<UserResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const command = new AssignRoleCommand({ userId: id, roleId: body.roleId, assignedBy: req.user.userId });
    const result = await this.assignRoleHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(await this.loadAndAssertOwnership(id, req.user));
  }

  @Delete(":id/roles/:roleId")
  async revokeRole(@Param("id") id: string, @Param("roleId") roleId: string, @Req() req: AuthenticatedRequest): Promise<UserResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const command = new RevokeRoleCommand({ userId: id, roleId, updatedBy: req.user.userId });
    const result = await this.revokeRoleHandler.execute(command);
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar User" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `User "${id}" não encontrado` });
    }
    const foundUser = option.getOrElse(null as never);
    if (foundUser.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `User "${id}" não encontrado` });
    }
    return foundUser;
  }
}

function toResponse(user: {
  id: { toString(): string };
  organizationId: { toString(): string };
  email: { value: string };
  status: string;
  roleIds: ReadonlyArray<{ toString(): string }>;
  createdAt: Date;
  updatedAt: Date;
}): UserResponse {
  return {
    id: user.id.toString(),
    organizationId: user.organizationId.toString(),
    email: user.email.value,
    status: user.status,
    roleIds: user.roleIds.map((roleId) => roleId.toString()),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
