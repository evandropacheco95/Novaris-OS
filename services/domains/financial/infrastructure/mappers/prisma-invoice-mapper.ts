import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Invoice as PrismaInvoice } from "@novaris/database";
import { Invoice, type InvoiceProps, type InvoiceStatus } from "../../domain/aggregates/invoice/invoice.js";

/**
 * PrismaInvoiceMapper — tradução pura Aggregate ↔ linha real do Postgres
 * (via Prisma Client), sem I/O próprio. `amount` é `Decimal` no Postgres
 * (via Prisma) — convertido para `number` na fronteira, mesma decisão de
 * `ADR-0031` (sem Value Object `Money` próprio).
 */
export class PrismaInvoiceMapper {
  static toPersistenceCreate(invoice: Invoice) {
    return {
      id: invoice.id.toString(),
      organizationId: invoice.organizationId.toString(),
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      subscriptionId: invoice.subscriptionId?.toString() ?? null,
    };
  }

  static toDomain(record: PrismaInvoice): Invoice {
    const props: InvoiceProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      amount: Number(record.amount),
      currency: record.currency,
      status: record.status as InvoiceStatus,
      subscriptionId: record.subscriptionId ? new UniqueEntityId(record.subscriptionId) : undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return Invoice.reconstitute(props, new UniqueEntityId(record.id));
  }
}
