import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Quotation } from "../../domain/aggregates/quotation/quotation.js";
import { PrismaQuotationRepository } from "../../infrastructure/repositories/prisma-quotation-repository.js";

/**
 * Cobre especificamente a sincronização transacional de `lineItems` (tabela
 * própria, `quotation_line_items`) — o ponto de maior risco desta
 * Infrastructure, mesmo padrão de risco já coberto para `Opportunity`/`proposals`.
 */
describe("PrismaQuotationRepository — integração real (Supabase)", () => {
  const repository = new PrismaQuotationRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.quotationLineItem.deleteMany({ where: { quotationId: { in: createdIds } } });
    await prisma.quotation.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera uma Quotation real do Postgres, sem itens", async () => {
    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    createdIds.push(quotation.id.toString());

    const saveResult = await repository.save(quotation);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const found = (await repository.findById(quotation.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.status, "draft");
    assert.equal(found.getLineItems().length, 0);
  });

  it("persiste múltiplos lineItems reais e reconstitui o total corretamente", async () => {
    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    createdIds.push(quotation.id.toString());
    await repository.save(quotation);

    quotation.addLineItem({ productId: new UniqueEntityId(), quantity: 2, unitPrice: 100 });
    quotation.addLineItem({ productId: new UniqueEntityId(), quantity: 1, unitPrice: 50 });
    await repository.save(quotation);

    const found = (await repository.findById(quotation.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.getLineItems().length, 2);
    assert.equal(found.total, 250);
  });

  it("persiste send()/accept() (status terminal)", async () => {
    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    createdIds.push(quotation.id.toString());
    await repository.save(quotation);

    quotation.send();
    quotation.accept();
    await repository.save(quotation);

    const found = (await repository.findById(quotation.id)).getValue()!.getOrElse(null as never);
    assert.equal(found.status, "accepted");
  });

  it("exists()/delete() funcionam contra o banco real (cascade em quotation_line_items)", async () => {
    const quotation = Quotation.create({ organizationId: new UniqueEntityId(), opportunityId: new UniqueEntityId() }).getValue()!;
    await repository.save(quotation);
    quotation.addLineItem({ productId: new UniqueEntityId(), quantity: 1, unitPrice: 10 });
    await repository.save(quotation);

    assert.equal((await repository.exists(quotation.id)).getValue(), true);
    await repository.delete(quotation.id);
    assert.equal((await repository.exists(quotation.id)).getValue(), false);
  });
});
