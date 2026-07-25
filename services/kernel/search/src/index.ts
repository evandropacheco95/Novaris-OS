// Search Service — barrel de exportação pública.

export type { SearchIndex, SearchResult } from "./domain/ports/search-index.js";
export { PostgresPartySearch } from "./infrastructure/postgres-party-search.js";
