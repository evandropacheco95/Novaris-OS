import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Subscription } from "../../../domain/aggregates/subscription/subscription.js";
import { PrismaSubscriptionRepository } from "../../../infrastructure/repositories/prisma-subscription-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Prova que `PrismaSubscriptionRepository` funciona
 * contra um banco de dados real.
 */
describe("PrismaSubscriptionRepository — integração real (Supabase)", () => {
  const repository = new PrismaSubscriptionRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.subscription.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera uma Subscription real do Postgres", async () => {
    const subscription = Subscription.create({ organizationId: new UniqueEntityId(), name: "Plano Pro" }).getValue()!;
    createdIds.push(subscription.id.toString());

    const saveResult = await repository.save(subscription);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const fetched = (await repository.findById(subscription.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.name, "Plano Pro");
  });

  it("exists() e delete() funcionam contra o banco real", async () => {
    const subscription = Subscription.create({ organizationId: new UniqueEntityId(), name: "Temporário" }).getValue()!;
    await repository.save(subscription);
    createdIds.push(subscription.id.toString());

    assert.equal((await repository.exists(subscription.id)).getValue(), true);
    await repository.delete(subscription.id);
    assert.equal((await repository.exists(subscription.id)).getValue(), false);
  });
});
