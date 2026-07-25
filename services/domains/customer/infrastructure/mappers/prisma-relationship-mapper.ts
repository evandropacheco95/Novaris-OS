import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Relationship as PrismaRelationship } from "@novaris/database";
import { Relationship, type RelationshipProps, type RelationshipType } from "../../domain/aggregates/relationship/relationship.js";

/**
 * PrismaRelationshipMapper — tradução pura Aggregate ↔ linha real do Postgres
 * (via Prisma Client), sem I/O próprio. Mesma disciplina de `PrismaPartyMapper`.
 */
export class PrismaRelationshipMapper {
  static toPersistenceCreate(relationship: Relationship) {
    return {
      id: relationship.id.toString(),
      organizationId: relationship.organizationId.toString(),
      partyIdA: relationship.partyIdA.toString(),
      partyIdB: relationship.partyIdB.toString(),
      type: relationship.type,
    };
  }

  static toDomain(record: PrismaRelationship): Relationship {
    const props: RelationshipProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      partyIdA: new UniqueEntityId(record.partyIdA),
      partyIdB: new UniqueEntityId(record.partyIdB),
      type: record.type as RelationshipType,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Relationship.reconstitute(props, new UniqueEntityId(record.id));
  }
}
