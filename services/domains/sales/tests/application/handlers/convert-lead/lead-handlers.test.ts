import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option, type InfrastructureError } from "@novaris/shared-kernel";
import { Party, CreatePartyHandler, type PartyRepository } from "@novaris/customer";
import type { Lead } from "../../../../domain/aggregates/lead/lead.js";
import type { LeadRepository } from "../../../../domain/repositories/lead-repository.js";
import type { Opportunity } from "../../../../domain/aggregates/opportunity/opportunity.js";
import type { OpportunityRepository } from "../../../../domain/repositories/opportunity-repository.js";
import { CreateOpportunityHandler } from "../../../../application/handlers/create-opportunity/create-opportunity.handler.js";
import { CreateLeadHandler } from "../../../../application/handlers/create-lead/create-lead.handler.js";
import { CreateLeadCommand } from "../../../../application/commands/create-lead/create-lead.command.js";
import { UpdateLeadStatusHandler } from "../../../../application/handlers/update-lead-status/update-lead-status.handler.js";
import { UpdateLeadStatusCommand } from "../../../../application/commands/update-lead-status/update-lead-status.command.js";
import { ConvertLeadHandler } from "../../../../application/handlers/convert-lead/convert-lead.handler.js";
import { ConvertLeadCommand } from "../../../../application/commands/convert-lead/convert-lead.command.js";

class FakeLeadRepository implements LeadRepository {
  private readonly records = new Map<string, Lead>();

  async findById(id: UniqueEntityId): Promise<Result<Option<Lead>, InfrastructureError>> {
    const found = this.records.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<Lead>());
  }

  async findAll(): Promise<Result<Lead[], InfrastructureError>> {
    return Result.ok(Array.from(this.records.values()));
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.records.has(id.toString()));
  }

  async save(entity: Lead): Promise<Result<void, InfrastructureError>> {
    this.records.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.records.delete(id.toString());
    return Result.ok(undefined);
  }
}

class FakePartyRepository implements PartyRepository {
  readonly saved: Party[] = [];

  async findById(id: UniqueEntityId): Promise<Result<Option<Party>, InfrastructureError>> {
    const found = this.saved.find((party) => party.id.equals(id));
    return Result.ok(found ? Option.some(found) : Option.none<Party>());
  }

  async findAll(): Promise<Result<Party[], InfrastructureError>> {
    return Result.ok(this.saved);
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.saved.some((party) => party.id.equals(id)));
  }

  async save(entity: Party): Promise<Result<void, InfrastructureError>> {
    this.saved.push(entity);
    return Result.ok(undefined);
  }

  async delete(): Promise<Result<void, InfrastructureError>> {
    return Result.ok(undefined);
  }
}

class FakeOpportunityRepository implements OpportunityRepository {
  readonly saved: Opportunity[] = [];

  async findById(id: UniqueEntityId): Promise<Result<Option<Opportunity>, InfrastructureError>> {
    const found = this.saved.find((opportunity) => opportunity.id.equals(id));
    return Result.ok(found ? Option.some(found) : Option.none<Opportunity>());
  }

  async findAll(): Promise<Result<Opportunity[], InfrastructureError>> {
    return Result.ok(this.saved);
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.saved.some((opportunity) => opportunity.id.equals(id)));
  }

  async save(entity: Opportunity): Promise<Result<void, InfrastructureError>> {
    this.saved.push(entity);
    return Result.ok(undefined);
  }

  async delete(): Promise<Result<void, InfrastructureError>> {
    return Result.ok(undefined);
  }
}

function buildHandlers() {
  const leadRepository = new FakeLeadRepository();
  const partyRepository = new FakePartyRepository();
  const opportunityRepository = new FakeOpportunityRepository();
  const createLeadHandler = new CreateLeadHandler(leadRepository);
  const updateLeadStatusHandler = new UpdateLeadStatusHandler(leadRepository);
  const convertLeadHandler = new ConvertLeadHandler(
    leadRepository,
    new CreatePartyHandler(partyRepository),
    new CreateOpportunityHandler(opportunityRepository),
  );
  return { leadRepository, partyRepository, opportunityRepository, createLeadHandler, updateLeadStatusHandler, convertLeadHandler };
}

describe("CreateLeadHandler", () => {
  it("cria e persiste um Lead válido", async () => {
    const { createLeadHandler } = buildHandlers();
    const result = await createLeadHandler.execute(
      new CreateLeadCommand({ organizationId: new UniqueEntityId().toString(), name: "Fulano de Tal" }),
    );
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.status, "new");
  });
});

describe("UpdateLeadStatusHandler", () => {
  it("atualiza o status de um Lead existente", async () => {
    const { createLeadHandler, updateLeadStatusHandler } = buildHandlers();
    const created = await createLeadHandler.execute(
      new CreateLeadCommand({ organizationId: new UniqueEntityId().toString(), name: "Fulano" }),
    );
    const leadId = created.getValue()!.id.toString();

    const result = await updateLeadStatusHandler.execute(new UpdateLeadStatusCommand({ leadId, status: "qualified" }));
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.status, "qualified");
  });

  it("devolve NotFoundError para leadId inexistente", async () => {
    const { updateLeadStatusHandler } = buildHandlers();
    const result = await updateLeadStatusHandler.execute(
      new UpdateLeadStatusCommand({ leadId: new UniqueEntityId().toString(), status: "qualified" }),
    );
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });
});

describe("ConvertLeadHandler — composição real entre Sales e Customer", () => {
  it("converte um Lead em Party (person) real, sem criar Opportunity", async () => {
    const { createLeadHandler, convertLeadHandler, partyRepository, opportunityRepository } = buildHandlers();
    const organizationId = new UniqueEntityId().toString();
    const created = await createLeadHandler.execute(new CreateLeadCommand({ organizationId, name: "Fulano de Tal" }));
    const leadId = created.getValue()!.id.toString();

    const result = await convertLeadHandler.execute(new ConvertLeadCommand({ leadId, partyType: "person" }));

    assert.equal(result.isSuccess, true, JSON.stringify(result.isFailure ? result.getError() : null));
    assert.equal(result.getValue()!.status, "converted");
    assert.equal(partyRepository.saved.length, 1);
    assert.equal(partyRepository.saved[0]!.name, "Fulano de Tal");
    assert.equal(result.getValue()!.convertedPartyId!.equals(partyRepository.saved[0]!.id), true);
    assert.equal(result.getValue()!.convertedOpportunityId, undefined);
    assert.equal(opportunityRepository.saved.length, 0);
  });

  it("usa 'company' como nome do Party quando partyType é external_organization", async () => {
    const { createLeadHandler, convertLeadHandler, partyRepository } = buildHandlers();
    const organizationId = new UniqueEntityId().toString();
    const created = await createLeadHandler.execute(
      new CreateLeadCommand({ organizationId, name: "Fulano (contato)", company: "Acme Ltda" }),
    );
    const leadId = created.getValue()!.id.toString();

    await convertLeadHandler.execute(new ConvertLeadCommand({ leadId, partyType: "external_organization" }));

    assert.equal(partyRepository.saved[0]!.name, "Acme Ltda");
  });

  it("cria também uma Opportunity real quando createOpportunity: true", async () => {
    const { createLeadHandler, convertLeadHandler, partyRepository, opportunityRepository } = buildHandlers();
    const organizationId = new UniqueEntityId().toString();
    const created = await createLeadHandler.execute(new CreateLeadCommand({ organizationId, name: "Fulano" }));
    const leadId = created.getValue()!.id.toString();

    const result = await convertLeadHandler.execute(new ConvertLeadCommand({ leadId, partyType: "person", createOpportunity: true }));

    assert.equal(opportunityRepository.saved.length, 1);
    assert.equal(opportunityRepository.saved[0]!.partyId.equals(partyRepository.saved[0]!.id), true);
    assert.equal(result.getValue()!.convertedOpportunityId!.equals(opportunityRepository.saved[0]!.id), true);
  });

  it("devolve NotFoundError para leadId inexistente, sem criar Party", async () => {
    const { convertLeadHandler, partyRepository } = buildHandlers();
    const result = await convertLeadHandler.execute(
      new ConvertLeadCommand({ leadId: new UniqueEntityId().toString(), partyType: "person" }),
    );
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
    assert.equal(partyRepository.saved.length, 0);
  });

  it("rejeita converter um Lead já convertido", async () => {
    const { createLeadHandler, convertLeadHandler } = buildHandlers();
    const organizationId = new UniqueEntityId().toString();
    const created = await createLeadHandler.execute(new CreateLeadCommand({ organizationId, name: "Fulano" }));
    const leadId = created.getValue()!.id.toString();

    await convertLeadHandler.execute(new ConvertLeadCommand({ leadId, partyType: "person" }));
    const secondAttempt = await convertLeadHandler.execute(new ConvertLeadCommand({ leadId, partyType: "person" }));

    assert.equal(secondAttempt.isFailure, true);
    assert.equal(secondAttempt.getError()!.code, "CONFLICT_ERROR");
  });
});
