import { UniqueEntityId } from "@novaris/shared-kernel";
import type { SalesChannel as PrismaSalesChannel } from "@novaris/database";
import { SalesChannel, type SalesChannelProps, type SalesChannelType } from "../../domain/aggregates/sales-channel/sales-channel.js";

/** PrismaSalesChannelMapper — tradução direta Aggregate ↔ Prisma, mesmo padrão de `PrismaProductMapper` (`ADR-0052`). */
export class PrismaSalesChannelMapper {
  static toDomain(record: PrismaSalesChannel): SalesChannel {
    const props: SalesChannelProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      name: record.name,
      type: record.type as SalesChannelType,
      active: record.active,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return SalesChannel.reconstitute(props, new UniqueEntityId(record.id));
  }

  static toPersistence(salesChannel: SalesChannel): PrismaSalesChannel {
    return {
      id: salesChannel.id.toString(),
      organizationId: salesChannel.organizationId.toString(),
      name: salesChannel.name,
      type: salesChannel.type,
      active: salesChannel.active,
      createdAt: salesChannel.createdAt,
      updatedAt: salesChannel.updatedAt,
    };
  }
}
