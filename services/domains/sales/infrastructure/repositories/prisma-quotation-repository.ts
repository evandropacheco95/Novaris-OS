import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Quotation } from "../../domain/aggregates/quotation/quotation.js";
import type { QuotationRepository } from "../../domain/repositories/quotation-repository.js";
import { PrismaQuotationMapper } from "../mappers/prisma-quotation-mapper.js";

/**
 * Implementação real de `QuotationRepository` — Prisma Client contra
 * Postgres. `save()` sincroniza a coleção de `QuotationLineItem`s via upsert
 * dentro de uma transação — mesmo padrão de `PrismaOpportunityRepository`
 * para `proposals` (`QuotationLineItem` é Internal Entity sem Repository
 * próprio). Hard delete (convenção majoritária do pacote, mesma de `Lead`).
 */
export class PrismaQuotationRepository implements QuotationRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Quotation>, InfrastructureError>> {
    try {
      const record = await this.client.quotation.findUnique({
        where: { id: id.toString() },
        include: { lineItems: true },
      });
      return Result.ok(record ? Option.some(PrismaQuotationMapper.toDomain(record)) : Option.none<Quotation>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Quotation "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Quotation[], InfrastructureError>> {
    try {
      const records = await this.client.quotation.findMany({ include: { lineItems: true } });
      return Result.ok(records.map((record) => PrismaQuotationMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Quotations", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.quotation.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Quotation "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Quotation): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaQuotationMapper.toPersistence(entity);
      await this.client.$transaction([
        this.client.quotation.upsert({
          where: { id: data.id },
          create: data,
          update: {
            status: data.status,
            updatedAt: data.updatedAt,
          },
        }),
        ...entity.getLineItems().map((lineItem) =>
          this.client.quotationLineItem.upsert({
            where: { id: lineItem.id.toString() },
            create: {
              id: lineItem.id.toString(),
              quotationId: entity.id.toString(),
              productId: lineItem.productId.toString(),
              quantity: lineItem.quantity,
              unitPrice: lineItem.unitPrice,
            },
            update: {
              quantity: lineItem.quantity,
              unitPrice: lineItem.unitPrice,
            },
          }),
        ),
      ]);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Quotation "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.quotation.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Quotation "${id.toString()}"`, { cause: error }));
    }
  }
}
