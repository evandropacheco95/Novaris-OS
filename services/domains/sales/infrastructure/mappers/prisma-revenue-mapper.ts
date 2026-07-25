import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Revenue as PrismaRevenue } from "@novaris/database";
import { Revenue, type RevenueProps } from "../../domain/aggregates/revenue/revenue.js";

/**
 * PrismaRevenueMapper — tradução direta Aggregate ↔ Prisma, mesmo padrão de
 * `PrismaContractMapper`. `amount` é `Decimal` no Postgres — convertido para
 * `number` na fronteira, mesma decisão de `ADR-0031` (Invoice).
 */
export class PrismaRevenueMapper {
  static toDomain(record: PrismaRevenue): Revenue {
    const props: RevenueProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      contractId: new UniqueEntityId(record.contractId),
      amount: Number(record.amount),
      currency: record.currency,
      recognizedAt: record.recognizedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return Revenue.reconstitute(props, new UniqueEntityId(record.id));
  }

  static toPersistence(revenue: Revenue) {
    return {
      id: revenue.id.toString(),
      organizationId: revenue.organizationId.toString(),
      contractId: revenue.contractId.toString(),
      amount: revenue.amount,
      currency: revenue.currency,
      recognizedAt: revenue.recognizedAt,
      createdAt: revenue.createdAt,
      updatedAt: revenue.updatedAt,
    };
  }
}
