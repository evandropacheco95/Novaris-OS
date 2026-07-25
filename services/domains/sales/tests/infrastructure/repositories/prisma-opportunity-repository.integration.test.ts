import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Opportunity } from "../../../domain/aggregates/opportunity/opportunity.js";
import { PrismaOpportunityRepository } from "../../../infrastructure/repositories/prisma-opportunity-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Diferente dos testes de contrato (`InMemory*`, tempo de
 * compilação puro), esta suíte prova que `PrismaOpportunityRepository`
 * funciona contra um banco de dados real: cria, busca, submete/aprova
 * `Proposal`, e limpa (soft delete) o que criou. Nenhum dado de teste
 * permanece ativo após a execução.
 *
 * Requer `packages/database/.env` com `DATABASE_URL`/`DIRECT_URL` reais —
 * carregado automaticamente por `@novaris/database` (ver `src/index.ts`).
 */
describe("PrismaOpportunityRepository — integração real (Supabase)", () => {
  const repository = new PrismaOpportunityRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.proposal.deleteMany({ where: { opportunityId: { in: createdIds } } });
    await prisma.opportunity.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera uma Opportunity real do Postgres", async () => {
    const organizationId = new UniqueEntityId();
    const partyId = new UniqueEntityId();

    const createResult = Opportunity.create({ organizationId, partyId });
    assert.equal(createResult.isSuccess, true);
    const opportunity = createResult.getValue()!;
    createdIds.push(opportunity.id.toString());

    const saveResult = await repository.save(opportunity);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const findResult = await repository.findById(opportunity.id);
    assert.equal(findResult.isSuccess, true);
    const option = findResult.getValue()!;
    assert.equal(option.isSome, true);

    const fetched = option.getOrElse(null as never);
    assert.equal(fetched.id.toString(), opportunity.id.toString());
    assert.equal(fetched.organizationId.toString(), organizationId.toString());
    assert.equal(fetched.partyId.toString(), partyId.toString());
    assert.equal(fetched.status, "open");
  });

  it("persiste Proposal como Internal Entity, via a coleção da Opportunity", async () => {
    const opportunity = Opportunity.create({
      organizationId: new UniqueEntityId(),
      partyId: new UniqueEntityId(),
    }).getValue()!;
    createdIds.push(opportunity.id.toString());

    const submitResult = opportunity.submitProposal();
    assert.equal(submitResult.isSuccess, true);

    await repository.save(opportunity);

    const findResult = await repository.findById(opportunity.id);
    const fetched = findResult.getValue()!.getOrElse(null as never);
    assert.equal(fetched.getProposals().length, 1);
    assert.equal(fetched.getProposals()[0]!.status, "pending");

    // Aprova e re-salva — prova que o upsert de Proposal atualiza (não duplica).
    const proposalId = fetched.getProposals()[0]!.id;
    const approveResult = fetched.approveProposal(proposalId);
    assert.equal(approveResult.isSuccess, true);
    await repository.save(fetched);

    const refetched = (await repository.findById(opportunity.id)).getValue()!.getOrElse(null as never);
    assert.equal(refetched.getProposals().length, 1, "approve() não deve duplicar a Proposal");
    assert.equal(refetched.getProposals()[0]!.status, "approved");
  });

  it("exists() e delete() (soft delete) funcionam contra o banco real", async () => {
    const opportunity = Opportunity.create({
      organizationId: new UniqueEntityId(),
      partyId: new UniqueEntityId(),
    }).getValue()!;
    createdIds.push(opportunity.id.toString());
    await repository.save(opportunity);

    const existsBefore = await repository.exists(opportunity.id);
    assert.equal(existsBefore.getValue(), true);

    await repository.delete(opportunity.id);

    const existsAfter = await repository.exists(opportunity.id);
    assert.equal(existsAfter.getValue(), false, "delete() é soft — exists() deve respeitar deleted_at IS NULL");
  });
});
