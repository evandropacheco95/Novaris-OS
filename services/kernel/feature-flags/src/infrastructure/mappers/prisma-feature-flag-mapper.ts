import { UniqueEntityId } from "@novaris/shared-kernel";
import type { FeatureFlag as PrismaFeatureFlag } from "@novaris/database";
import { FeatureFlag } from "../../domain/aggregates/feature-flag/feature-flag.js";

export class PrismaFeatureFlagMapper {
  static toDomain(record: PrismaFeatureFlag): FeatureFlag {
    return FeatureFlag.reconstitute(
      {
        organizationId: new UniqueEntityId(record.organizationId),
        key: record.key,
        enabled: record.enabled,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
      new UniqueEntityId(record.id),
    );
  }

  static toPersistence(flag: FeatureFlag): Omit<PrismaFeatureFlag, "id"> & { id: string } {
    return {
      id: flag.id.toString(),
      organizationId: flag.organizationId.toString(),
      key: flag.key,
      enabled: flag.enabled,
      createdAt: flag.createdAt,
      updatedAt: flag.updatedAt,
    };
  }
}
