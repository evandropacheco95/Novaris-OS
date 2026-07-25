/**
 * Request DTO — mapeia 1:1 para `CreateOpportunityCommandInput`
 * (`application/commands/create-opportunity/create-opportunity.command.ts`),
 * conforme `SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 9`.
 */
export interface CreateOpportunityRequest {
  readonly organizationId: string;
  readonly partyId: string;
  readonly pipelineId?: string;
  readonly currentStageId?: string;
}
