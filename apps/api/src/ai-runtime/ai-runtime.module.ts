import { Module } from "@nestjs/common";
import { ConsoleLogger } from "@novaris/logging";
import { ConsoleAIRuntime } from "@novaris/ai-runtime";
import { AuthModule } from "../auth/auth.module.js";
import { AIRuntimeController } from "./ai-runtime.controller.js";

/**
 * AIRuntimeModule — Composition Root de `ai-runtime` (`ADR-0041`, `ENG-0142`).
 */
@Module({
  imports: [AuthModule],
  controllers: [AIRuntimeController],
  providers: [{ provide: "AIRuntime", useFactory: () => new ConsoleAIRuntime(new ConsoleLogger()) }],
})
export class AIRuntimeModule {}
