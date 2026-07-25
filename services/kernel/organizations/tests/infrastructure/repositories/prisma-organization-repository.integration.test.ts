import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { prisma } from "@novaris/database";
import { Organization, type OrganizationAddress } from "../../../src/domain/aggregates/organization/organization.js";
import { PrismaOrganizationRepository } from "../../../src/infrastructure/repositories/prisma-organization-repository.js";

const ADDRESS: OrganizationAddress = {
  street: "Av. Paulista",
  number: "1000",
  district: "Bela Vista",
  city: "São Paulo",
  state: "SP",
  zipCode: "01310-100",
  country: "BR",
};

/**
 * Teste de integração real — conecta ao Postgres real (Supabase), via
 * `@novaris/database`. Prova que `PrismaOrganizationRepository` funciona
 * contra um banco de dados real, incluindo o soft delete (`deletedAt`) já
 * usado por `findById`/`findAll`/`exists`/`delete` (`ADR-...`, filtro
 * `deletedAt: null`).
 */
describe("PrismaOrganizationRepository — integração real (Supabase)", () => {
  const repository = new PrismaOrganizationRepository(prisma);
  const createdIds: string[] = [];

  after(async () => {
    await prisma.organization.deleteMany({ where: { id: { in: createdIds } } });
    await prisma.$disconnect();
  });

  function buildInput(overrides: Partial<Parameters<typeof Organization.create>[0]> = {}) {
    return {
      slug: `test-org-repo-${new UniqueEntityId().toString()}`,
      name: "Org Teste",
      legalName: "Org Teste Ltda",
      document: "00.000.000/0001-00",
      address: ADDRESS,
      status: "trial" as const,
      ...overrides,
    };
  }

  it("cria, persiste e recupera uma Organization real do Postgres", async () => {
    const input = buildInput();
    const organization = Organization.create(input).getValue()!;
    createdIds.push(organization.id.toString());

    const saveResult = await repository.save(organization);
    assert.equal(saveResult.isSuccess, true, JSON.stringify(saveResult.isFailure ? saveResult.getError() : null));

    const fetched = (await repository.findById(organization.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.slug, input.slug);
    assert.equal(fetched.name, "Org Teste");
    assert.equal(fetched.status, "trial");
    assert.deepEqual(fetched.address, ADDRESS);
  });

  it("persiste updateProfile() (name/legalName/document/address) e reflete no re-fetch", async () => {
    const organization = Organization.create(buildInput()).getValue()!;
    createdIds.push(organization.id.toString());
    await repository.save(organization);

    organization.updateProfile({ name: "Nome Atualizado" });
    await repository.save(organization);

    const fetched = (await repository.findById(organization.id)).getValue()!.getOrElse(null as never);
    assert.equal(fetched.name, "Nome Atualizado");
    assert.equal(fetched.legalName, "Org Teste Ltda", "campos não tocados não deveriam mudar");
  });

  it("delete() é soft — exists()/findById() respeitam deletedAt IS NULL", async () => {
    const organization = Organization.create(buildInput()).getValue()!;
    createdIds.push(organization.id.toString());
    await repository.save(organization);

    assert.equal((await repository.exists(organization.id)).getValue(), true);

    await repository.delete(organization.id);

    assert.equal((await repository.exists(organization.id)).getValue(), false, "exists() deve respeitar deletedAt IS NULL");
    const afterDelete = (await repository.findById(organization.id)).getValue()!;
    assert.equal(afterDelete.isNone, true, "findById() não deve devolver uma Organization com soft delete");

    const stillInDb = await prisma.organization.findUnique({ where: { id: organization.id.toString() } });
    assert.notEqual(stillInDb, null, "a linha continua existindo no banco — soft delete, não hard delete");
    assert.notEqual(stillInDb!.deletedAt, null);
  });
});
