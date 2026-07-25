import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { ConfigurationEntry } from "../../../src/domain/aggregates/configuration-entry/configuration-entry.js";
import { PrismaConfigurationEntryRepository } from "../../../src/infrastructure/repositories/prisma-configuration-entry-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), mesmo
 * padrão de toda integração real desta engenharia (`ENG-0137`). `Party`
 * (Business Domain) não tem FK real para `organizations` — `configuration_entries`
 * também não (mesma decisão de desacoplamento cross-domínio), então
 * `new UniqueEntityId()` aleatório é seguro aqui.
 */
describe("PrismaConfigurationEntryRepository — integração real (Supabase)", () => {
  const repository = new PrismaConfigurationEntryRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.configurationEntry.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera uma ConfigurationEntry real do Postgres", async () => {
    const entry = ConfigurationEntry.create({ organizationId: new UniqueEntityId(), key: "tema", value: "escuro" }).getValue()!;
    createdIds.push(entry.id.toString());

    const saveResult = await repository.save(entry);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const found = (await repository.findById(entry.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.key, "tema");
    assert.equal(found.value, "escuro");
  });

  it("findByOrganizationAndKey encontra pela chave composta real", async () => {
    const organizationId = new UniqueEntityId();
    const entry = ConfigurationEntry.create({ organizationId, key: "idioma", value: "pt-BR" }).getValue()!;
    createdIds.push(entry.id.toString());
    await repository.save(entry);

    const found = (await repository.findByOrganizationAndKey(organizationId, "idioma")).getValue()!.getOrElse(null as never);
    assert.equal(found.value, "pt-BR");
  });

  it("save() em cima de uma entry existente faz update (upsert), não duplica", async () => {
    const organizationId = new UniqueEntityId();
    const entry = ConfigurationEntry.create({ organizationId, key: "tema", value: "escuro" }).getValue()!;
    createdIds.push(entry.id.toString());
    await repository.save(entry);

    entry.updateValue("claro");
    await repository.save(entry);

    const found = (await repository.findByOrganizationAndKey(organizationId, "tema")).getValue()!.getOrElse(null as never);
    assert.equal(found.value, "claro");
  });

  it("exists()/delete() funcionam contra o banco real", async () => {
    const entry = ConfigurationEntry.create({ organizationId: new UniqueEntityId(), key: "temp", value: "x" }).getValue()!;
    await repository.save(entry);

    assert.equal((await repository.exists(entry.id)).getValue(), true);
    await repository.delete(entry.id);
    assert.equal((await repository.exists(entry.id)).getValue(), false);
  });
});
