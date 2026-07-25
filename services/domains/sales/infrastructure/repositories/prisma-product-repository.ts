import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Product } from "../../domain/aggregates/product/product.js";
import type { ProductRepository } from "../../domain/repositories/product-repository.js";
import { PrismaProductMapper } from "../mappers/prisma-product-mapper.js";

/** Implementação real de `ProductRepository` — Prisma Client contra Postgres. Hard delete (convenção majoritária do pacote). */
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Product>, InfrastructureError>> {
    try {
      const record = await this.client.product.findUnique({ where: { id: id.toString() } });
      return Result.ok(record ? Option.some(PrismaProductMapper.toDomain(record)) : Option.none<Product>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Product "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Product[], InfrastructureError>> {
    try {
      const records = await this.client.product.findMany();
      return Result.ok(records.map((record) => PrismaProductMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Products", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.product.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Product "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Product): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaProductMapper.toPersistence(entity);
      await this.client.product.upsert({
        where: { id: data.id },
        create: data,
        update: {
          name: data.name,
          sku: data.sku,
          unitPrice: data.unitPrice,
          active: data.active,
          updatedAt: data.updatedAt,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Product "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.product.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Product "${id.toString()}"`, { cause: error }));
    }
  }
}
