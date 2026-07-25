import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Case as PrismaCase } from "@novaris/database";
import { Case, type CaseProps, type CaseStatus, type CasePriority } from "../../domain/aggregates/case/case.js";

/** PrismaCaseMapper — tradução direta Aggregate ↔ Prisma, mesmo padrão de `PrismaActivityMapper`. */
export class PrismaCaseMapper {
  static toDomain(record: PrismaCase): Case {
    const props: CaseProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      partyId: new UniqueEntityId(record.partyId),
      subject: record.subject,
      description: record.description ?? undefined,
      status: record.status as CaseStatus,
      priority: record.priority as CasePriority,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return Case.reconstitute(props, new UniqueEntityId(record.id));
  }

  static toPersistence(caseInstance: Case): PrismaCase {
    return {
      id: caseInstance.id.toString(),
      organizationId: caseInstance.organizationId.toString(),
      partyId: caseInstance.partyId.toString(),
      subject: caseInstance.subject,
      description: caseInstance.description ?? null,
      status: caseInstance.status,
      priority: caseInstance.priority,
      createdAt: caseInstance.createdAt,
      updatedAt: caseInstance.updatedAt,
    };
  }
}
