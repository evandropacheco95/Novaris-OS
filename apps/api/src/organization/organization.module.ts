import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import { createOrganizationRepository, UpdateOrganizationProfileHandler, UpdateOrganizationPlanHandler, type OrganizationRepository } from "@novaris/organizations";
import { CreateAuditEntryHandler } from "@novaris/audit";
import { UploadFileHandler } from "@novaris/files";
import { AuthModule } from "../auth/auth.module.js";
import { AuditModule } from "../audit/audit.module.js";
import { FilesModule } from "../files/files.module.js";
import { OrganizationController } from "./organization.controller.js";
import { ExportOrganizationDataHandler } from "./export-organization-data.js";

const ORGANIZATION_REPOSITORY = "ORGANIZATION_REPOSITORY";

/**
 * OrganizationModule — Composition Root do Organization Domain (`ENG-0128`).
 * Importa `AuditModule` para reaproveitar seu `CreateAuditEntryHandler` já
 * montado — primeira integração real entre um domínio de origem e o Audit
 * Domain (`ADR-0035`, `ENG-0135`). Importa `FilesModule` para reaproveitar
 * `UploadFileHandler` no export de dados de tenant (`ADR-0057`).
 */
@Module({
  imports: [AuthModule, AuditModule, FilesModule],
  controllers: [OrganizationController],
  providers: [
    { provide: ORGANIZATION_REPOSITORY, useFactory: () => createOrganizationRepository(prisma) },
    {
      provide: UpdateOrganizationProfileHandler,
      useFactory: (repository: ReturnType<typeof createOrganizationRepository>, createAuditEntryHandler: CreateAuditEntryHandler) =>
        new UpdateOrganizationProfileHandler(repository, createAuditEntryHandler),
      inject: [ORGANIZATION_REPOSITORY, CreateAuditEntryHandler],
    },
    {
      provide: UpdateOrganizationPlanHandler,
      useFactory: (repository: ReturnType<typeof createOrganizationRepository>, createAuditEntryHandler: CreateAuditEntryHandler) =>
        new UpdateOrganizationPlanHandler(repository, createAuditEntryHandler),
      inject: [ORGANIZATION_REPOSITORY, CreateAuditEntryHandler],
    },
    {
      provide: ExportOrganizationDataHandler,
      useFactory: (repository: OrganizationRepository, uploadFileHandler: UploadFileHandler) =>
        new ExportOrganizationDataHandler(repository, uploadFileHandler),
      inject: [ORGANIZATION_REPOSITORY, UploadFileHandler],
    },
    { provide: "OrganizationRepository", useExisting: ORGANIZATION_REPOSITORY },
  ],
})
export class OrganizationModule {}
