import { Result, Option, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import { ConfigurationEntry } from "../../domain/aggregates/configuration-entry/configuration-entry.js";
import type { ConfigurationEntryRepository } from "../../domain/repositories/configuration-entry-repository.js";
import { PrismaConfigurationEntryMapper } from "../mappers/prisma-configuration-entry-mapper.js";

export class PrismaConfigurationEntryRepository implements ConfigurationEntryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<ConfigurationEntry>, InfrastructureError>> {
    try {
      const record = await this.prisma.configurationEntry.findUnique({ where: { id: id.toString() } });
      return Result.ok(record ? Option.some(PrismaConfigurationEntryMapper.toDomain(record)) : Option.none<ConfigurationEntry>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar ConfigurationEntry por id: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findByOrganizationAndKey(organizationId: UniqueEntityId, key: string): Promise<Result<Option<ConfigurationEntry>, InfrastructureError>> {
    try {
      const record = await this.prisma.configurationEntry.findUnique({
        where: { organizationId_key: { organizationId: organizationId.toString(), key } },
      });
      return Result.ok(record ? Option.some(PrismaConfigurationEntryMapper.toDomain(record)) : Option.none<ConfigurationEntry>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar ConfigurationEntry por chave: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findAll(): Promise<Result<ConfigurationEntry[], InfrastructureError>> {
    try {
      const records = await this.prisma.configurationEntry.findMany();
      return Result.ok(records.map((record) => PrismaConfigurationEntryMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao listar ConfigurationEntries: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.prisma.configurationEntry.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de ConfigurationEntry: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async save(entity: ConfigurationEntry): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaConfigurationEntryMapper.toPersistence(entity);
      await this.prisma.configurationEntry.upsert({
        where: { id: data.id },
        create: data,
        update: { value: data.value, updatedAt: data.updatedAt },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar ConfigurationEntry: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.prisma.configurationEntry.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir ConfigurationEntry: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}
