import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Reminder } from "../../domain/aggregates/reminder/reminder.js";
import type { ReminderRepository } from "../../domain/repositories/reminder-repository.js";
import { PrismaReminderMapper } from "../mappers/prisma-reminder-mapper.js";

/** Implementação real de `ReminderRepository` — Prisma Client contra Postgres. Hard delete. */
export class PrismaReminderRepository implements ReminderRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Reminder>, InfrastructureError>> {
    try {
      const record = await this.client.reminder.findUnique({ where: { id: id.toString() } });
      return Result.ok(record ? Option.some(PrismaReminderMapper.toDomain(record)) : Option.none<Reminder>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Reminder "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Reminder[], InfrastructureError>> {
    try {
      const records = await this.client.reminder.findMany();
      return Result.ok(records.map((record) => PrismaReminderMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Reminders", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.reminder.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Reminder "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Reminder): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaReminderMapper.toPersistence(entity);
      await this.client.reminder.upsert({
        where: { id: data.id },
        create: data,
        update: { message: data.message, remindAt: data.remindAt, dismissed: data.dismissed, updatedAt: data.updatedAt },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Reminder "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.reminder.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Reminder "${id.toString()}"`, { cause: error }));
    }
  }
}
