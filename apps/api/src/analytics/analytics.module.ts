import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import { createDashboardRepository, CreateDashboardHandler, AddWidgetToDashboardHandler } from "@novaris/analytics";
import { AuthModule } from "../auth/auth.module.js";
import { DashboardController } from "./dashboard.controller.js";

const DASHBOARD_REPOSITORY = "DASHBOARD_REPOSITORY";

/** AnalyticsModule — Composition Root do Analytics Domain (`ENG-0133`). */
@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useFactory: () => createDashboardRepository(prisma) },
    {
      provide: CreateDashboardHandler,
      useFactory: (repository: ReturnType<typeof createDashboardRepository>) => new CreateDashboardHandler(repository),
      inject: [DASHBOARD_REPOSITORY],
    },
    {
      provide: AddWidgetToDashboardHandler,
      useFactory: (repository: ReturnType<typeof createDashboardRepository>) => new AddWidgetToDashboardHandler(repository),
      inject: [DASHBOARD_REPOSITORY],
    },
    { provide: "DashboardRepository", useExisting: DASHBOARD_REPOSITORY },
  ],
})
export class AnalyticsModule {}
