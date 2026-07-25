import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Party } from "../../../domain/aggregates/party/party.js";
import { PrismaPartyRepository } from "../../../infrastructure/repositories/prisma-party-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Prova que `PrismaPartyRepository` funciona contra um
 * banco de dados real, incluindo o caso que já causou um bug real em produção
 * (`ENG-0126`): `partyType = "external_organization"` (21 caracteres) excedia
 * `VARCHAR(20)` e falhava silenciosamente — a coluna hoje é `VARCHAR(30)`
 * (migration `20260723085841_widen_party_type_column`), este teste é a
 * regressão permanente desse achado.
 */
describe("PrismaPartyRepository — integração real (Supabase)", () => {
  const repository = new PrismaPartyRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.party.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera uma Party do tipo person", async () => {
    const party = Party.create({
      organizationId: new UniqueEntityId(),
      partyType: "person",
      name: "Fulano de Tal",
      document: "123.456.789-00",
    }).getValue()!;
    createdIds.push(party.id.toString());

    const saveResult = await repository.save(party);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const findResult = await repository.findById(party.id);
    const fetched = findResult.getValue()!.getOrElse(null as never);
    assert.equal(fetched.partyType, "person");
    assert.equal(fetched.name, "Fulano de Tal");
    assert.equal(fetched.document, "123.456.789-00");
  });

  it("persiste partyType \"external_organization\" (21 caracteres) sem truncar — regressão do bug real de VARCHAR(20)", async () => {
    const party = Party.create({
      organizationId: new UniqueEntityId(),
      partyType: "external_organization",
      name: "Acme Ltda",
    }).getValue()!;
    createdIds.push(party.id.toString());

    const saveResult = await repository.save(party);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const fetched = (await repository.findById(party.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.partyType, "external_organization");
  });

  it("document ausente persiste como undefined, não como string vazia", async () => {
    const party = Party.create({ organizationId: new UniqueEntityId(), partyType: "person", name: "Sem Documento" }).getValue()!;
    createdIds.push(party.id.toString());
    await repository.save(party);

    const fetched = (await repository.findById(party.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.document, undefined);
  });

  it("exists() e delete() funcionam contra o banco real", async () => {
    const party = Party.create({ organizationId: new UniqueEntityId(), partyType: "person", name: "Temporário" }).getValue()!;
    await repository.save(party);

    const existsBefore = await repository.exists(party.id);
    assert.equal(existsBefore.getValue(), true);

    await repository.delete(party.id);

    const existsAfter = await repository.exists(party.id);
    assert.equal(existsAfter.getValue(), false);
  });
});
