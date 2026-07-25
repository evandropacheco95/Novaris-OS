import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Project } from "../../domain/aggregates/project/project.js";
import type { ProjectRepository } from "../../domain/repositories/project-repository.js";
import { PrismaProjectMapper } from "../mappers/prisma-project-mapper.js";

/**
 * Implementação real de `ProjectRepository` — persistência via Prisma Client
 * contra Postgres (Supabase), mesmo padrão de `PrismaOpportunityRepository`
 * (Sales, `ENG-0120`). `save()` sincroniza a coleção de `Task`s via upsert
 * dentro de uma transação — mesmo princípio de `Proposal`/`Opportunity`.
 */
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<Project>, InfrastructureError>> {
    try {
      const record = await this.client.project.findUnique({
        where: { id: id.toString(), deletedAt: null },
        include: { tasks: true },
      });
      if (!record) {
        return Result.ok(Option.none<Project>());
      }
      return Result.ok(Option.some(PrismaProjectMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar Project "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<Project[], InfrastructureError>> {
    try {
      const records = await this.client.project.findMany({ where: { deletedAt: null }, include: { tasks: true } });
      return Result.ok(records.map((record) => PrismaProjectMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar Projects", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.project.count({ where: { id: id.toString(), deletedAt: null } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de Project "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: Project): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaProjectMapper.toPersistenceCreate(entity);
      await this.client.$transaction([
        this.client.project.upsert({
          where: { id: data.id },
          create: data,
          update: { name: data.name },
        }),
        ...entity.getTasks().map((task) =>
          this.client.task.upsert({
            where: { id: task.id.toString() },
            create: {
              id: task.id.toString(),
              projectId: entity.id.toString(),
              title: task.title,
              status: task.status,
              createdAt: task.createdAt,
              updatedAt: task.updatedAt,
            },
            update: {
              title: task.title,
              status: task.status,
              updatedAt: task.updatedAt,
            },
          }),
        ),
      ]);
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar Project "${entity.id.toString()}"`, { cause: error }));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.client.project.update({ where: { id: id.toString() }, data: { deletedAt: new Date() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir Project "${id.toString()}"`, { cause: error }));
    }
  }
}
