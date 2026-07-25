import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import { DatabaseHealthCheck } from "@novaris/monitoring";
import { ConsoleLogger } from "@novaris/logging";
import { HealthController } from "./health.controller.js";

/**
 * HealthModule — Composition Root de `GET /health` (`ENG-0140`, `ADR-0039`).
 */
@Module({
  controllers: [HealthController],
  providers: [{ provide: "HealthCheck", useFactory: () => new DatabaseHealthCheck(prisma, new ConsoleLogger()) }],
})
export class HealthModule {}
