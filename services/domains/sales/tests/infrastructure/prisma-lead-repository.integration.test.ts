import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Lead } from "../../domain/aggregates/lead/lead.js";
import { PrismaLeadRepository } from "../../infrastructure/repositories/prisma-lead-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), mesmo
 * padrão de toda integração real desta engenharia. `leads` não tem FK real
 * para `organizations` (mesma decisão de desacoplamento cross-domínio de
 * toda tabela de Business Domain) — `new UniqueEntityId()` aleatório é seguro.
 */
describe("PrismaLeadRepository — integração real (Supabase)", () => {
  const repository = new PrismaLeadRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.lead.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera um Lead real do Postgres", async () => {
    const lead = Lead.create({
      organizationId: new UniqueEntityId(),
      name: "Fulano de Tal",
      email: "fulano@exemplo.com",
      company: "Acme Ltda",
      source: "website",
    }).getValue()!;
    createdIds.push(lead.id.toString());

    const saveResult = await repository.save(lead);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const found = (await repository.findById(lead.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.name, "Fulano de Tal");
    assert.equal(found.email, "fulano@exemplo.com");
    assert.equal(found.company, "Acme Ltda");
    assert.equal(found.status, "new");
  });

  it("persiste updateStatus() e reflete no re-fetch", async () => {
    const lead = Lead.create({ organizationId: new UniqueEntityId(), name: "Fulano" }).getValue()!;
    createdIds.push(lead.id.toString());
    await repository.save(lead);

    lead.updateStatus("qualified");
    await repository.save(lead);

    const found = (await repository.findById(lead.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.status, "qualified");
  });

  it("persiste convert() — status e convertedPartyId/convertedOpportunityId", async () => {
    const lead = Lead.create({ organizationId: new UniqueEntityId(), name: "Fulano" }).getValue()!;
    createdIds.push(lead.id.toString());
    await repository.save(lead);

    const partyId = new UniqueEntityId();
    const opportunityId = new UniqueEntityId();
    lead.convert(partyId, opportunityId);
    await repository.save(lead);

    const found = (await repository.findById(lead.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.status, "converted");
    assert.equal(found.convertedPartyId!.equals(partyId), true);
    assert.equal(found.convertedOpportunityId!.equals(opportunityId), true);
  });

  it("exists()/delete() funcionam contra o banco real", async () => {
    const lead = Lead.create({ organizationId: new UniqueEntityId(), name: "Temporário" }).getValue()!;
    await repository.save(lead);

    assert.equal((await repository.exists(lead.id)).getValue(), true);
    await repository.delete(lead.id);
    assert.equal((await repository.exists(lead.id)).getValue(), false);
  });
});
