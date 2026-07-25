import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Party } from "../../domain/aggregates/party/party.js";
import type { PartyRepository } from "../../domain/repositories/party-repository.js";
import { PrismaPartyMapper } from "../mappers/prisma-party-mapper.js";

/**
 * Implementação real de `PartyRepository` — persistência via Prisma Client
 * contra Postgres (Supabase), mesmo padrão de `PrismaOpportunityRepository`
 * (Sales, `ENG-0120`). Implementa exclusivamente os 5 métodos já congelados.
 */
export class PrismaPartyRepository implements PartyRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Party>, InfrastructureError>> {
    try {
      const record = await this.client.party.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<Party>());
      }
      return Result.ok(Option.some(PrismaPartyMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Party "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Party[], InfrastructureError>> {
    try {
      const records = await this.client.party.findMany();
      return Result.ok(records.map((record) => PrismaPartyMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Parties", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.party.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Party "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Party): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaPartyMapper.toPersistenceCreate(entity);
      await this.client.party.upsert({
        where: { id: data.id },
        create: data,
        update: { name: data.name, document: data.document },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Party "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.party.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Party "${id.toString()}"`, { cause: error }));
    }
  }
}
