import { Result, Option, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import { FeatureFlag } from "../../domain/aggregates/feature-flag/feature-flag.js";
import type { FeatureFlagRepository } from "../../domain/repositories/feature-flag-repository.js";
import { PrismaFeatureFlagMapper } from "../mappers/prisma-feature-flag-mapper.js";

export class PrismaFeatureFlagRepository implements FeatureFlagRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<FeatureFlag>, InfrastructureError>> {
    try {
      const record = await this.prisma.featureFlag.findUnique({ where: { id: id.toString() } });
      return Result.ok(record ? Option.some(PrismaFeatureFlagMapper.toDomain(record)) : Option.none<FeatureFlag>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar FeatureFlag por id: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findByOrganizationAndKey(organizationId: UniqueEntityId, key: string): Promise<Result<Option<FeatureFlag>, InfrastructureError>> {
    try {
      const record = await this.prisma.featureFlag.findUnique({
        where: { organizationId_key: { organizationId: organizationId.toString(), key } },
      });
      return Result.ok(record ? Option.some(PrismaFeatureFlagMapper.toDomain(record)) : Option.none<FeatureFlag>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar FeatureFlag por chave: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findAll(): Promise<Result<FeatureFlag[], InfrastructureError>> {
    try {
      const records = await this.prisma.featureFlag.findMany();
      return Result.ok(records.map((record) => PrismaFeatureFlagMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao listar FeatureFlags: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.prisma.featureFlag.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de FeatureFlag: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async save(entity: FeatureFlag): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaFeatureFlagMapper.toPersistence(entity);
      await this.prisma.featureFlag.upsert({
        where: { id: data.id },
        create: data,
        update: { enabled: data.enabled, updatedAt: data.updatedAt },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar FeatureFlag: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.prisma.featureFlag.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir FeatureFlag: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}
