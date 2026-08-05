import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { SalesChannel } from "../../domain/aggregates/sales-channel/sales-channel.js";
import { PrismaSalesChannelRepository } from "../../infrastructure/repositories/prisma-sales-channel-repository.js";

describe("PrismaSalesChannelRepository — integração real (Supabase)", () => {
  const repository = new PrismaSalesChannelRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.salesChannel.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera um SalesChannel real do Postgres", async () => {
    const channel = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "Mercado Livre", type: "marketplace" }).getValue()!;
    createdIds.push(channel.id.toString());

    const saveResult = await repository.save(channel);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const found = (await repository.findById(channel.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.name, "Mercado Livre");
    assert.equal(found.type, "marketplace");
    assert.equal(found.active, true);
  });

  it("persiste rename()/deactivate() e reflete no re-fetch", async () => {
    const channel = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "X", type: "direct" }).getValue()!;
    createdIds.push(channel.id.toString());
    await repository.save(channel);

    channel.rename("Venda Direta B2B");
    channel.deactivate();
    await repository.save(channel);

    const found = (await repository.findById(channel.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.name, "Venda Direta B2B");
    assert.equal(found.active, false);
  });

  it("exists()/delete() funcionam contra o banco real", async () => {
    const channel = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "Temporário", type: "distributor" }).getValue()!;
    await repository.save(channel);

    assert.equal((await repository.exists(channel.id)).getValue(), true);
    await repository.delete(channel.id);
    assert.equal((await repository.exists(channel.id)).getValue(), false);
  });
});
