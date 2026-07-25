import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { CalendarEvent } from "../../domain/aggregates/calendar-event/calendar-event.js";
import type { CalendarEventRepository } from "../../domain/repositories/calendar-event-repository.js";
import { PrismaCalendarEventMapper } from "../mappers/prisma-calendar-event-mapper.js";

/** Implementação real de `CalendarEventRepository` — Prisma Client contra Postgres. Hard delete. */
export class PrismaCalendarEventRepository implements CalendarEventRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<CalendarEvent>, InfrastructureError>> {
    try {
      const record = await this.client.calendarEvent.findUnique({ where: { id: id.toString() } });
      return Result.ok(record ? Option.some(PrismaCalendarEventMapper.toDomain(record)) : Option.none<CalendarEvent>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar CalendarEvent "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<CalendarEvent[], InfrastructureError>> {
    try {
      const records = await this.client.calendarEvent.findMany();
      return Result.ok(records.map((record) => PrismaCalendarEventMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar CalendarEvents", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.calendarEvent.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de CalendarEvent "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: CalendarEvent): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaCalendarEventMapper.toPersistence(entity);
      await this.client.calendarEvent.upsert({
        where: { id: data.id },
        create: data,
        update: { subject: data.subject, startAt: data.startAt, endAt: data.endAt, location: data.location, updatedAt: data.updatedAt },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar CalendarEvent "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.calendarEvent.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir CalendarEvent "${id.toString()}"`, { cause: error }));
    }
  }
}
