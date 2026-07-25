import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { FeatureFlag } from "../../../src/domain/aggregates/feature-flag/feature-flag.js";
import { PrismaFeatureFlagRepository } from "../../../src/infrastructure/repositories/prisma-feature-flag-repository.js";

describe("PrismaFeatureFlagRepository — integração real (Supabase)", () => {
  const repository = new PrismaFeatureFlagRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.featureFlag.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera uma FeatureFlag real do Postgres", async () => {
    const flag = FeatureFlag.create({ organizationId: new UniqueEntityId(), key: "novo-dashboard", enabled: true }).getValue()!;
    createdIds.push(flag.id.toString());

    const saveResult = await repository.save(flag);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const found = (await repository.findById(flag.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.key, "novo-dashboard");
    assert.equal(found.enabled, true);
  });

  it("findByOrganizationAndKey encontra pela chave composta real", async () => {
    const organizationId = new UniqueEntityId();
    const flag = FeatureFlag.create({ organizationId, key: "beta-ui", enabled: false }).getValue()!;
    createdIds.push(flag.id.toString());
    await repository.save(flag);

    const found = (await repository.findByOrganizationAndKey(organizationId, "beta-ui")).getValue()!.getOrElse(null as never);
    assert.equal(found.enabled, false);
  });

  it("save() em cima de uma flag existente faz update (upsert), não duplica", async () => {
    const organizationId = new UniqueEntityId();
    const flag = FeatureFlag.create({ organizationId, key: "toggle", enabled: false }).getValue()!;
    createdIds.push(flag.id.toString());
    await repository.save(flag);

    flag.setEnabled(true);
    await repository.save(flag);

    const found = (await repository.findByOrganizationAndKey(organizationId, "toggle")).getValue()!.getOrElse(null as never);
    assert.equal(found.enabled, true);
  });

  it("exists()/delete() funcionam contra o banco real", async () => {
    const flag = FeatureFlag.create({ organizationId: new UniqueEntityId(), key: "temp", enabled: true }).getValue()!;
    await repository.save(flag);

    assert.equal((await repository.exists(flag.id)).getValue(), true);
    await repository.delete(flag.id);
    assert.equal((await repository.exists(flag.id)).getValue(), false);
  });
});
