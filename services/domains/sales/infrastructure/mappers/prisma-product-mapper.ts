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
      ncm: record.ncm ?? undefined,
      cfop: record.cfop ?? undefined,
      unit: record.unit ?? undefined,
      weightKg: record.weightKg !== null ? Number(record.weightKg) : undefined,
      lengthCm: record.lengthCm !== null ? Number(record.lengthCm) : undefined,
      widthCm: record.widthCm !== null ? Number(record.widthCm) : undefined,
      heightCm: record.heightCm !== null ? Number(record.heightCm) : undefined,
      parentProductId: record.parentProductId ? new UniqueEntityId(record.parentProductId) : undefined,
      variantLabel: record.variantLabel ?? undefined,
      externalId: record.externalId ?? undefined,
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
      ncm: product.ncm ?? null,
      cfop: product.cfop ?? null,
      unit: product.unit ?? null,
      weightKg: (product.weightKg ?? null) as unknown as PrismaProduct["weightKg"],
      lengthCm: (product.lengthCm ?? null) as unknown as PrismaProduct["lengthCm"],
      widthCm: (product.widthCm ?? null) as unknown as PrismaProduct["widthCm"],
      heightCm: (product.heightCm ?? null) as unknown as PrismaProduct["heightCm"],
      parentProductId: product.parentProductId?.toString() ?? null,
      variantLabel: product.variantLabel ?? null,
      externalId: product.externalId ?? null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
