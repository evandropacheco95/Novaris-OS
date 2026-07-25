import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Checklist } from "../../domain/aggregates/checklist/checklist.js";
import type { ChecklistRepository } from "../../domain/repositories/checklist-repository.js";
import { PrismaChecklistMapper } from "../mappers/prisma-checklist-mapper.js";

/**
 * Implementação real de `ChecklistRepository` — Prisma Client contra
 * Postgres. `save()` sincroniza a coleção de `ChecklistItem`s via upsert
 * dentro de uma transação — mesmo padrão de `PrismaQuotationRepository` para
 * `lineItems` (`ChecklistItem` é Internal Entity sem Repository próprio).
 */
export class PrismaChecklistRepository implements ChecklistRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Checklist>, InfrastructureError>> {
    try {
      const record = await this.client.checklist.findUnique({ where: { id: id.toString() }, include: { items: true } });
      return Result.ok(record ? Option.some(PrismaChecklistMapper.toDomain(record)) : Option.none<Checklist>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Checklist "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Checklist[], InfrastructureError>> {
    try {
      const records = await this.client.checklist.findMany({ include: { items: true } });
      return Result.ok(records.map((record) => PrismaChecklistMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Checklists", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.checklist.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Checklist "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Checklist): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaChecklistMapper.toPersistence(entity);
      await this.client.$transaction([
        this.client.checklist.upsert({
          where: { id: data.id },
          create: data,
          update: { title: data.title, updatedAt: data.updatedAt },
        }),
        ...entity.getItems().map((item) =>
          this.client.checklistItem.upsert({
            where: { id: item.id.toString() },
            create: { id: item.id.toString(), checklistId: entity.id.toString(), label: item.label, completed: item.completed },
            update: { label: item.label, completed: item.completed },
          }),
        ),
      ]);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Checklist "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.checklist.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Checklist "${id.toString()}"`, { cause: error }));
    }
  }
}
