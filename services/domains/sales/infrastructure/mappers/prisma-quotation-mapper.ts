import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Quotation as PrismaQuotation, QuotationLineItem as PrismaQuotationLineItem } from "@novaris/database";
import { Quotation, type QuotationProps, type QuotationStatus } from "../../domain/aggregates/quotation/quotation.js";
import { QuotationLineItem, type QuotationLineItemProps } from "../../domain/entities/quotation-line-item/quotation-line-item.js";

type PrismaQuotationWithLineItems = PrismaQuotation & { lineItems: PrismaQuotationLineItem[] };

/**
 * PrismaQuotationMapper — tradução direta Aggregate ↔ Prisma, mesmo padrão de
 * `PrismaLeadMapper` (`ADR-0042` — mapeamento direto, sem `OpportunityRecord`
 * intermediário, porque `Quotation` não tem implementação in-memory). Ainda
 * assim precisa reconstituir a coleção `lineItems` (tabela própria,
 * `quotation_line_items`) — mesmo tratamento de `PrismaOpportunityMapper`
 * para `proposals`.
 */
export class PrismaQuotationMapper {
  static toDomain(record: PrismaQuotationWithLineItems): Quotation {
    const lineItems = record.lineItems.map((lineItemRecord) => {
      const props: QuotationLineItemProps = {
        productId: new UniqueEntityId(lineItemRecord.productId),
        quantity: lineItemRecord.quantity,
        unitPrice: Number(lineItemRecord.unitPrice),
      };
      return QuotationLineItem.reconstitute(props, new UniqueEntityId(lineItemRecord.id));
    });

    const props: QuotationProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      opportunityId: new UniqueEntityId(record.opportunityId),
      status: record.status as QuotationStatus,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Quotation.reconstitute(props, new UniqueEntityId(record.id), lineItems);
  }

  /** Campos de escrita da própria Quotation (sem `lineItems` — sincronizados separadamente pelo Repository). */
  static toPersistence(quotation: Quotation): PrismaQuotation {
    return {
      id: quotation.id.toString(),
      organizationId: quotation.organizationId.toString(),
      opportunityId: quotation.opportunityId.toString(),
      status: quotation.status,
      createdAt: quotation.createdAt,
      updatedAt: quotation.updatedAt,
    };
  }
}
