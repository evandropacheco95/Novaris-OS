import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { CreateReminderCommand, CreateReminderHandler, DismissReminderCommand, DismissReminderHandler, type ReminderRepository } from "@novaris/activity";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface ReminderResponse {
  id: string;
  partyId: string;
  message: string;
  remindAt: string;
  dismissed: boolean;
  createdAt: string;
  updatedAt: string;
}

/** ReminderController — API do `Reminder` (`ADR-0045`), Activity Domain, adaptado do Salesforce Reminder. */
@Controller("reminders")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("activity.reminders.manage")
export class ReminderController {
  constructor(
    private readonly createHandler: CreateReminderHandler,
    private readonly dismissHandler: DismissReminderHandler,
    @Inject("ReminderRepository") private readonly repository: ReminderRepository,
  ) {}

  @Post()
  async create(@Body() body: { partyId: string; message: string; remindAt: string }, @Req() req: AuthenticatedRequest): Promise<ReminderResponse> {
    const result = await this.createHandler.execute(
      new CreateReminderCommand({ organizationId: req.user.organizationId, partyId: body.partyId, message: body.message, remindAt: body.remindAt }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<ReminderResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Reminders" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((reminder) => reminder.organizationId.toString() === req.user.organizationId)
      .map((reminder) => toResponse(reminder));
  }

  @Post(":id/dismiss")
  async dismiss(@Param("id") id: string, @Req() req: AuthenticatedRequest): Promise<ReminderResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.dismissHandler.execute(new DismissReminderCommand({ reminderId: id }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Reminder" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Reminder "${id}" não encontrado` });
    }
    const reminder = option.getOrElse(null as never);
    if (reminder.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Reminder "${id}" não encontrado` });
    }
    return reminder;
  }
}

function toResponse(reminder: {
  id: { toString(): string };
  partyId: { toString(): string };
  message: string;
  remindAt: Date;
  dismissed: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ReminderResponse {
  return {
    id: reminder.id.toString(),
    partyId: reminder.partyId.toString(),
    message: reminder.message,
    remindAt: reminder.remindAt.toISOString(),
    dismissed: reminder.dismissed,
    createdAt: reminder.createdAt.toISOString(),
    updatedAt: reminder.updatedAt.toISOString(),
  };
}
