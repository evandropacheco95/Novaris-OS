import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Product as PrismaProduct } from "@novaris/database";
import { Product, type ProductProps } from "../../domain/aggregates/product/product.js";

/** PrismaProductMapper — tradução direta Aggregate ↔ Prisma, mesmo padrão de `PrismaLeadMapper` (`ADR-0042`). */
export class PrismaProductMapper {
  static toDomain(record: PrismaProduct): Product {
    const props: ProductProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      name: record.name,
      sku: record.sku ?? undefined,
      unitPrice: Number(record.unitPrice),
      active: record.active,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return Product.reconstitute(props, new UniqueEntityId(record.id));
  }

  static toPersistence(product: Product): PrismaProduct {
    return {
      id: product.id.toString(),
      organizationId: product.organizationId.toString(),
      name: product.name,
      sku: product.sku ?? null,
      unitPrice: product.unitPrice as unknown as PrismaProduct["unitPrice"],
      active: product.active,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
