import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId } from "@novaris/shared-kernel";
import { Role } from "../../../../src/domain/aggregates/role/role.js";
import { Permission } from "../../../../src/domain/value-objects/permission.js";
import { RoleCreated } from "../../../../src/domain/domain-events/role-created.js";
import { PermissionGrantedToRole } from "../../../../src/domain/domain-events/permission-granted-to-role.js";
import { PermissionRevokedFromRole } from "../../../../src/domain/domain-events/permission-revoked-from-role.js";

function buildCreateInput() {
  return {
    organizationId: new UniqueEntityId(),
    name: "Sales Manager",
    createdBy: new UniqueEntityId(),
  };
}

describe("Role.create", () => {
  it("cria um Role válido, sem permissions", () => {
    const result = Role.create(buildCreateInput());
    assert.equal(result.isSuccess, true);
    const role = result.getValue()!;
    assert.equal(role.name, "Sales Manager");
    assert.equal(role.permissions.length, 0);
    assert.equal(role.version, 1);
  });

  it("preenche createdBy/updatedBy com o mesmo valor na criação", () => {
    const input = buildCreateInput();
    const role = Role.create(input).getValue()!;
    assert.equal(role.createdBy.equals(input.createdBy), true);
    assert.equal(role.updatedBy.equals(input.createdBy), true);
  });

  it("dispara exatamente um RoleCreated com aggregateId igual ao id do Role", () => {
    const role = Role.create(buildCreateInput()).getValue()!;
    assert.equal(role.domainEvents.length, 1);
    const event = role.domainEvents[0]!;
    assert.equal(event instanceof RoleCreated, true);
    assert.equal(event.aggregateId.equals(role.id), true);
    assert.equal(event.eventName, "RoleCreated");
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => Role.create(buildCreateInput()));
  });
});

describe("Role.reconstitute", () => {
  it("recria um Role sem validar e sem disparar eventos", () => {
    const created = Role.create(buildCreateInput()).getValue()!;
    const permission = Permission.create("crm.leads.read").getValue()!;
    const id = new UniqueEntityId();
    const reconstituted = Role.reconstitute(
      {
        organizationId: created.organizationId,
        name: created.name,
        permissions: [permission],
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        createdBy: created.createdBy,
        updatedBy: created.updatedBy,
        version: 5,
      },
      id,
    );
    assert.equal(reconstituted.id.equals(id), true);
    assert.equal(reconstituted.permissions.length, 1);
    assert.equal(reconstituted.version, 5);
    assert.equal(reconstituted.domainEvents.length, 0);
  });
});

describe("Role.grantPermission", () => {
  it("concede uma Permission e dispara PermissionGrantedToRole", () => {
    const role = Role.create(buildCreateInput()).getValue()!;
    const permission = Permission.create("crm.leads.read").getValue()!;
    const result = role.grantPermission(permission, new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(role.permissions.length, 1);
    assert.equal(role.permissions[0]!.equals(permission), true);
    assert.equal(role.domainEvents.some((event) => event instanceof PermissionGrantedToRole), true);
  });

  it("permissions embute o Value Object diretamente, por valor", () => {
    const role = Role.create(buildCreateInput()).getValue()!;
    const permission = Permission.create("crm.leads.read").getValue()!;
    role.grantPermission(permission, new UniqueEntityId());
    assert.equal(role.permissions[0] instanceof Permission, true);
  });

  it("incrementa version e atualiza updatedBy", () => {
    const role = Role.create(buildCreateInput()).getValue()!;
    const actor = new UniqueEntityId();
    role.grantPermission(Permission.create("crm.leads.read").getValue()!, actor);
    assert.equal(role.version, 2);
    assert.equal(role.updatedBy.equals(actor), true);
  });
});

describe("Role.revokePermission", () => {
  it("revoga uma Permission concedida e dispara PermissionRevokedFromRole", () => {
    const role = Role.create(buildCreateInput()).getValue()!;
    const permission = Permission.create("crm.leads.read").getValue()!;
    role.grantPermission(permission, new UniqueEntityId());
    const result = role.revokePermission(permission, new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(role.permissions.length, 0);
    assert.equal(role.domainEvents.some((event) => event instanceof PermissionRevokedFromRole), true);
  });

  it("revogar uma Permission não concedida é idempotente, não falha", () => {
    const role = Role.create(buildCreateInput()).getValue()!;
    const result = role.revokePermission(Permission.create("crm.leads.read").getValue()!, new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(role.permissions.length, 0);
  });

  it("revoga por igualdade de valor, não de identidade de instância", () => {
    const role = Role.create(buildCreateInput()).getValue()!;
    role.grantPermission(Permission.create("crm.leads.read").getValue()!, new UniqueEntityId());
    const equivalentPermission = Permission.create("crm.leads.read").getValue()!;
    const result = role.revokePermission(equivalentPermission, new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(role.permissions.length, 0);
  });
});

describe("Role — Auditable/Versionable", () => {
  it("incrementa version e atualiza updatedAt/updatedBy a cada mutação bem-sucedida", () => {
    const role = Role.create(buildCreateInput()).getValue()!;
    const firstUpdatedAt = role.updatedAt;
    const actor = new UniqueEntityId();
    role.grantPermission(Permission.create("financial.invoice.delete").getValue()!, actor);
    assert.equal(role.version, 2);
    assert.equal(role.updatedBy.equals(actor), true);
    assert.equal(role.updatedAt.getTime() >= firstUpdatedAt.getTime(), true);
  });
});

describe("Role — isolamento de Aggregate", () => {
  it("organizationId é referência por UniqueEntityId, nunca objeto embutido", () => {
    const role = Role.create(buildCreateInput()).getValue()!;
    assert.equal(role.organizationId instanceof UniqueEntityId, true);
  });
});
