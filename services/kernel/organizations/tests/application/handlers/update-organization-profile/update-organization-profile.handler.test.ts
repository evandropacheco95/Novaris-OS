import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option } from "@novaris/shared-kernel";
import type { InfrastructureError } from "@novaris/shared-kernel";
import { AuditEntry, CreateAuditEntryHandler } from "@novaris/audit";
import type { AuditEntryRepository } from "@novaris/audit";
import { Organization, type OrganizationAddress } from "../../../../src/domain/aggregates/organization/organization.js";
import type { OrganizationRepository } from "../../../../src/domain/repositories/organization-repository.js";
import { UpdateOrganizationProfileHandler } from "../../../../src/application/handlers/update-organization-profile/update-organization-profile.handler.js";
import { UpdateOrganizationProfileCommand } from "../../../../src/application/commands/update-organization-profile/update-organization-profile.command.js";

/**
 * Testes unitários de `UpdateOrganizationProfileHandler` — primeira suíte
 * deste Handler (`ADR-0035`, `ENG-0135`), cobrindo tanto o comportamento já
 * existente (orquestração find→update→save) quanto a nova integração real
 * com o Audit Domain (enriquecimento + resiliência a falha de auditoria).
 *
 * `FakeOrganizationRepository`/`FakeAuditEntryRepository` — Fakes em memória,
 * definidos só neste arquivo, mesmo padrão de
 * `create-opportunity.handler.test.ts` (Sales, `ENG-0073`): testa a
 * orquestração do Handler, isolada de qualquer Infrastructure real.
 */
class FakeOrganizationRepository implements OrganizationRepository {
  private readonly records = new Map<string, Organization>();

  async findById(id: UniqueEntityId): Promise<Result<Option<Organization>, InfrastructureError>> {
    const found = this.records.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<Organization>());
  }

  async findAll(): Promise<Result<Organization[], InfrastructureError>> {
    return Result.ok(Array.from(this.records.values()));
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.records.has(id.toString()));
  }

  async save(entity: Organization): Promise<Result<void, InfrastructureError>> {
    this.records.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.records.delete(id.toString());
    return Result.ok(undefined);
  }
}

class FakeAuditEntryRepository implements AuditEntryRepository {
  readonly saved: AuditEntry[] = [];
  shouldFail = false;

  async findById(id: UniqueEntityId): Promise<Result<Option<AuditEntry>, InfrastructureError>> {
    const found = this.saved.find((e) => e.id.equals(id));
    return Result.ok(found ? Option.some(found) : Option.none<AuditEntry>());
  }

  async findAll(): Promise<Result<AuditEntry[], InfrastructureError>> {
    return Result.ok(this.saved);
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.saved.some((e) => e.id.equals(id)));
  }

  async save(entry: AuditEntry): Promise<Result<void, InfrastructureError>> {
    if (this.shouldFail) {
      return Result.fail({ code: "INFRASTRUCTURE_ERROR", message: "Falha simulada" } as InfrastructureError);
    }
    this.saved.push(entry);
    return Result.ok(undefined);
  }

  async findByTarget(targetId: UniqueEntityId, targetType: string): Promise<Result<AuditEntry[], InfrastructureError>> {
    return Result.ok(this.saved.filter((e) => e.targetId.equals(targetId) && e.targetType === targetType));
  }
}

function buildAddress(): OrganizationAddress {
  return { street: "Rua A", number: "100", district: "Centro", city: "São Paulo", state: "SP", zipCode: "01000-000", country: "BR" };
}

async function seedOrganization(repository: OrganizationRepository): Promise<Organization> {
  const organization = Organization.create({
    slug: "acme",
    name: "Acme",
    legalName: "Acme Ltda",
    document: "00.000.000/0001-00",
    address: buildAddress(),
    status: "trial",
  }).getValue()!;
  await repository.save(organization);
  return organization;
}

function buildHandler(orgRepo = new FakeOrganizationRepository(), auditRepo = new FakeAuditEntryRepository()) {
  const createAuditEntryHandler = new CreateAuditEntryHandler(auditRepo);
  const handler = new UpdateOrganizationProfileHandler(orgRepo, createAuditEntryHandler);
  return { handler, orgRepo, auditRepo };
}

describe("UpdateOrganizationProfileHandler — orquestração básica", () => {
  it("atualiza só os campos fornecidos e persiste via save()", async () => {
    const { handler, orgRepo } = buildHandler();
    const organization = await seedOrganization(orgRepo);

    const result = await handler.execute(
      new UpdateOrganizationProfileCommand({ organizationId: organization.id.toString(), actorId: new UniqueEntityId().toString(), name: "Acme Corp" }),
    );

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.name, "Acme Corp");
    assert.equal(result.getValue()!.legalName, "Acme Ltda", "legalName não fornecido não deveria mudar");
  });

  it("devolve NotFoundError quando a Organization não existe", async () => {
    const { handler } = buildHandler();
    const result = await handler.execute(
      new UpdateOrganizationProfileCommand({ organizationId: new UniqueEntityId().toString(), actorId: new UniqueEntityId().toString(), name: "X" }),
    );
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });
});

describe("UpdateOrganizationProfileHandler — enriquecimento de auditoria (ADR-0035)", () => {
  it("registra um AuditEntry com actorId/organizationId/target corretos após sucesso", async () => {
    const { handler, orgRepo, auditRepo } = buildHandler();
    const organization = await seedOrganization(orgRepo);
    const actorId = new UniqueEntityId().toString();

    await handler.execute(
      new UpdateOrganizationProfileCommand({ organizationId: organization.id.toString(), actorId, name: "Acme Corp" }),
    );

    assert.equal(auditRepo.saved.length, 1);
    const entry = auditRepo.saved[0]!;
    assert.equal(entry.actorId.toString(), actorId);
    assert.equal(entry.organizationId.toString(), organization.id.toString());
    assert.equal(entry.targetId.toString(), organization.id.toString());
    assert.equal(entry.targetType, "Organization");
    assert.equal(entry.action, "OrganizationProfileUpdated");
    assert.equal(entry.origin, "api");
  });

  it("changeSet contém antes/depois só dos campos de fato alterados", async () => {
    const { handler, orgRepo, auditRepo } = buildHandler();
    const organization = await seedOrganization(orgRepo);

    await handler.execute(
      new UpdateOrganizationProfileCommand({
        organizationId: organization.id.toString(),
        actorId: new UniqueEntityId().toString(),
        name: "Acme Corp",
      }),
    );

    const entry = auditRepo.saved[0]!;
    assert.deepEqual(entry.changeSet, { before: { name: "Acme" }, after: { name: "Acme Corp" } });
  });

  it("changeSet é undefined quando nenhum campo é fornecido", async () => {
    const { handler, orgRepo, auditRepo } = buildHandler();
    const organization = await seedOrganization(orgRepo);

    await handler.execute(new UpdateOrganizationProfileCommand({ organizationId: organization.id.toString(), actorId: new UniqueEntityId().toString() }));

    assert.equal(auditRepo.saved[0]!.changeSet, undefined);
  });

  it("falha ao registrar auditoria NÃO reverte nem falha a operação primária", async () => {
    const auditRepo = new FakeAuditEntryRepository();
    auditRepo.shouldFail = true;
    const { handler, orgRepo } = buildHandler(new FakeOrganizationRepository(), auditRepo);
    const organization = await seedOrganization(orgRepo);

    const result = await handler.execute(
      new UpdateOrganizationProfileCommand({ organizationId: organization.id.toString(), actorId: new UniqueEntityId().toString(), name: "Acme Corp" }),
    );

    assert.equal(result.isSuccess, true, "a atualização de perfil já foi persistida — falha de auditoria não deve reverter isso");
    assert.equal(result.getValue()!.name, "Acme Corp");
    assert.equal(auditRepo.saved.length, 0, "nada foi persistido no lado do Audit, mas isso não afeta o resultado do Handler");
  });
});
