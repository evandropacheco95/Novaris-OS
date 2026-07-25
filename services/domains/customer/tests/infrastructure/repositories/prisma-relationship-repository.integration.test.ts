import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Relationship } from "../../../domain/aggregates/relationship/relationship.js";
import { PrismaRelationshipRepository } from "../../../infrastructure/repositories/prisma-relationship-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Prova que `PrismaRelationshipRepository` funciona
 * contra um banco de dados real.
 */
describe("PrismaRelationshipRepository — integração real (Supabase)", () => {
  const repository = new PrismaRelationshipRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.relationship.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera um Relationship real do Postgres", async () => {
    const organizationId = new UniqueEntityId();
    const partyIdA = new UniqueEntityId();
    const partyIdB = new UniqueEntityId();

    const relationship = Relationship.create({ organizationId, partyIdA, partyIdB, type: "cliente" }).getValue()!;
    createdIds.push(relationship.id.toString());

    const saveResult = await repository.save(relationship);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const findResult = await repository.findById(relationship.id);
    const fetched = findResult.getValue()!.getOrElse(null as never);
    assert.equal(fetched.organizationId.toString(), organizationId.toString());
    assert.equal(fetched.partyIdA.toString(), partyIdA.toString());
    assert.equal(fetched.partyIdB.toString(), partyIdB.toString());
    assert.equal(fetched.type, "cliente");
  });

  it("persiste todos os 6 tipos confirmados em BOM.md sem truncar", async () => {
    const types = ["cliente", "fornecedor", "parceiro", "prospect", "investidor", "colaborador"] as const;
    for (const type of types) {
      const relationship = Relationship.create({
        organizationId: new UniqueEntityId(),
        partyIdA: new UniqueEntityId(),
        partyIdB: new UniqueEntityId(),
        type,
      }).getValue()!;
      createdIds.push(relationship.id.toString());
      await repository.save(relationship);

      const fetched = (await repository.findById(relationship.id)).getValue()!.getOrElse(null as never);
      assert.equal(fetched.type, type, `tipo "${type}" deveria persistir sem alteração`);
    }
  });

  it("exists() e delete() funcionam contra o banco real", async () => {
    const relationship = Relationship.create({
      organizationId: new UniqueEntityId(),
      partyIdA: new UniqueEntityId(),
      partyIdB: new UniqueEntityId(),
      type: "parceiro",
    }).getValue()!;
    await repository.save(relationship);

    const existsBefore = await repository.exists(relationship.id);
    assert.equal(existsBefore.getValue(), true);

    await repository.delete(relationship.id);

    const existsAfter = await repository.exists(relationship.id);
    assert.equal(existsAfter.getValue(), false);
  });
});
