import { Body, Controller, Inject, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import type { AIRuntime, AIResponse, TextToSqlPort, TextToSqlResult } from "@novaris/ai-runtime";
import { JwtAuthGuard, type AuthenticatedUser } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

/**
 * AIRuntimeController — API de `ai-runtime` (`ADR-0041`, `ENG-0142`;
 * `ADR-0054`, `ENG-0170`). Nenhuma rota chama um modelo de IA real —
 * `loggedOnly: true` em toda resposta, mesmo critério de transparência de
 * `integration-hub`.
 */
@Controller("ai")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("system.ai-runtime.manage")
export class AIRuntimeController {
  constructor(
    @Inject("AIRuntime") private readonly aiRuntime: AIRuntime,
    @Inject("TextToSqlPort") private readonly textToSql: TextToSqlPort,
  ) {}

  @Post("ask")
  async ask(@Body() body: { prompt: string; context?: Record<string, unknown> }): Promise<AIResponse> {
    return this.aiRuntime.ask(body.prompt, body.context);
  }

  /** Text-to-SQL (`ADR-0054`) — pergunta em linguagem natural, `sql: null` até um adapter real existir (nenhuma credencial de IA hoje). */
  @Post("text-to-sql")
  async textToSqlAsk(@Body() body: { question: string }, @Req() req: AuthenticatedRequest): Promise<TextToSqlResult> {
    return this.textToSql.ask(body.question, { organizationId: req.user.organizationId });
  }
}
