import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Invoice } from "../../../domain/aggregates/invoice/invoice.js";
import { PrismaInvoiceRepository } from "../../../infrastructure/repositories/prisma-invoice-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Prova que `PrismaInvoiceRepository` funciona contra um
 * banco de dados real, incluindo a conversão `Decimal` (Postgres/Prisma) ↔
 * `number` (domínio) na fronteira do Mapper (`ADR-0031`) — valores decimais
 * reais, não apenas inteiros, para expor qualquer perda de precisão.
 */
describe("PrismaInvoiceRepository — integração real (Supabase)", () => {
  const repository = new PrismaInvoiceRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.invoice.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera uma Invoice real do Postgres, com amount decimal preciso", async () => {
    const invoice = Invoice.create({ organizationId: new UniqueEntityId(), amount: 1234.56, currency: "BRL" }).getValue()!;
    createdIds.push(invoice.id.toString());

    const saveResult = await repository.save(invoice);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const fetched = (await repository.findById(invoice.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.amount, 1234.56, "Decimal → number não deveria perder precisão");
    assert.equal(fetched.currency, "BRL");
    assert.equal(fetched.status, "pending");
    assert.equal(fetched.subscriptionId, undefined);
  });

  it("persiste subscriptionId quando fornecido", async () => {
    const subscriptionId = new UniqueEntityId();
    const invoice = Invoice.create({
      organizationId: new UniqueEntityId(),
      amount: 99.9,
      currency: "USD",
      subscriptionId,
    }).getValue()!;
    createdIds.push(invoice.id.toString());
    await repository.save(invoice);

    const fetched = (await repository.findById(invoice.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.subscriptionId?.toString(), subscriptionId.toString());
  });

  it("persiste markPaid() (transição de status) e reflete no re-fetch", async () => {
    const invoice = Invoice.create({ organizationId: new UniqueEntityId(), amount: 500, currency: "BRL" }).getValue()!;
    createdIds.push(invoice.id.toString());
    await repository.save(invoice);

    invoice.markPaid();
    await repository.save(invoice);

    const fetched = (await repository.findById(invoice.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.status, "paid");
  });

  it("exists() e delete() funcionam contra o banco real", async () => {
    const invoice = Invoice.create({ organizationId: new UniqueEntityId(), amount: 10, currency: "BRL" }).getValue()!;
    await repository.save(invoice);
    createdIds.push(invoice.id.toString());

    assert.equal((await repository.exists(invoice.id)).getValue(), true);
    await repository.delete(invoice.id);
    assert.equal((await repository.exists(invoice.id)).getValue(), false);
  });
});
