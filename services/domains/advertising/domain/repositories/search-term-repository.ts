import type { ReadRepository, WriteRepository, Result, Option, InfrastructureError, UniqueEntityId } from "@novaris/shared-kernel";
import type { SearchTerm } from "../aggregates/search-term/search-term.js";

/**
 * Contrato de persistência do Aggregate `SearchTerm`. `findByNaturalKey`
 * permite à Application Layer substituir (nunca somar) os totais de uma
 * janela já sincronizada (`objects/SearchTerm.md § 10`).
 */
export interface SearchTermRepository extends ReadRepository<SearchTerm>, WriteRepository<SearchTerm> {
  findByNaturalKey(
    advertisingAccountId: UniqueEntityId,
    adGroupId: UniqueEntityId,
    searchTerm: string,
    dateRangeStart: Date,
    dateRangeEnd: Date,
  ): Promise<Result<Option<SearchTerm>, InfrastructureError>>;
}
