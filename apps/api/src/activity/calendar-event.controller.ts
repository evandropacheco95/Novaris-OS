import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  CreateCalendarEventCommand,
  CreateCalendarEventHandler,
  RescheduleCalendarEventCommand,
  RescheduleCalendarEventHandler,
  type CalendarEventRepository,
} from "@novaris/activity";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface CalendarEventResponse {
  id: string;
  partyId: string;
  subject: string;
  startAt: string;
  endAt: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

/** CalendarEventController — API do `CalendarEvent` (`ADR-0045`), Activity Domain, adaptado do Salesforce Event. */
@Controller("calendar-events")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("activity.calendar-events.manage")
export class CalendarEventController {
  constructor(
    private readonly createHandler: CreateCalendarEventHandler,
    private readonly rescheduleHandler: RescheduleCalendarEventHandler,
    @Inject("CalendarEventRepository") private readonly repository: CalendarEventRepository,
  ) {}

  @Post()
  async create(
    @Body() body: { partyId: string; subject: string; startAt: string; endAt: string; location?: string },
    @Req() req: AuthenticatedRequest,
  ): Promise<CalendarEventResponse> {
    const result = await this.createHandler.execute(
      new CreateCalendarEventCommand({
        organizationId: req.user.organizationId,
        partyId: body.partyId,
        subject: body.subject,
        startAt: body.startAt,
        endAt: body.endAt,
        location: body.location,
      }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<CalendarEventResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar CalendarEvents" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((event) => event.organizationId.toString() === req.user.organizationId)
      .map((event) => toResponse(event));
  }

  @Post(":id/reschedule")
  async reschedule(@Param("id") id: string, @Body() body: { startAt: string; endAt: string }, @Req() req: AuthenticatedRequest): Promise<CalendarEventResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.rescheduleHandler.execute(new RescheduleCalendarEventCommand({ calendarEventId: id, startAt: body.startAt, endAt: body.endAt }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar CalendarEvent" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `CalendarEvent "${id}" não encontrado` });
    }
    const event = option.getOrElse(null as never);
    if (event.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `CalendarEvent "${id}" não encontrado` });
    }
    return event;
  }
}

function toResponse(event: {
  id: { toString(): string };
  partyId: { toString(): string };
  subject: string;
  startAt: Date;
  endAt: Date;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}): CalendarEventResponse {
  return {
    id: event.id.toString(),
    partyId: event.partyId.toString(),
    subject: event.subject,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    location: event.location,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
  };
}
