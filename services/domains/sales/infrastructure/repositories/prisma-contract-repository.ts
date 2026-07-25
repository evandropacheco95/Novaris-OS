import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Contract } from "../../domain/aggregates/contract/contract.js";
import type { ContractRepository } from "../../domain/repositories/contract-repository.js";
import { PrismaContractMapper } from "../mappers/prisma-contract-mapper.js";

/** Implementação real de `ContractRepository` — Prisma Client contra Postgres. Hard delete (convenção majoritária do pacote). */
export class PrismaContractRepository implements ContractRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Contract>, InfrastructureError>> {
    try {
      const record = await this.client.contract.findUnique({ where: { id: id.toString() } });
      return Result.ok(record ? Option.some(PrismaContractMapper.toDomain(record)) : Option.none<Contract>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Contract "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Contract[], InfrastructureError>> {
    try {
      const records = await this.client.contract.findMany();
      return Result.ok(records.map((record) => PrismaContractMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Contracts", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.contract.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Contract "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Contract): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaContractMapper.toPersistence(entity);
      await this.client.contract.upsert({
        where: { id: data.id },
        create: data,
        update: {
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate,
          updatedAt: data.updatedAt,
        },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Contract "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.contract.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Contract "${id.toString()}"`, { cause: error }));
    }
  }
}
