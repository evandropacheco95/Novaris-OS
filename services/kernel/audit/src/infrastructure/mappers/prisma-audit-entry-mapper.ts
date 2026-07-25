import { UniqueEntityId } from "@novaris/shared-kernel";
import { Prisma, type AuditEntry as PrismaAuditEntry } from "@novaris/database";
import { AuditEntry, type AuditEntryProps } from "../../domain/aggregates/audit-entry/audit-entry.js";

/**
 * PrismaAuditEntryMapper — tradução pura Aggregate ↔ linha real do Postgres
 * (via Prisma Client), sem I/O próprio. `changeSet` é `Json?` no Postgres —
 * `null` no banco vira `undefined` no domínio (Freeze § 7, forma livre não
 * validada); o inverso na escrita.
 */
export class PrismaAuditEntryMapper {
  static toPersistenceCreate(entry: AuditEntry) {
    return {
      id: entry.id.toString(),
      actorId: entry.actorId.toString(),
      organizationId: entry.organizationId.toString(),
      targetId: entry.targetId.toString(),
      targetType: entry.targetType,
      action: entry.action,
      occurredAt: entry.occurredAt,
      origin: entry.origin,
      changeSet: (entry.changeSet as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
    };
  }

  static toDomain(record: PrismaAuditEntry): AuditEntry {
    const props: AuditEntryProps = {
      actorId: new UniqueEntityId(record.actorId),
      organizationId: new UniqueEntityId(record.organizationId),
      targetId: new UniqueEntityId(record.targetId),
      targetType: record.targetType,
      action: record.action,
      occurredAt: record.occurredAt,
      origin: record.origin,
      changeSet: (record.changeSet as Record<string, unknown> | null) ?? undefined,
    };

    return AuditEntry.reconstitute(props, new UniqueEntityId(record.id));
  }
}
