import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Role } from "../../../src/domain/aggregates/role/role.js";
import { Permission } from "../../../src/domain/value-objects/permission.js";
import { PrismaRoleRepository } from "../../../src/infrastructure/repositories/prisma-role-repository.js";

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Prova que `PrismaRoleRepository` funciona contra um
 * banco de dados real, incluindo persistência de `permissions` (array de
 * `Permission`, coluna `String[]` em `roles`).
 *
 * `roles.organization_id` tem FK real para `organizations` (diferente de
 * `parties`/`relationships`, que referenciam por id sem FK) — precisa de uma
 * Organization real criada antes de qualquer Role poder ser salva; achado ao
 * escrever este teste (a primeira tentativa usava um `UniqueEntityId`
 * aleatório e falhava com violação de FK).
 */
describe("PrismaRoleRepository — integração real (Supabase)", () => {
  const repository = new PrismaRoleRepository(prisma);
  const createdIds: string[] = [];
  let organizationId: string;

  before(async () => {
    const organization = await prisma.organization.create({
      data: {
        slug: `test-role-repo-${new UniqueEntityId().toString()}`,
        name: "Org Teste Role Repo",
        legalName: "Org Teste Role Repo Ltda",
        document: "00.000.000/0001-00",
        address: {},
        status: "active",
      },
    });
    organizationId = organization.id;
  });

  after(async () => {
    await prisma.role.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.organization.delete({ where: { id: organizationId } });
    await prisma.$disconnect();
  });

  it("cria, persiste e recupera uma Role real do Postgres", async () => {
    const createdBy = new UniqueEntityId();
    const role = Role.create({ organizationId: new UniqueEntityId(organizationId), name: "Teste Integração", createdBy }).getValue()!;
    createdIds.push(role.id.toString());

    const saveResult = await repository.save(role);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const findResult = await repository.findById(role.id);
    const fetched = findResult.getValue()!.getOrElse(null as never);
    assert.equal(fetched.name, "Teste Integração");
    assert.deepEqual(fetched.permissions, []);
    assert.equal(fetched.version, 1);
  });

  it("persiste permissions concedidas e reflete no re-fetch", async () => {
    const role = Role.create({
      organizationId: new UniqueEntityId(organizationId),
      name: "Com Permissões",
      createdBy: new UniqueEntityId(),
    }).getValue()!;
    createdIds.push(role.id.toString());
    role.grantPermission(Permission.create("sales.opportunities.manage").getValue()!, new UniqueEntityId());
    role.grantPermission(Permission.create("financial.invoices.manage").getValue()!, new UniqueEntityId());
    await repository.save(role);

    const fetched = (await repository.findById(role.id)).getValue()!.getOrElse(null as never);
    assert.deepEqual(
      fetched.permissions.map((p) => p.code).sort(),
      ["financial.invoices.manage", "sales.opportunities.manage"],
    );
  });

  it("re-save após grantPermission atualiza (upsert), não duplica a Role", async () => {
    const role = Role.create({
      organizationId: new UniqueEntityId(organizationId),
      name: "Atualizável",
      createdBy: new UniqueEntityId(),
    }).getValue()!;
    createdIds.push(role.id.toString());
    await repository.save(role);

    role.grantPermission(Permission.create("identity.users.manage").getValue()!, new UniqueEntityId());
    await repository.save(role);

    const all = (await repository.findAll()).getValue()!;
    const matches = all.filter((r) => r.id.equals(role.id));
    assert.equal(matches.length, 1, "upsert não deveria duplicar a linha");
    assert.equal(matches[0]!.permissions.length, 1);
  });

  it("exists() e delete() funcionam contra o banco real", async () => {
    const role = Role.create({
      organizationId: new UniqueEntityId(organizationId),
      name: "Temporária",
      createdBy: new UniqueEntityId(),
    }).getValue()!;
    await repository.save(role);
    createdIds.push(role.id.toString());

    assert.equal((await repository.exists(role.id)).getValue(), true);
    await repository.delete(role.id);
    assert.equal((await repository.exists(role.id)).getValue(), false);
  });
});
