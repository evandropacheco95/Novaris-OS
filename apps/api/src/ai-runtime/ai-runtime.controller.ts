import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import type { AIRuntime, AIResponse } from "@novaris/ai-runtime";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { PermissionGuard } from "../auth/permission.guard.js";
import { RequirePermission } from "../auth/require-permission.decorator.js";

/**
 * AIRuntimeController — API de `ai-runtime` (`ADR-0041`, `ENG-0142`).
 * `POST /ai/ask` nunca chama um modelo de IA real — `loggedOnly: true` em
 * toda resposta, mesmo critério de transparência de `integration-hub`.
 */
@Controller("ai")
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission("system.ai-runtime.manage")
export class AIRuntimeController {
  constructor(@Inject("AIRuntime") private readonly aiRuntime: AIRuntime) {}

  @Post("ask")
  async ask(@Body() body: { prompt: string; context?: Record<string, unknown> }): Promise<AIResponse> {
    return this.aiRuntime.ask(body.prompt, body.context);
  }
}
