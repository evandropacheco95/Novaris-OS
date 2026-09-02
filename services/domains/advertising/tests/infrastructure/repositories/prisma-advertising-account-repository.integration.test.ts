import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { AdvertisingAccount } from "../../../domain/aggregates/advertising-account/advertising-account.js";
import { PrismaAdvertisingAccountRepository } from "../../../infrastructure/repositories/prisma-advertising-account-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Prova que `PrismaAdvertisingAccountRepository`
 * funciona contra um banco de dados real. Mesmo padrão de
 * `prisma-campaign-repository.integration.test.ts`.
 */
describe("PrismaAdvertisingAccountRepository — integração real (Supabase)", () => {
  const repository = new PrismaAdvertisingAccountRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.advertisingAccount.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera uma AdvertisingAccount real do Postgres", async () => {
    const account = AdvertisingAccount.create({ organizationId: new UniqueEntityId(), provider: "google_ads", name: "Winnet Metais — Google Ads" }).getValue()!;
    createdIds.push(account.id.toString());

    const saveResult = await repository.save(account);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const fetched = (await repository.findById(account.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.name, "Winnet Metais — Google Ads");
    assert.equal(fetched.connectionStatus, "NOT_CONNECTED");
    assert.equal(fetched.externalAccountId, undefined);
  });

  it("exists() e delete() funcionam contra o banco real", async () => {
    const account = AdvertisingAccount.create({ organizationId: new UniqueEntityId(), provider: "google_ads", name: "Temporária" }).getValue()!;
    await repository.save(account);
    createdIds.push(account.id.toString());

    assert.equal((await repository.exists(account.id)).getValue(), true);
    await repository.delete(account.id);
    assert.equal((await repository.exists(account.id)).getValue(), false);
  });
});
