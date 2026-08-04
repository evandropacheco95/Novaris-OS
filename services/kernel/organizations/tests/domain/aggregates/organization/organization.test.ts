import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, ValidationError } from "@novaris/shared-kernel";
import { Organization } from "../../../../src/domain/aggregates/organization/organization.js";
import { OrganizationCreated } from "../../../../src/domain/domain-events/organization-created.js";
import type { OrganizationAddress } from "../../../../src/domain/aggregates/organization/organization.js";

const ADDRESS: OrganizationAddress = {
  street: "Av. Paulista",
  number: "1000",
  district: "Bela Vista",
  city: "São Paulo",
  state: "SP",
  zipCode: "01310-100",
  country: "BR",
};

function buildCreateInput() {
  return {
    slug: "novaris",
    name: "NOVARIS Tecnologia",
    legalName: "NOVARIS Tecnologia LTDA",
    document: "00.000.000/0001-00",
    address: ADDRESS,
    status: "trial" as const,
    plan: "starter" as const,
    billingStatus: "trialing" as const,
  };
}

describe("Organization.create", () => {
  it("cria uma Organization válida", () => {
    const result = Organization.create(buildCreateInput());
    assert.equal(result.isSuccess, true);
    const organization = result.getValue()!;
    assert.equal(organization.slug, "novaris");
    assert.equal(organization.name, "NOVARIS Tecnologia");
    assert.equal(organization.status, "trial");
    assert.deepEqual(organization.metadata, {});
  });

  it("aceita metadata explícita quando fornecida", () => {
    const input = { ...buildCreateInput(), metadata: { source: "signup" } };
    const organization = Organization.create(input).getValue()!;
    assert.deepEqual(organization.metadata, { source: "signup" });
  });

  it("rejeita status fora da união conhecida", () => {
    const result = Organization.create({ ...buildCreateInput(), status: "invalido" as never });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("rejeita name vazio", () => {
    const result = Organization.create({ ...buildCreateInput(), name: "   " });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("rejeita slug vazio", () => {
    const result = Organization.create({ ...buildCreateInput(), slug: "" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("dispara exatamente um OrganizationCreated com aggregateId igual ao id da Organization", () => {
    const organization = Organization.create(buildCreateInput()).getValue()!;
    assert.equal(organization.domainEvents.length, 1);
    const event = organization.domainEvents[0]!;
    assert.equal(event instanceof OrganizationCreated, true);
    assert.equal(event.aggregateId.equals(organization.id), true);
    assert.equal(event.eventName, "OrganizationCreated");
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Organization.create({ ...buildCreateInput(), name: "" }));
  });
});

describe("Organization.reconstitute", () => {
  it("recria uma Organization sem validar e sem disparar eventos", () => {
    const created = Organization.create(buildCreateInput()).getValue()!;
    const id = new UniqueEntityId();
    const reconstituted = Organization.reconstitute(
      {
        slug: created.slug,
        name: created.name,
        legalName: created.legalName,
        document: created.document,
        address: created.address,
        status: "active",
        plan: "starter",
        billingStatus: "trialing",
        metadata: {},
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      id,
    );
    assert.equal(reconstituted.id.equals(id), true);
    assert.equal(reconstituted.status, "active");
    assert.equal(reconstituted.domainEvents.length, 0);
  });
});

describe("Organization.updateProfile", () => {
  it("atualiza name/legalName/document/address quando fornecidos", () => {
    const organization = Organization.create(buildCreateInput()).getValue()!;
    const newAddress: OrganizationAddress = { ...ADDRESS, city: "Rio de Janeiro" };

    const result = organization.updateProfile({
      name: "NOVARIS Tech",
      legalName: "NOVARIS Tech LTDA",
      document: "11.111.111/0001-11",
      address: newAddress,
    });

    assert.equal(result.isSuccess, true);
    assert.equal(organization.name, "NOVARIS Tech");
    assert.equal(organization.legalName, "NOVARIS Tech LTDA");
    assert.equal(organization.document, "11.111.111/0001-11");
    assert.equal(organization.address.city, "Rio de Janeiro");
  });

  it("atualiza só os campos fornecidos, preservando os demais", () => {
    const organization = Organization.create(buildCreateInput()).getValue()!;
    organization.updateProfile({ name: "Novo Nome" });

    assert.equal(organization.name, "Novo Nome");
    assert.equal(organization.legalName, "NOVARIS Tecnologia LTDA");
  });

  it("rejeita name vazio", () => {
    const organization = Organization.create(buildCreateInput()).getValue()!;
    const result = organization.updateProfile({ name: "" });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("atualiza updatedAt em caso de sucesso", () => {
    const organization = Organization.create(buildCreateInput()).getValue()!;
    const firstUpdatedAt = organization.updatedAt;
    organization.updateProfile({ name: "Outro Nome" });
    assert.equal(organization.updatedAt.getTime() >= firstUpdatedAt.getTime(), true);
  });

  it("nunca dispara nenhum Domain Event — OrganizationUpdated não é aprovado", () => {
    const organization = Organization.create(buildCreateInput()).getValue()!;
    organization.updateProfile({ name: "Outro Nome" });
    assert.equal(organization.domainEvents.length, 1);
    assert.equal(organization.domainEvents[0] instanceof OrganizationCreated, true);
  });

  it("nunca lança exceção", () => {
    const organization = Organization.create(buildCreateInput()).getValue()!;
    assert.doesNotThrow(() => organization.updateProfile({ name: "" }));
  });
});

describe("Organization.create — plan/billingStatus/trialEnd/maxUsers/enabledDomains (ENG-0164)", () => {
  it("aceita plan/billingStatus válidos, sem limite por padrão", () => {
    const organization = Organization.create(buildCreateInput()).getValue()!;
    assert.equal(organization.plan, "starter");
    assert.equal(organization.billingStatus, "trialing");
    assert.equal(organization.maxUsers, undefined);
    assert.equal(organization.enabledDomains, undefined);
    assert.equal(organization.trialEnd, undefined);
  });

  it("rejeita plan fora da união conhecida", () => {
    const result = Organization.create({ ...buildCreateInput(), plan: "inexistente" as never });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("rejeita billingStatus fora da união conhecida", () => {
    const result = Organization.create({ ...buildCreateInput(), billingStatus: "inexistente" as never });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("rejeita maxUsers menor que 1 quando fornecido", () => {
    const result = Organization.create({ ...buildCreateInput(), maxUsers: 0 });
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });

  it("aceita maxUsers/enabledDomains/trialEnd explícitos", () => {
    const trialEnd = new Date("2026-12-31T00:00:00Z");
    const organization = Organization.create({
      ...buildCreateInput(),
      maxUsers: 5,
      enabledDomains: ["Sales", "Relationship"],
      trialEnd,
    }).getValue()!;
    assert.equal(organization.maxUsers, 5);
    assert.deepEqual(organization.enabledDomains, ["Sales", "Relationship"]);
    assert.equal(organization.trialEnd?.getTime(), trialEnd.getTime());
  });
});

describe("Organization.updatePlan (ENG-0164)", () => {
  it("atualiza plan/billingStatus quando fornecidos", () => {
    const organization = Organization.create(buildCreateInput()).getValue()!;
    const result = organization.updatePlan({ plan: "enterprise", billingStatus: "active" });

    assert.equal(result.isSuccess, true);
    assert.equal(organization.plan, "enterprise");
    assert.equal(organization.billingStatus, "active");
  });

  it("atualiza só os campos fornecidos, preservando os demais", () => {
    const organization = Organization.create({ ...buildCreateInput(), maxUsers: 3 }).getValue()!;
    organization.updatePlan({ plan: "professional" });

    assert.equal(organization.plan, "professional");
    assert.equal(organization.maxUsers, 3);
  });

  it("null remove o limite explicitamente (distinto de undefined = não mexer)", () => {
    const organization = Organization.create({ ...buildCreateInput(), maxUsers: 3, enabledDomains: ["Sales"] }).getValue()!;

    organization.updatePlan({ maxUsers: null, enabledDomains: null });

    assert.equal(organization.maxUsers, undefined);
    assert.equal(organization.enabledDomains, undefined);
  });

  it("undefined não altera o campo (omitido do input)", () => {
    const organization = Organization.create({ ...buildCreateInput(), maxUsers: 3 }).getValue()!;
    organization.updatePlan({ plan: "enterprise" });
    assert.equal(organization.maxUsers, 3);
  });

  it("rejeita plan/billingStatus/maxUsers inválidos", () => {
    const organization = Organization.create(buildCreateInput()).getValue()!;
    assert.equal(organization.updatePlan({ plan: "invalido" as never }).isFailure, true);
    assert.equal(organization.updatePlan({ billingStatus: "invalido" as never }).isFailure, true);
    assert.equal(organization.updatePlan({ maxUsers: 0 }).isFailure, true);
  });

  it("nunca dispara Domain Event — mesmo critério de updateProfile()", () => {
    const organization = Organization.create(buildCreateInput()).getValue()!;
    organization.updatePlan({ plan: "enterprise" });
    assert.equal(organization.domainEvents.length, 1);
    assert.equal(organization.domainEvents[0] instanceof OrganizationCreated, true);
  });
});
