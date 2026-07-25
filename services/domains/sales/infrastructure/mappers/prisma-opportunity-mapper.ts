import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Opportunity as PrismaOpportunity, Proposal as PrismaProposal } from "@novaris/database";
import { Opportunity, type OpportunityProps, type OpportunityStatus } from "../../domain/aggregates/opportunity/opportunity.js";
import { Proposal, type ProposalProps, type ProposalStatus } from "../../domain/entities/proposal/proposal.js";

type PrismaOpportunityWithProposals = PrismaOpportunity & { proposals: PrismaProposal[] };

/**
 * PrismaOpportunityMapper — tradução pura Aggregate ↔ linhas reais do Postgres
 * (via Prisma Client), sem I/O próprio. Mesma disciplina de `OpportunityMapper`
 * (`SALES_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 9-10`): nunca valida regra de
 * negócio, nunca dispara Domain Events, nunca decide valor não fornecido pela
 * fonte, nunca acessa o banco diretamente — apenas tradução de forma.
 *
 * Diferente de `OpportunityMapper` (que traduz para `OpportunityRecord`, forma
 * em memória com `proposals` aninhado), este Mapper traduz para os tipos
 * gerados pelo Prisma a partir do schema relacional real — `proposals` é uma
 * tabela própria (`proposal_id` → FK `opportunity_id`), nunca aninhada em JSON.
 */
export class PrismaOpportunityMapper {
  /** Campos de escrita (sem `id`/timestamps, gerados pelo banco). */
  static toPersistenceCreate(opportunity: Opportunity) {
    return {
      id: opportunity.id.toString(),
      organizationId: opportunity.organizationId.toString(),
      partyId: opportunity.partyId.toString(),
      pipelineId: opportunity.pipelineId?.toString() ?? null,
      currentStageId: opportunity.currentStageId?.toString() ?? null,
      status: opportunity.status,
    };
  }

  static toDomain(record: PrismaOpportunityWithProposals): Opportunity {
    const proposals: Proposal[] = record.proposals.map((proposalRecord) => {
      const proposalProps: ProposalProps = {
        status: proposalRecord.status as ProposalStatus,
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
      status: record.status as OpportunityStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Opportunity.reconstitute(props, new UniqueEntityId(record.id), proposals);
  }
}
