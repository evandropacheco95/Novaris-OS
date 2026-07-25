export interface MarkOpportunityLostResponse {
  readonly id: string;
  readonly organizationId: string;
  readonly partyId: string;
  readonly status: "open" | "won" | "lost";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly pipelineId?: string;
  readonly currentStageId?: string;
}
