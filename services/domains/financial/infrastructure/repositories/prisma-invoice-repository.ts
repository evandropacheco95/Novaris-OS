import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Invoice } from "../../domain/aggregates/invoice/invoice.js";
import type { InvoiceRepository } from "../../domain/repositories/invoice-repository.js";
import { PrismaInvoiceMapper } from "../mappers/prisma-invoice-mapper.js";

/** Implementação real de `InvoiceRepository` — persistência via Prisma Client contra Postgres (Supabase). */
export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Invoice>, InfrastructureError>> {
    try {
      const record = await this.client.invoice.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<Invoice>());
      }
      return Result.ok(Option.some(PrismaInvoiceMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Invoice "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Invoice[], InfrastructureError>> {
    try {
      const records = await this.client.invoice.findMany();
      return Result.ok(records.map((record) => PrismaInvoiceMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Invoices", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.invoice.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Invoice "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Invoice): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaInvoiceMapper.toPersistenceCreate(entity);
      await this.client.invoice.upsert({
        where: { id: data.id },
        create: data,
        update: { status: data.status },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Invoice "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.invoice.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Invoice "${id.toString()}"`, { cause: error }));
    }
  }
}
