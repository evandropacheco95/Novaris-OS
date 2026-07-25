import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import { createAuditEntryRepository, CreateAuditEntryHandler } from "@novaris/audit";
import { AuthModule } from "../auth/auth.module.js";
import { AuditEntryController } from "./audit-entry.controller.js";

const AUDIT_ENTRY_REPOSITORY = "AUDIT_ENTRY_REPOSITORY";

/**
 * AuditModule — Composition Root do Audit Domain (`ADR-0035`, `ENG-0135`).
 * Exporta `CreateAuditEntryHandler` para que qualquer módulo de domínio de
 * origem (ex.: `OrganizationModule`) possa importá-lo e injetá-lo em seus
 * próprios Handlers, sem duplicar a montagem do Repository.
 */
@Module({
  imports: [AuthModule],
  controllers: [AuditEntryController],
  providers: [
    { provide: AUDIT_ENTRY_REPOSITORY, useFactory: () => createAuditEntryRepository(prisma) },
    {
      provide: CreateAuditEntryHandler,
      useFactory: (repository: ReturnType<typeof createAuditEntryRepository>) => new CreateAuditEntryHandler(repository),
      inject: [AUDIT_ENTRY_REPOSITORY],
    },
    { provide: "AuditEntryRepository", useExisting: AUDIT_ENTRY_REPOSITORY },
  ],
  exports: [CreateAuditEntryHandler],
})
export class AuditModule {}
