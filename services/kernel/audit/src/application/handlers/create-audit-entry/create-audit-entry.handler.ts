import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { AuditEntry } from "../../../domain/aggregates/audit-entry/audit-entry.js";
import type { AuditEntryRepository } from "../../../domain/repositories/audit-entry-repository.js";
import type { CreateAuditEntryCommand } from "../../commands/create-audit-entry/create-audit-entry.command.js";

/**
 * CreateAuditEntryHandler — Application Layer, Audit Domain. Orquestra:
 * `CreateAuditEntryCommand` → `AuditEntry.create()` → `AuditEntryRepository.save()`.
 * Único ponto de escrita — `AuditEntry` nunca é atualizado após persistido
 * (`save` é write-once, `AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md § 2`).
 */
export class CreateAuditEntryHandler {
  constructor(private readonly auditEntryRepository: AuditEntryRepository) {}

  async execute(command: CreateAuditEntryCommand): Promise<Result<AuditEntry, DomainError | InfrastructureError>> {
    const createResult = AuditEntry.create({
      actorId: new UniqueEntityId(command.actorId),
      organizationId: new UniqueEntityId(command.organizationId),
      targetId: new UniqueEntityId(command.targetId),
      targetType: command.targetType,
      action: command.action,
      occurredAt: command.occurredAt,
      origin: command.origin,
      changeSet: command.changeSet,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }

    const entry = createResult.getValue()!;
    const saveResult = await this.auditEntryRepository.save(entry);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(entry);
  }
}
