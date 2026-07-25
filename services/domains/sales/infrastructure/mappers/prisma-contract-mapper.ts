import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Contract as PrismaContract } from "@novaris/database";
import { Contract, type ContractProps, type ContractStatus } from "../../domain/aggregates/contract/contract.js";

/** PrismaContractMapper — tradução direta Aggregate ↔ Prisma, mesmo padrão de `PrismaLeadMapper`/`PrismaQuotationMapper`. */
export class PrismaContractMapper {
  static toDomain(record: PrismaContract): Contract {
    const props: ContractProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      opportunityId: new UniqueEntityId(record.opportunityId),
      quotationId: new UniqueEntityId(record.quotationId),
      status: record.status as ContractStatus,
      startDate: record.startDate ?? undefined,
      endDate: record.endDate ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return Contract.reconstitute(props, new UniqueEntityId(record.id));
  }

  static toPersistence(contract: Contract): PrismaContract {
    return {
      id: contract.id.toString(),
      organizationId: contract.organizationId.toString(),
      opportunityId: contract.opportunityId.toString(),
      quotationId: contract.quotationId.toString(),
      status: contract.status,
      startDate: contract.startDate ?? null,
      endDate: contract.endDate ?? null,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
    };
  }
}
