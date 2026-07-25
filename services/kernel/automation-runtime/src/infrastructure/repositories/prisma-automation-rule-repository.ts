import { Result, Option, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import { AutomationRule } from "../../domain/aggregates/automation-rule/automation-rule.js";
import type { AutomationRuleRepository } from "../../domain/repositories/automation-rule-repository.js";
import { PrismaAutomationRuleMapper } from "../mappers/prisma-automation-rule-mapper.js";

export class PrismaAutomationRuleRepository implements AutomationRuleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<AutomationRule>, InfrastructureError>> {
    try {
      const record = await this.prisma.automationRule.findUnique({ where: { id: id.toString() } });
      return Result.ok(record ? Option.some(PrismaAutomationRuleMapper.toDomain(record)) : Option.none<AutomationRule>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar AutomationRule: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findAll(): Promise<Result<AutomationRule[], InfrastructureError>> {
    try {
      const records = await this.prisma.automationRule.findMany();
      return Result.ok(records.map((record) => PrismaAutomationRuleMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao listar AutomationRules: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.prisma.automationRule.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de AutomationRule: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async save(entity: AutomationRule): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaAutomationRuleMapper.toPersistence(entity);
      await this.prisma.automationRule.upsert({ where: { id: data.id }, create: data, update: data });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar AutomationRule: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.prisma.automationRule.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir AutomationRule: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}
