import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Activity } from "../../../domain/aggregates/activity/activity.js";
import { PrismaActivityRepository } from "../../../infrastructure/repositories/prisma-activity-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Prova que `PrismaActivityRepository` funciona contra
 * um banco de dados real.
 */
describe("PrismaActivityRepository — integração real (Supabase)", () => {
  const repository = new PrismaActivityRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.activity.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera uma Activity real do Postgres", async () => {
    const activity = Activity.create({
      organizationId: new UniqueEntityId(),
      partyId: new UniqueEntityId(),
      type: "ligacao",
      notes: "Primeiro contato",
    }).getValue()!;
    createdIds.push(activity.id.toString());

    const saveResult = await repository.save(activity);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const fetched = (await repository.findById(activity.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.type, "ligacao");
    assert.equal(fetched.status, "open");
    assert.equal(fetched.notes, "Primeiro contato");
  });

  it("notes ausente persiste como undefined", async () => {
    const activity = Activity.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), type: "email" }).getValue()!;
    createdIds.push(activity.id.toString());
    await repository.save(activity);

    const fetched = (await repository.findById(activity.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.notes, undefined);
  });

  it("persiste complete() (transição de status) e reflete no re-fetch", async () => {
    const activity = Activity.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), type: "reuniao" }).getValue()!;
    createdIds.push(activity.id.toString());
    await repository.save(activity);

    activity.complete();
    await repository.save(activity);

    const fetched = (await repository.findById(activity.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.status, "completed");
  });

  it("exists() e delete() funcionam contra o banco real", async () => {
    const activity = Activity.create({ organizationId: new UniqueEntityId(), partyId: new UniqueEntityId(), type: "nota" }).getValue()!;
    await repository.save(activity);
    createdIds.push(activity.id.toString());

    assert.equal((await repository.exists(activity.id)).getValue(), true);
    await repository.delete(activity.id);
    assert.equal((await repository.exists(activity.id)).getValue(), false);
  });
});
