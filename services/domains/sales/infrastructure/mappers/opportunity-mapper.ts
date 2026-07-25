import { UniqueEntityId } from "@novaris/shared-kernel";
import { Opportunity, type OpportunityProps } from "../../domain/aggregates/opportunity/opportunity.js";
import { Proposal, type ProposalProps } from "../../domain/entities/proposal/proposal.js";
import type { OpportunityRecord, ProposalRecord } from "../persistence/opportunity-record.js";

/**
 * OpportunityMapper — tradução pura Aggregate ↔ Persistência, sem I/O.
 *
 * Traceability: [SALES_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 9-10](../../../../../knowledge/architecture/blueprints/SALES_PERSISTENCE_MAPPING_BLUEPRINT.md),
 * [AGGREGATE_IMPLEMENTATION_STANDARD.md § 8](../../../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md)
 * (ENS-0001 — `reconstitute()` usado exclusivamente por Repository/Mapper).
 *
 * **Nunca poderá** (`SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 10`): validar
 * regra de negócio, disparar Domain Events, decidir um valor não fornecido
 * pelos dados de origem, persistir/consultar diretamente, ou expor tipo de
 * tecnologia específica em sua assinatura pública — nenhuma das quatro
 * ocorre abaixo.
 */
export class OpportunityMapper {
  static toPersistence(opportunity: Opportunity): OpportunityRecord {
    const proposals: ProposalRecord[] = opportunity.getProposals().map((proposal) => ({
      id: proposal.id.toString(),
      status: proposal.status,
      createdAt: proposal.createdAt,
      updatedAt: proposal.updatedAt,
    }));

    return {
      id: opportunity.id.toString(),
      organizationId: opportunity.organizationId.toString(),
      partyId: opportunity.partyId.toString(),
      pipelineId: opportunity.pipelineId?.toString(),
      currentStageId: opportunity.currentStageId?.toString(),
      status: opportunity.status,
      createdAt: opportunity.createdAt,
      updatedAt: opportunity.updatedAt,
      proposals,
    };
  }

  /** Reconstrói via `Opportunity.reconstitute()`/`Proposal.reconstitute()` — sem validação, sem Domain Events (ENS-0001 § 8). */
  static toDomain(record: OpportunityRecord): Opportunity {
    const proposals: Proposal[] = record.proposals.map((proposalRecord) => {
      const proposalProps: ProposalProps = {
        status: proposalRecord.status,
        createdAt: proposalRecord.createdAt,
        updatedAt: proposalRecord.updatedAt,
      };
      return Proposal.reconstitute(proposalProps, new UniqueEntityId(proposalRecord.id));
    });

    const props: OpportunityProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      partyId: new UniqueEntityId(record.partyId),
      pipelineId: record.pipelineId ? new UniqueEntityId(record.pipelineId) : undefined,
      currentStageId: record.currentStageId ? new UniqueEntityId(record.currentStageId) : undefined,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Opportunity.reconstitute(props, new UniqueEntityId(record.id), proposals);
  }
}
