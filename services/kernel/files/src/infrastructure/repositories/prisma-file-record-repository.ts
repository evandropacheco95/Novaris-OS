import { Result, Option, InfrastructureError } from "@novaris/shared-kernel";
import type { UniqueEntityId } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import { FileRecord } from "../../domain/aggregates/file-record/file-record.js";
import type { FileRecordRepository } from "../../domain/repositories/file-record-repository.js";
import { PrismaFileRecordMapper } from "../mappers/prisma-file-record-mapper.js";

export class PrismaFileRecordRepository implements FileRecordRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UniqueEntityId): Promise<Result<Option<FileRecord>, InfrastructureError>> {
    try {
      const record = await this.prisma.fileRecord.findUnique({ where: { id: id.toString() } });
      return Result.ok(record ? Option.some(PrismaFileRecordMapper.toDomain(record)) : Option.none<FileRecord>());
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao buscar FileRecord: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findAll(): Promise<Result<FileRecord[], InfrastructureError>> {
    try {
      const records = await this.prisma.fileRecord.findMany();
      return Result.ok(records.map((record) => PrismaFileRecordMapper.toDomain(record)));
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao listar FileRecords: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    try {
      const count = await this.prisma.fileRecord.count({ where: { id: id.toString() } });
      return Result.ok(count > 0);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar existência de FileRecord: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async save(entity: FileRecord): Promise<Result<void, InfrastructureError>> {
    try {
      const data = PrismaFileRecordMapper.toPersistence(entity);
      await this.prisma.fileRecord.upsert({ where: { id: data.id }, create: data, update: data });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao salvar FileRecord: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    try {
      await this.prisma.fileRecord.delete({ where: { id: id.toString() } });
      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao excluir FileRecord: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}
