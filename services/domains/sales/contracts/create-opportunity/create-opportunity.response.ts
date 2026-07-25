/**
 * Response DTO — segue `CREATE_OPPORTUNITY_RESPONSE_SPECIFICATION.md`
 * (`ENG-0080`) §§ 5-6. `createdAt`/`updatedAt` implementados como `string`
 * (ISO 8601) — decisão deixada em aberto pela especificação (§ 12),
 * resolvida nesta missão (`ENG-0081`) pela mesma disciplina já aplicada a
 * todo campo desta camada: primitivo, seguro para serialização JSON, sem
 * tipo de domínio.
 */
export interface CreateOpportunityResponse {
  readonly id: string;
  readonly organizationId: string;
  readonly partyId: string;
  readonly status: "open" | "won" | "lost";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly pipelineId?: string;
  readonly currentStageId?: string;
}
