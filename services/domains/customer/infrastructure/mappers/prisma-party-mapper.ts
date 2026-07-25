import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Party as PrismaParty } from "@novaris/database";
import { Party, type PartyProps, type PartyType } from "../../domain/aggregates/party/party.js";

/**
 * PrismaPartyMapper — tradução pura Aggregate ↔ linha real do Postgres (via
 * Prisma Client), sem I/O próprio. Mesma disciplina de `PrismaOpportunityMapper`
 * (Sales, `ENG-0120`).
 */
export class PrismaPartyMapper {
  static toPersistenceCreate(party: Party) {
    return {
      id: party.id.toString(),
      organizationId: party.organizationId.toString(),
      partyType: party.partyType,
      name: party.name,
      document: party.document ?? null,
    };
  }

  static toDomain(record: PrismaParty): Party {
    const props: PartyProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      partyType: record.partyType as PartyType,
      name: record.name,
      document: record.document ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Party.reconstitute(props, new UniqueEntityId(record.id));
  }
}
