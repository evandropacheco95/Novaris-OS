import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Campaign } from "../../../domain/aggregates/campaign/campaign.js";
import { PrismaCampaignRepository } from "../../../infrastructure/repositories/prisma-campaign-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Prova que `PrismaCampaignRepository` funciona contra
 * um banco de dados real, incluindo `startDate`/`endDate` opcionais.
 */
describe("PrismaCampaignRepository — integração real (Supabase)", () => {
  const repository = new PrismaCampaignRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.campaign.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera uma Campaign real do Postgres, apenas com name", async () => {
    const campaign = Campaign.create({ organizationId: new UniqueEntityId(), name: "Campanha Integração" }).getValue()!;
    createdIds.push(campaign.id.toString());

    const saveResult = await repository.save(campaign);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const fetched = (await repository.findById(campaign.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.name, "Campanha Integração");
    assert.equal(fetched.startDate, undefined);
    assert.equal(fetched.endDate, undefined);
  });

  it("persiste startDate/endDate quando fornecidos", async () => {
    const startDate = new Date("2026-08-01T00:00:00.000Z");
    const endDate = new Date("2026-08-31T00:00:00.000Z");
    const campaign = Campaign.create({ organizationId: new UniqueEntityId(), name: "Black Friday", startDate, endDate }).getValue()!;
    createdIds.push(campaign.id.toString());
    await repository.save(campaign);

    const fetched = (await repository.findById(campaign.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.startDate?.getTime(), startDate.getTime());
    assert.equal(fetched.endDate?.getTime(), endDate.getTime());
  });

  it("exists() e delete() funcionam contra o banco real", async () => {
    const campaign = Campaign.create({ organizationId: new UniqueEntityId(), name: "Temporária" }).getValue()!;
    await repository.save(campaign);
    createdIds.push(campaign.id.toString());

    assert.equal((await repository.exists(campaign.id)).getValue(), true);
    await repository.delete(campaign.id);
    assert.equal((await repository.exists(campaign.id)).getValue(), false);
  });

  it("persiste assets reais, via a coleção da Campaign (`ADR-0048`)", async () => {
    const campaign = Campaign.create({ organizationId: new UniqueEntityId(), name: "Com Assets" }).getValue()!;
    createdIds.push(campaign.id.toString());
    campaign.addAsset(new UniqueEntityId());
    campaign.addAsset(new UniqueEntityId());

    const saveResult = await repository.save(campaign);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const fetched = (await repository.findById(campaign.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.getAssets().length, 2);
  });
});
