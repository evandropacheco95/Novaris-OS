import { Module } from "@nestjs/common";
import { ConsoleLogger } from "@novaris/logging";
import { ConsoleAIRuntime, ConsoleTextToSqlRuntime } from "@novaris/ai-runtime";
import { AuthModule } from "../auth/auth.module.js";
import { AIRuntimeController } from "./ai-runtime.controller.js";

/**
 * AIRuntimeModule — Composition Root de `ai-runtime` (`ADR-0041`, `ENG-0142`;
 * `ADR-0054`, `ENG-0170`).
 */
@Module({
  imports: [AuthModule],
  controllers: [AIRuntimeController],
  providers: [
    { provide: "AIRuntime", useFactory: () => new ConsoleAIRuntime(new ConsoleLogger()) },
    { provide: "TextToSqlPort", useFactory: () => new ConsoleTextToSqlRuntime(new ConsoleLogger()) },
  ],
})
export class AIRuntimeModule {}
