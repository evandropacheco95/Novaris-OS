import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { AuditEntry } from "../../../src/domain/aggregates/audit-entry/audit-entry.js";
import { PrismaAuditEntryRepository } from "../../../src/infrastructure/repositories/prisma-audit-entry-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Prova que `PrismaAuditEntryRepository` funciona contra
 * um banco de dados real: cria (write-once), busca por `id`, busca por
 * `Target` (ordem cronológica). Limpa via `prisma.auditEntry.deleteMany`
 * diretamente — não via `AuditEntryRepository` (que deliberadamente não expõe
 * `delete`, ver `audit-entry-repository.ts`); a limpeza de teste não é uma
 * operação de negócio.
 *
 * Requer `packages/database/.env` com `DATABASE_URL`/`DIRECT_URL` reais —
 * carregado automaticamente por `@novaris/database` (ver `src/index.ts`).
 */
describe("PrismaAuditEntryRepository — integração real (Supabase)", () => {
  const repository = new PrismaAuditEntryRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.auditEntry.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera um AuditEntry real do Postgres", async () => {
    const input = {
      actorId: new UniqueEntityId(),
      organizationId: new UniqueEntityId(),
      targetId: new UniqueEntityId(),
      targetType: "Organization",
      action: "OrganizationCreated",
      occurredAt: new Date(),
      origin: "192.0.2.10",
      changeSet: { before: null, after: { status: "trial" } },
    };
    const entry = AuditEntry.create(input).getValue()!;
    createdIds.push(entry.id.toString());

    const saveResult = await repository.save(entry);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const findResult = await repository.findById(entry.id);
    assert.equal(findResult.isSuccess, true);
    const option = findResult.getValue()!;
    assert.equal(option.isSome, true);

    const fetched = option.getOrElse(null as never);
    assert.equal(fetched.actorId.toString(), input.actorId.toString());
    assert.equal(fetched.organizationId.toString(), input.organizationId.toString());
    assert.equal(fetched.targetId.toString(), input.targetId.toString());
    assert.equal(fetched.targetType, "Organization");
    assert.equal(fetched.action, "OrganizationCreated");
    assert.equal(fetched.origin, "192.0.2.10");
    assert.deepEqual(fetched.changeSet, { before: null, after: { status: "trial" } });
  });

  it("persiste changeSet ausente como undefined (não como objeto vazio)", async () => {
    const entry = AuditEntry.create({
      actorId: new UniqueEntityId(),
      organizationId: new UniqueEntityId(),
      targetId: new UniqueEntityId(),
      targetType: "User",
      action: "UserActivated",
      occurredAt: new Date(),
      origin: "system",
    }).getValue()!;
    createdIds.push(entry.id.toString());
    await repository.save(entry);

    const fetched = (await repository.findById(entry.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.changeSet, undefined);
  });

  it("findByTarget devolve a trilha de um Target em ordem cronológica", async () => {
    const targetId = new UniqueEntityId();
    const targetType = "Project";
    const base = Date.now();

    const first = AuditEntry.create({
      actorId: new UniqueEntityId(),
      organizationId: new UniqueEntityId(),
      targetId,
      targetType,
      action: "ProjectCreated",
      occurredAt: new Date(base),
      origin: "web",
    }).getValue()!;
    const second = AuditEntry.create({
      actorId: new UniqueEntityId(),
      organizationId: new UniqueEntityId(),
      targetId,
      targetType,
      action: "TaskAdded",
      occurredAt: new Date(base + 1000),
      origin: "web",
    }).getValue()!;
    createdIds.push(first.id.toString(), second.id.toString());

    // Salva fora de ordem para provar que a ordenação vem da query, não da ordem de inserção.
    await repository.save(second);
    await repository.save(first);

    const result = await repository.findByTarget(targetId, targetType);
    assert.equal(result.isSuccess, true);
    const entries = result.getValue()!;
    assert.equal(entries.length, 2);
    assert.equal(entries[0]!.action, "ProjectCreated");
    assert.equal(entries[1]!.action, "TaskAdded");
  });

  it("findByTarget não devolve entradas de outro Target", async () => {
    const targetId = new UniqueEntityId();
    const entry = AuditEntry.create({
      actorId: new UniqueEntityId(),
      organizationId: new UniqueEntityId(),
      targetId,
      targetType: "Invoice",
      action: "InvoicePaid",
      occurredAt: new Date(),
      origin: "web",
    }).getValue()!;
    createdIds.push(entry.id.toString());
    await repository.save(entry);

    const result = await repository.findByTarget(new UniqueEntityId(), "Invoice");
    assert.equal(result.getValue()!.length, 0);
  });
});
