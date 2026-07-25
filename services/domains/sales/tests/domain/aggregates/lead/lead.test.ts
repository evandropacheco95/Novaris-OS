import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Lead } from "../../../../domain/aggregates/lead/lead.js";

describe("Lead.create", () => {
  it("cria um Lead válido, status inicial 'new'", () => {
    const result = Lead.create({ organizationId: new UniqueEntityId(), name: "Fulano de Tal" });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.status, "new");
  });

  it("aceita campos opcionais", () => {
    const result = Lead.create({
      organizationId: new UniqueEntityId(),
      name: "Fulano",
      email: "fulano@exemplo.com",
      phone: "+5511999999999",
      company: "Acme Ltda",
      source: "website",
    });
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.company, "Acme Ltda");
  });

  it("rejeita name vazio", () => {
    const result = Lead.create({ organizationId: new UniqueEntityId(), name: "  " });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("dispara exatamente um LeadCreated com aggregateId igual ao id do Lead", () => {
    const result = Lead.create({ organizationId: new UniqueEntityId(), name: "Fulano" });
    const lead = result.getValue()!;
    assert.equal(lead.domainEvents.length, 1);
    assert.equal(lead.domainEvents[0]!.eventName, "LeadCreated");
    assert.equal(lead.domainEvents[0]!.aggregateId.equals(lead.id), true);
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Lead.create({ organizationId: new UniqueEntityId(), name: "" }));
  });
});

describe("Lead.reconstitute", () => {
  it("recria sem validar e sem disparar eventos", () => {
    const id = new UniqueEntityId();
    const now = new Date();
    const lead = Lead.reconstitute(
      { organizationId: new UniqueEntityId(), name: "x", status: "new", createdAt: now, updatedAt: now },
      id,
    );
    assert.equal(lead.id.equals(id), true);
    assert.equal(lead.domainEvents.length, 0);
  });
});

describe("Lead.updateStatus", () => {
  it("transiciona entre estados não-terminais", () => {
    const lead = Lead.create({ organizationId: new UniqueEntityId(), name: "Fulano" }).getValue()!;
    const result = lead.updateStatus("contacted");
    assert.equal(result.isSuccess, true);
    assert.equal(lead.status, "contacted");
  });

  it("rejeita status fora da união conhecida (achado real, mesma classe de bug de ENG-0134/0137)", () => {
    const lead = Lead.create({ organizationId: new UniqueEntityId(), name: "Fulano" }).getValue()!;
    // @ts-expect-error — testa proteção em runtime contra valor que TypeScript não deixaria passar
    const result = lead.updateStatus("nao-existe");
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
  });

  it("rejeita mudança de status após conversão", () => {
    const lead = Lead.create({ organizationId: new UniqueEntityId(), name: "Fulano" }).getValue()!;
    lead.convert(new UniqueEntityId());
    const result = lead.updateStatus("qualified");
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });
});

describe("Lead.convert", () => {
  it("marca status converted e grava convertedPartyId", () => {
    const lead = Lead.create({ organizationId: new UniqueEntityId(), name: "Fulano" }).getValue()!;
    const partyId = new UniqueEntityId();
    const result = lead.convert(partyId);

    assert.equal(result.isSuccess, true);
    assert.equal(lead.status, "converted");
    assert.equal(lead.convertedPartyId!.equals(partyId), true);
    assert.equal(lead.convertedOpportunityId, undefined);
  });

  it("aceita convertedOpportunityId opcional", () => {
    const lead = Lead.create({ organizationId: new UniqueEntityId(), name: "Fulano" }).getValue()!;
    const partyId = new UniqueEntityId();
    const opportunityId = new UniqueEntityId();
    lead.convert(partyId, opportunityId);

    assert.equal(lead.convertedOpportunityId!.equals(opportunityId), true);
  });

  it("dispara LeadConverted", () => {
    const lead = Lead.create({ organizationId: new UniqueEntityId(), name: "Fulano" }).getValue()!;
    lead.convert(new UniqueEntityId());

    const converted = lead.domainEvents.find((event) => event.eventName === "LeadConverted");
    assert.notEqual(converted, undefined);
  });

  it("rejeita converter um Lead já convertido — sem reversão", () => {
    const lead = Lead.create({ organizationId: new UniqueEntityId(), name: "Fulano" }).getValue()!;
    lead.convert(new UniqueEntityId());

    const result = lead.convert(new UniqueEntityId());
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "CONFLICT_ERROR");
  });
});
