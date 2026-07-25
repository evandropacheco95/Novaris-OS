/**
 * Response DTO — segue `ADVANCE_OPPORTUNITY_STAGE_RESPONSE_SPECIFICATION.md`
 * (`ENG-0089`) §§ 4, 12.
 *
 * **Desvio registrado, não silencioso**: o bloco de código literal fornecido
 * pela Ordem de Missão `ENG-0090` tipava `status: string` e
 * `createdAt`/`updatedAt: Date`. Isso diverge da Specification já congelada
 * (`ENG-0089 § 4`), que define `status` como a união literal
 * `"open" | "won" | "lost"` (espelhando `OpportunityStatus`, nunca `string`
 * genérico) e `createdAt`/`updatedAt` como `string` (ISO 8601) — mesma
 * decisão já tomada para `CreateOpportunityResponse` (`ENG-0081`), por
 * segurança de serialização JSON (`SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 13`).
 * A própria Ordem de Missão `ENG-0090` instrui seguir a Specification
 * "literalmente... sem inferências... nenhum tipo alterado" — os dois
 * documentos são inconsistentes entre si; esta implementação segue a
 * Specification já congelada (fonte de verdade explícita, `ENG-0089 § 11`
 * "Freeze Criteria"), não o bloco de código ad-hoc da Ordem de Missão,
 * mesma disciplina já aplicada quando uma instrução literal contraria um
 * padrão já congelado (precedente: `opportunity.ts`, desvio da instrução de
 * `ENG-0039`).
 */
export interface AdvanceOpportunityStageResponse {
  readonly id: string;
  readonly organizationId: string;
  readonly partyId: string;
  readonly status: "open" | "won" | "lost";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly pipelineId?: string;
  readonly currentStageId: string;
}
