import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "@novaris/database";
import { PostgresPartySearch } from "../../src/infrastructure/postgres-party-search.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), mesmo
 * padrão de `prisma-party-repository.integration.test.ts` (Customer,
 * `ENG-0137`). Insere `Party`s reais direto via `prisma.party.create` (sem
 * passar pelo Aggregate/Repository do Customer Domain — `search` não precisa
 * dessa dependência cruzada só para provar a consulta).
 */
describe("PostgresPartySearch — integração real (Supabase)", () => {
  const organizationId = randomUUID();
  const otherOrganizationId = randomUUID();
  const createdIds: string[] = [];
  const search = new PostgresPartySearch(prisma);

  before(async () => {
    const parties = await Promise.all([
      prisma.party.create({ data: { organizationId, partyType: "person", name: "Ana Beatriz Silva" } }),
      prisma.party.create({ data: { organizationId, partyType: "person", name: "Carlos Ferreira" } }),
      prisma.party.create({ data: { organizationId, partyType: "external_organization", name: "Beta Consultoria Ltda" } }),
      prisma.party.create({ data: { organizationId: otherOrganizationId, partyType: "person", name: "Ana de Outra Organização" } }),
    ]);
    createdIds.push(...parties.map((party) => party.id));
  });

  after(async () => {
    await prisma.party.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("encontra Parties cujo nome contém a query, ignorando maiúsculas/minúsculas", async () => {
    const results = await search.search(organizationId, "ana");
    assert.equal(results.length, 1);
    assert.equal(results[0]!.label, "Ana Beatriz Silva");
    assert.equal(results[0]!.entityType, "Party");
  });

  it("não vaza resultados de outra organização", async () => {
    const results = await search.search(organizationId, "Outra Organização");
    assert.equal(results.length, 0);
  });

  it("encontra por substring no meio do nome", async () => {
    const results = await search.search(organizationId, "Consultoria");
    assert.equal(results.length, 1);
    assert.equal(results[0]!.label, "Beta Consultoria Ltda");
  });

  it("devolve lista vazia para query em branco, sem consultar o banco", async () => {
    const results = await search.search(organizationId, "   ");
    assert.deepEqual(results, []);
  });

  it("devolve lista vazia quando nada corresponde", async () => {
    const results = await search.search(organizationId, "nome-que-nao-existe-xyz");
    assert.deepEqual(results, []);
  });
});
