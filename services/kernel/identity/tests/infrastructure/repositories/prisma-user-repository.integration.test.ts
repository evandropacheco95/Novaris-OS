import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { User } from "../../../src/domain/aggregates/user/user.js";
import { Email } from "../../../src/domain/value-objects/email.js";
import { PrismaUserRepository } from "../../../src/infrastructure/repositories/prisma-user-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Prova que `PrismaUserRepository` funciona contra um
 * banco de dados real. Emails únicos por execução (sufixo do próprio
 * `UniqueEntityId` gerado) — coluna `email` tem `UNIQUE` na migration.
 *
 * `users.organization_id` tem FK real para `organizations` (diferente de
 * `parties`/`relationships`, que referenciam por id sem FK) — precisa de uma
 * Organization real criada antes de qualquer User poder ser salvo; mesmo
 * achado registrado em `prisma-role-repository.integration.test.ts`.
 */
describe("PrismaUserRepository — integração real (Supabase)", () => {
  const repository = new PrismaUserRepository(prisma);
  const createdIds: string[] = [];
  let organizationId: string;

  before(async () => {
    const organization = await prisma.organization.create({
      data: {
        slug: `test-user-repo-${new UniqueEntityId().toString()}`,
        name: "Org Teste User Repo",
        legalName: "Org Teste User Repo Ltda",
        document: "00.000.000/0001-00",
        address: {},
        status: "active",
      },
    });
    organizationId = organization.id;
  });

  after(async () => {
    await prisma.user.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.organization.delete({ where: { id: organizationId } });
    await prisma.$disconnect();
  });

  function uniqueEmail(): Email {
    return Email.create(`integration-${new UniqueEntityId().toString()}@novaris.test`).getValue()!;
  }

  it("cria, persiste e recupera um User real do Postgres, no status \"created\"", async () => {
    const email = uniqueEmail();
    const user = User.create({ organizationId: new UniqueEntityId(organizationId), email, createdBy: new UniqueEntityId() }).getValue()!;
    createdIds.push(user.id.toString());

    const saveResult = await repository.save(user);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const fetched = (await repository.findById(user.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.email.value, email.value);
    assert.equal(fetched.status, "created");
    assert.deepEqual(fetched.roleIds, []);
  });

  it("persiste transições de status (activate) e roleIds (assignRole)", async () => {
    const user = User.create({
      organizationId: new UniqueEntityId(organizationId),
      email: uniqueEmail(),
      createdBy: new UniqueEntityId(),
    }).getValue()!;
    createdIds.push(user.id.toString());
    await repository.save(user);

    const roleId = new UniqueEntityId();
    user.activate(new UniqueEntityId());
    user.assignRole(roleId, new UniqueEntityId());
    await repository.save(user);

    const fetched = (await repository.findById(user.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.status, "active");
    assert.equal(fetched.roleIds.length, 1);
    assert.equal(fetched.roleIds[0]!.equals(roleId), true);
  });

  it("findAll() é usado por AuthenticationDomainService para localizar por email — confirma que devolve todos os Users salvos", async () => {
    const email = uniqueEmail();
    const user = User.create({
      organizationId: new UniqueEntityId(organizationId),
      email,
      createdBy: new UniqueEntityId(),
    }).getValue()!;
    createdIds.push(user.id.toString());
    await repository.save(user);

    const all = (await repository.findAll()).getValue()!;
    const found = all.find((u) => u.email.value === email.value);
    assert.notEqual(found, undefined);
  });

  it("exists() e delete() funcionam contra o banco real", async () => {
    const user = User.create({
      organizationId: new UniqueEntityId(organizationId),
      email: uniqueEmail(),
      createdBy: new UniqueEntityId(),
    }).getValue()!;
    await repository.save(user);
    createdIds.push(user.id.toString());

    assert.equal((await repository.exists(user.id)).getValue(), true);
    await repository.delete(user.id);
    assert.equal((await repository.exists(user.id)).getValue(), false);
  });
});
