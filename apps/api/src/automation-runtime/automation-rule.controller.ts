import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import {
  CreateAutomationRuleCommand,
  CreateAutomationRuleHandler,
  ToggleAutomationRuleCommand,
  ToggleAutomationRuleHandler,
  type AutomationAction,
  type AutomationRuleRepository,
} from "@novaris/automation-runtime";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";
import { throwHttpExceptionForDomainError } from "../shared/http-error-mapper.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

export interface AutomationRuleResponse {
  id: string;
  name: string;
  triggerEventName: string;
  actions: AutomationAction[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * AutomationRuleController — API de `automation-runtime` (`ADR-0041`,
 * `ENG-0142`). `POST`/`GET` seguem o mesmo isolamento de tenant reforçado em
 * código de todo Controller desta API.
 */
@Controller("automation-rules")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("system.automation-rules.manage")
export class AutomationRuleController {
  constructor(
    private readonly createHandler: CreateAutomationRuleHandler,
    private readonly toggleHandler: ToggleAutomationRuleHandler,
    @Inject("AutomationRuleRepository") private readonly repository: AutomationRuleRepository,
  ) {}

  @Post()
  async create(
    @Body() body: { name: string; triggerEventName: string; actions: AutomationAction[] },
    @Req() req: AuthenticatedRequest,
  ): Promise<AutomationRuleResponse> {
    const result = await this.createHandler.execute(
      new CreateAutomationRuleCommand({
        organizationId: req.user.organizationId,
        name: body.name,
        triggerEventName: body.triggerEventName,
        actions: body.actions,
      }),
    );
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest): Promise<AutomationRuleResponse[]> {
    const findResult = await this.repository.findAll();
    if (findResult.isFailure) {
      throw new HttpException({ code: "INFRASTRUCTURE_ERROR", message: "Falha ao listar AutomationRules" }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return findResult
      .getValue()!
      .filter((rule) => rule.organizationId.toString() === req.user.organizationId)
      .map((rule) => toResponse(rule));
  }

  @Post(":id/toggle")
  async toggle(@Param("id") id: string, @Body() body: { enabled: boolean }): Promise<AutomationRuleResponse> {
    const result = await this.toggleHandler.execute(new ToggleAutomationRuleCommand({ ruleId: id, enabled: body.enabled }));
    if (result.isFailure) {
      throwHttpExceptionForDomainError(result.getError()!);
    }
    return toResponse(result.getValue()!);
  }
}

function toResponse(rule: {
  id: { toString(): string };
  name: string;
  triggerEventName: string;
  actions: ReadonlyArray<AutomationAction>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AutomationRuleResponse {
  return {
    id: rule.id.toString(),
    name: rule.name,
    triggerEventName: rule.triggerEventName,
    actions: [...rule.actions],
    enabled: rule.enabled,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  };
}
