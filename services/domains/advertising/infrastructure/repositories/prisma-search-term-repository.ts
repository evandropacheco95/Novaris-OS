import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { SearchTerm } from "../../domain/aggregates/search-term/search-term.js";
import type { SearchTermRepository } from "../../domain/repositories/search-term-repository.js";
import { PrismaSearchTermMapper } from "../mappers/prisma-search-term-mapper.js";

/** Implementação real de `SearchTermRepository` — persistência via Prisma Client. */
export class PrismaSearchTermRepository implements SearchTermRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<SearchTerm>, InfrastructureError>> {
    try {
      const record = await this.client.searchTerm.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<SearchTerm>());
      }
      return Result.ok(Option.some(PrismaSearchTermMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar SearchTerm "${id.toString()}"`, { cause: error }));
    }
  }

  async findByNaturalKey(
    advertisingAccountId: UniqueEntityId,
    adGroupId: UniqueEntityId,
    searchTerm: string,
    dateRangeStart: Date,
    dateRangeEnd: Date,
  ): Promise<Result<Option<SearchTerm>, InfrastructureError>> {
    try {
      const record = await this.client.searchTerm.findUnique({
        where: {
          advertisingAccountId_adGroupId_searchTerm_dateRangeStart_dateRangeEnd: {
            advertisingAccountId: advertisingAccountId.toString(),
            adGroupId: adGroupId.toString(),
            searchTerm,
            dateRangeStart,
            dateRangeEnd,
          },
        },
      });
      if (!record) {
        return Result.ok(Option.none<SearchTerm>());
      }
      return Result.ok(Option.some(PrismaSearchTermMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar SearchTerm por natural key "${searchTerm}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<SearchTerm[], InfrastructureError>> {
    try {
      const records = await this.client.searchTerm.findMany();
      return Result.ok(records.map((record) => PrismaSearchTermMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar SearchTerms", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.searchTerm.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de SearchTerm "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: SearchTerm): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaSearchTermMapper.toPersistenceCreate(entity);
      await this.client.searchTerm.create({ data });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar SearchTerm "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.searchTerm.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir SearchTerm "${id.toString()}"`, { cause: error }));
    }
  }
}
