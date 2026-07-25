import { Option, Result, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { AuditEntry } from "../../domain/aggregates/audit-entry/audit-entry.js";
import type { AuditEntryRepository } from "../../domain/repositories/audit-entry-repository.js";
import { PrismaAuditEntryMapper } from "../mappers/prisma-audit-entry-mapper.js";

/**
 * Implementação real de `AuditEntryRepository` — persistência via Prisma
 * Client contra Postgres (Supabase). Sem `delete` (interface deliberadamente
 * não estende `WriteRepository<T>` — ver `audit-entry-repository.ts`).
 * `save` sempre insere (write-once) — nunca `upsert`/`update`, diferente de
 * todo outro Repository desta engenharia: um `AuditEntry` já persistido
 * nunca deveria ser reenviado a `save()` (`AUDIT_PERSISTENCE_MAPPING_BLUEPRINT.md § 2`).
 */
export class PrismaAuditEntryRepository implements AuditEntryRepository {
  constructor(private readonly client: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<AuditEntry>, InfrastructureError>> {
    try {
      const record = await this.client.auditEntry.findUnique({ where: { id: id.toString() } });
      if (!record) {
        return Result.ok(Option.none<AuditEntry>());
      }
      return Result.ok(Option.some(PrismaAuditEntryMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar AuditEntry "${id.toString()}"`, { cause: error }));
    }
  }

  async findAll(): Promise<Result<AuditEntry[], InfrastructureError>> {
    try {
      const records = await this.client.auditEntry.findMany({ orderBy: { occurredAt: "asc" } });
      return Result.ok(records.map((record) => PrismaAuditEntryMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError("Falha ao listar AuditEntries", { cause: error }));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.client.auditEntry.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de AuditEntry "${id.toString()}"`, { cause: error }));
    }
  }

  async save(entity: AuditEntry): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaAuditEntryMapper.toPersistenceCreate(entity);
      await this.client.auditEntry.create({ data });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar AuditEntry "${entity.id.toString()}"`, { cause: error }));
    }
  }

  /** Consulta especializada por `Target` — ordenada cronologicamente (`AUDIT_REPOSITORY_CONTRACT.md § 7`). */
  async findByTarget(targetId: UniqueEntityId, targetType: string): Promise<Result<AuditEntry[], InfrastructureError>> {
    try {
      const records = await this.client.auditEntry.findMany({
        where: { targetId: targetId.toString(), targetType },
        orderBy: { occurredAt: "asc" },
      });
      return Result.ok(records.map((record) => PrismaAuditEntryMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar trilha de auditoria do Target "${targetId.toString()}"`, { cause: error }));
    }
  }
}
