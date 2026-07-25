/**
 * Port de Search (`ENGINEERING_PLAYBOOK.md § 9`) — busca sobre objetos da
 * plataforma. Escopo desta missão (`ADR-0039`): busca direta por consulta ao
 * Postgres (sem índice próprio, sem indexação reativa via Event Bus) sobre
 * uma única entidade (`Party`) — plataforma-wide indexing sobre todas as
 * entidades exigiria decidir quais campos de quais entidades são
 * pesquisáveis, uma decisão de produto fora de escopo aqui.
 */
export interface SearchResult {
  readonly entityType: string;
  readonly entityId: string;
  readonly label: string;
}

export interface SearchIndex {
  search(organizationId: string, query: string): Promise<SearchResult[]>;
}
