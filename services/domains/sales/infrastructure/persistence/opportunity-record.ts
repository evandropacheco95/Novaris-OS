import type { OpportunityStatus } from "../../domain/aggregates/opportunity/opportunity.js";
import type { ProposalStatus } from "../../domain/entities/proposal/proposal.js";

/**
 * Forma conceitual de registro persistido de `Proposal`, dentro da agregação
 * de `Opportunity` — nunca uma linha/coleção própria fora dela.
 *
 * Traceability: [SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 5, § 12](../../../../../knowledge/architecture/blueprints/SALES_PERSISTENCE_MAPPING_BLUEPRINT.md).
 * Campos idênticos a `ProposalProps` (`proposal.ts`) + `id` — nenhum campo
 * novo inventado.
 */
export interface ProposalRecord {
  id: string;
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Forma conceitual de registro persistido de `Opportunity`, incluindo sua
 * coleção agregada de `ProposalRecord`.
 *
 * Traceability: [SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 4, § 12](../../../../../knowledge/architecture/blueprints/SALES_PERSISTENCE_MAPPING_BLUEPRINT.md).
 * Campos idênticos a `OpportunityProps` (`opportunity.ts`) + `id` + `proposals`
 * — nenhum campo novo inventado. `pipelineId`/`currentStageId` permanecem
 * referências por id (string), nunca objetos `Pipeline`/`Stage` embutidos.
 */
export interface OpportunityRecord {
  id: string;
  organizationId: string;
  partyId: string;
  pipelineId?: string;
  currentStageId?: string;
  status: OpportunityStatus;
  createdAt: Date;
  updatedAt: Date;
  proposals: ProposalRecord[];
}
