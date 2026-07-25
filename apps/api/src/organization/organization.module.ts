import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import { createOrganizationRepository, UpdateOrganizationProfileHandler } from "@novaris/organizations";
import { CreateAuditEntryHandler } from "@novaris/audit";
import { AuthModule } from "../auth/auth.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { OrganizationController } from "./organization.controller.js";

const ORGANIZATION_REPOSITORY = "ORGANIZATION_REPOSITORY";

/**
 * OrganizationModule — Composition Root do Organization Domain (`ENG-0128`).
 * Importa `AuditModule` para reaproveitar seu `CreateAuditEntryHandler` já
 * montado — primeira integração real entre um domínio de origem e o Audit
 * Domain (`ADR-0035`, `ENG-0135`).
 */
@Module({
  imports: [AuthModule, AuditModule],
  controllers: [OrganizationController],
  providers: [
    { provide: ORGANIZATION_REPOSITORY, useFactory: () => createOrganizationRepository(prisma) },
    {
      provide: UpdateOrganizationProfileHandler,
      useFactory: (repository: ReturnType<typeof createOrganizationRepository>, createAuditEntryHandler: CreateAuditEntryHandler) =>
        new UpdateOrganizationProfileHandler(repository, createAuditEntryHandler),
      inject: [ORGANIZATION_REPOSITORY, CreateAuditEntryHandler],
    },
    { provide: "OrganizationRepository", useExisting: ORGANIZATION_REPOSITORY },
  ],
})
export class OrganizationModule {}
