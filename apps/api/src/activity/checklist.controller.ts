import { Body, Controller, ForbiddenException, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { UniqueEntityId } from "@novaris/shared-kernel";
import {
  CreateChecklistCommand,
  CreateChecklistHandler,
  AddChecklistItemCommand,
  AddChecklistItemHandler,
  ToggleChecklistItemCommand,
  ToggleChecklistItemHandler,
  type ChecklistRepository,
} from "@novaris/activity";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface ChecklistItemResponse {
  id: string;
  label: string;
  completed: boolean;
}

export interface ChecklistResponse {
  id: string;
  partyId: string;
  title: string;
  items: ChecklistItemResponse[];
  createdAt: string;
  updatedAt: string;
}

/** ChecklistController — API do `Checklist` (`ADR-0045`), Activity Domain. */
@Controller("checklists")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("activity.checklists.manage")
export class ChecklistController {
  constructor(
    private readonly createHandler: CreateChecklistHandler,
    private readonly addItemHandler: AddChecklistItemHandler,
    private readonly toggleItemHandler: ToggleChecklistItemHandler,
    @Inject("ChecklistRepository") private readonly repository: ChecklistRepository,
  ) {}

  @Post()
  async create(@Body() body: { partyId: string; title: string }, @Req() req: AuthenticatedRequest): Promise<ChecklistResponse> {
    const result = await this.createHandler.execute(new CreateChecklistCommand({ organizationId: req.user.organizationId, partyId: body.partyId, title: body.title }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<ChecklistResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar Checklists" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((checklist) => checklist.organizationId.toString() === req.user.organizationId)
      .map((checklist) => toResponse(checklist));
  }

  @Post(":id/items")
  async addItem(@Param("id") id: string, @Body() body: { label: string }, @Req() req: AuthenticatedRequest): Promise<ChecklistResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.addItemHandler.execute(new AddChecklistItemCommand({ checklistId: id, label: body.label }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Post(":id/items/:itemId/toggle")
  async toggleItem(@Param("id") id: string, @Param("itemId") itemId: string, @Req() req: AuthenticatedRequest): Promise<ChecklistResponse> {
    await this.loadAndAssertOwnership(id, req.user);
    const result = await this.toggleItemHandler.execute(new ToggleChecklistItemCommand({ checklistId: id, itemId }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  private async loadAndAssertOwnership(id: string, user: AuthenticatedUser) {
    const findResult = await this.repository.findById(new UniqueEntityId(id));
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao buscar Checklist" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Checklist "${id}" não encontrado` });
    }
    const checklist = option.getOrElse(null as never);
    if (checklist.organizationId.toString() !== user.organizationId) {
      throw new ForbiddenException({ code: "NOT_FOUND_ERROR", message: `Checklist "${id}" não encontrado` });
    }
    return checklist;
  }
}

function toResponse(checklist: {
  id: { toString(): string };
  partyId: { toString(): string };
  title: string;
  createdAt: Date;
  updatedAt: Date;
  getItems(): ReadonlyArray<{ id: { toString(): string }; label: string; completed: boolean }>;
}): ChecklistResponse {
  return {
    id: checklist.id.toString(),
    partyId: checklist.partyId.toString(),
    title: checklist.title,
    items: checklist.getItems().map((item) => ({ id: item.id.toString(), label: item.label, completed: item.completed })),
    createdAt: checklist.createdAt.toISOString(),
    updatedAt: checklist.updatedAt.toISOString(),
  };
}
