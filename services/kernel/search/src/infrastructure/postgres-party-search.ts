import type { PrismaClient } from "@novaris/database";
import type { SearchIndex, SearchResult } from "../domain/ports/search-index.js";

/**
 * Adapter real do Port `SearchIndex` — consulta direta ao Postgres real
 * (`parties.name`, `ILIKE` via `contains`/`insensitive`), escopada por
 * `organizationId` (nunca vaza entre organizações, mesmo critério de todo
 * Repository desta engenharia). Sem índice próprio, sem indexação reativa —
 * primeira e única entidade coberta é `Party` (`ADR-0039`); estender a
 * outras entidades é decisão futura, não bloqueada por esta.
 */
export class PostgresPartySearch implements SearchIndex {
  constructor(private readonly prisma: PrismaClient) {}

  async search(organizationId: string, query: string): Promise<SearchResult[]> {
    const trimmed = query.trim();
    if (trimmed.length === 0) {
      return [];
    }
    const parties = await this.prisma.party.findMany({
      where: { organizationId, name: { contains: trimmed, mode: "insensitive" } },
      orderBy: { name: "asc" },
    });
    return parties.map((party) => ({ entityType: "Party", entityId: party.id, label: party.name }));
  }
}
