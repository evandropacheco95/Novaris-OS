import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Entity } from "../core/entities/entity.js";
import { AggregateRoot } from "../core/aggregate-roots/aggregate-root.js";
import { UniqueEntityId } from "../core/entities/unique-entity-id.js";
import type { HasIdentity } from "./has-identity.js";
import type { Timestamped } from "./timestamped.js";
import type { Versionable } from "./versionable.js";
import type { HasMetadata } from "./has-metadata.js";
import type { Auditable } from "./auditable.js";

interface EntityProps {
  name: string;
}

class TestEntity extends Entity<EntityProps> {
  constructor(props: EntityProps, id?: UniqueEntityId) {
    super(props, id);
  }
}

interface OrganizationMetadata extends Record<string, unknown> {
  source: string;
}

interface OrganizationProps {
  name: string;
}

class TestOrganization
  extends AggregateRoot<OrganizationProps>
  implements Auditable, Versionable, HasMetadata<OrganizationMetadata>
{
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: UniqueEntityId;
  readonly updatedBy: UniqueEntityId;
  readonly version: number;
  readonly metadata: OrganizationMetadata;

  constructor(props: OrganizationProps, id?: UniqueEntityId) {
    super(props, id);
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.createdBy = new UniqueEntityId("system");
    this.updatedBy = new UniqueEntityId("system");
    this.version = 1;
    this.metadata = { source: "test" };
  }
}

describe("HasIdentity — compatibilidade com Entity e AggregateRoot", () => {
  it("uma Entity concreta já satisfaz HasIdentity via seu getter id, sem alterações", () => {
    const entity = new TestEntity({ name: "A" });
    const asHasIdentity: HasIdentity = entity;
    assert.equal(asHasIdentity.id instanceof UniqueEntityId, true);
  });

  it("um AggregateRoot concreto também satisfaz HasIdentity via herança de Entity", () => {
    const aggregate = new TestOrganization({ name: "NOVARIS" });
    const asHasIdentity: HasIdentity = aggregate;
    assert.equal(asHasIdentity.id.equals(aggregate.id), true);
  });
});

describe("Timestamped e Auditable — herança entre contratos", () => {
  it("Auditable estende Timestamped — um valor Auditable satisfaz Timestamped", () => {
    const aggregate = new TestOrganization({ name: "NOVARIS" });
    const asAuditable: Auditable = aggregate;
    const asTimestamped: Timestamped = asAuditable;

    assert.equal(asTimestamped.createdAt instanceof Date, true);
    assert.equal(asTimestamped.updatedAt instanceof Date, true);
  });

  it("Auditable adiciona createdBy/updatedBy além dos campos herdados de Timestamped", () => {
    const aggregate = new TestOrganization({ name: "NOVARIS" });
    assert.equal(aggregate.createdBy instanceof UniqueEntityId, true);
    assert.equal(aggregate.updatedBy instanceof UniqueEntityId, true);
  });
});

describe("Versionable — tipagem", () => {
  it("version é explicitamente tipado como number", () => {
    const aggregate = new TestOrganization({ name: "NOVARIS" });
    const asVersionable: Versionable = aggregate;
    assert.equal(typeof asVersionable.version, "number");
    assert.equal(asVersionable.version, 1);
  });
});

describe("HasMetadata — Generics", () => {
  it("aceita uma forma de metadado customizada via generic", () => {
    const aggregate = new TestOrganization({ name: "NOVARIS" });
    const asHasMetadata: HasMetadata<OrganizationMetadata> = aggregate;
    assert.equal(asHasMetadata.metadata.source, "test");
  });

  it("o default genérico (Record<string, unknown>) também é válido sem parâmetro explícito", () => {
    const generic: HasMetadata = { metadata: { anything: 42 } };
    assert.equal(generic.metadata.anything, 42);
  });
});

describe("Compatibilidade combinada — AggregateRoot implementando os 5 contratos ao mesmo tempo", () => {
  it("uma única classe concreta compõe HasIdentity + Auditable + Versionable + HasMetadata sem conflito", () => {
    const aggregate = new TestOrganization({ name: "NOVARIS" });
    assert.equal(aggregate instanceof AggregateRoot, true);
    assert.equal(aggregate.id instanceof UniqueEntityId, true);
    assert.equal(aggregate.createdAt instanceof Date, true);
    assert.equal(aggregate.version, 1);
    assert.equal(aggregate.metadata.source, "test");
  });
});
