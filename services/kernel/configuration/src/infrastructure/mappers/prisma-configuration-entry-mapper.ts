import { UniqueEntityId } from "@novaris/shared-kernel";
import type { ConfigurationEntry as PrismaConfigurationEntry } from "@novaris/database";
import { ConfigurationEntry } from "../../domain/aggregates/configuration-entry/configuration-entry.js";

export class PrismaConfigurationEntryMapper {
  static toDomain(record: PrismaConfigurationEntry): ConfigurationEntry {
    return ConfigurationEntry.reconstitute(
      {
        organizationId: new UniqueEntityId(record.organizationId),
        key: record.key,
        value: record.value,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
      new UniqueEntityId(record.id),
    );
  }

  static toPersistence(entry: ConfigurationEntry): Omit<PrismaConfigurationEntry, "id"> & { id: string } {
    return {
      id: entry.id.toString(),
      organizationId: entry.organizationId.toString(),
      key: entry.key,
      value: entry.value,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }
}
