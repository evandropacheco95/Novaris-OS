import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, ConflictError } from "@novaris/shared-kernel";
import { User } from "../../../../src/domain/aggregates/user/user.js";
import { Email } from "../../../../src/domain/value-objects/email.js";
import { UserCreated } from "../../../../src/domain/domain-events/user-created.js";
import { UserInvited } from "../../../../src/domain/domain-events/user-invited.js";
import { UserActivated } from "../../../../src/domain/domain-events/user-activated.js";
import { UserDisabled } from "../../../../src/domain/domain-events/user-disabled.js";
import { RoleAssignedToUser } from "../../../../src/domain/domain-events/role-assigned-to-user.js";
import { RoleRevokedFromUser } from "../../../../src/domain/domain-events/role-revoked-from-user.js";

function buildCreateInput() {
  return {
    organizationId: new UniqueEntityId(),
    email: Email.create("user@novaris.dev").getValue()!,
    createdBy: new UniqueEntityId(),
  };
}

describe("User.create", () => {
  it("cria um User válido no status \"created\"", () => {
    const result = User.create(buildCreateInput());
    assert.equal(result.isSuccess, true);
    const user = result.getValue()!;
    assert.equal(user.status, "created");
    assert.equal(user.roleIds.length, 0);
    assert.equal(user.version, 1);
    assert.deepEqual(user.metadata, {});
  });

  it("preenche createdBy/updatedBy com o mesmo valor na criação", () => {
    const input = buildCreateInput();
    const user = User.create(input).getValue()!;
    assert.equal(user.createdBy.equals(input.createdBy), true);
    assert.equal(user.updatedBy.equals(input.createdBy), true);
  });

  it("aceita metadata explícita quando fornecida", () => {
    const input = { ...buildCreateInput(), metadata: { source: "invite-link" } };
    const user = User.create(input).getValue()!;
    assert.deepEqual(user.metadata, { source: "invite-link" });
  });

  it("dispara exatamente um UserCreated com aggregateId igual ao id do User", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    assert.equal(user.domainEvents.length, 1);
    const event = user.domainEvents[0]!;
    assert.equal(event instanceof UserCreated, true);
    assert.equal(event.aggregateId.equals(user.id), true);
    assert.equal(event.eventName, "UserCreated");
  });

  it("nunca lança exceção", () => {
    assert.doesNotThrow(() => User.create(buildCreateInput()));
  });
});

describe("User.reconstitute", () => {
  it("recria um User sem validar e sem disparar eventos", () => {
    const created = User.create(buildCreateInput()).getValue()!;
    const id = new UniqueEntityId();
    const reconstituted = User.reconstitute(
      {
        organizationId: created.organizationId,
        email: created.email,
        status: "active",
        roleIds: [],
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
        createdBy: created.createdBy,
        updatedBy: created.updatedBy,
        version: 3,
        metadata: {},
      },
      id,
    );
    assert.equal(reconstituted.id.equals(id), true);
    assert.equal(reconstituted.status, "active");
    assert.equal(reconstituted.version, 3);
    assert.equal(reconstituted.domainEvents.length, 0);
  });
});

describe("User.invite", () => {
  it("transiciona \"created\" para \"invited\" e dispara UserInvited", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    const actor = new UniqueEntityId();
    const result = user.invite(actor);
    assert.equal(result.isSuccess, true);
    assert.equal(user.status, "invited");
    assert.equal(user.updatedBy.equals(actor), true);
    assert.equal(user.version, 2);
    assert.equal(user.domainEvents.some((event) => event instanceof UserInvited), true);
  });

  it("rejeita convite de um usuário que não está em \"created\"", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    user.invite(new UniqueEntityId());
    const result = user.invite(new UniqueEntityId());
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ConflictError, true);
  });
});

describe("User.activate", () => {
  it("ativa a partir de \"created\" e dispara UserActivated", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    const result = user.activate(new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(user.status, "active");
    assert.equal(user.domainEvents.some((event) => event instanceof UserActivated), true);
  });

  it("ativa a partir de \"invited\"", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    user.invite(new UniqueEntityId());
    const result = user.activate(new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(user.status, "active");
  });

  it("rejeita ativação de um usuário já \"active\"", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    user.activate(new UniqueEntityId());
    const result = user.activate(new UniqueEntityId());
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ConflictError, true);
  });

  it("rejeita ativação de um usuário \"disabled\"", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    user.activate(new UniqueEntityId());
    user.disable(new UniqueEntityId());
    const result = user.activate(new UniqueEntityId());
    assert.equal(result.isFailure, true);
  });
});

describe("User.disable", () => {
  it("desativa a partir de \"active\" e dispara UserDisabled", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    user.activate(new UniqueEntityId());
    const result = user.disable(new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(user.status, "disabled");
    assert.equal(user.domainEvents.some((event) => event instanceof UserDisabled), true);
  });

  it("rejeita desativação de um usuário que nunca foi ativado", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    const result = user.disable(new UniqueEntityId());
    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ConflictError, true);
  });

  it("não permite reativação — \"disabled\" é terminal nesta missão", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    user.activate(new UniqueEntityId());
    user.disable(new UniqueEntityId());
    const result = user.activate(new UniqueEntityId());
    assert.equal(result.isFailure, true);
  });
});

describe("User.assignRole / User.revokeRole", () => {
  it("atribui um Role e dispara RoleAssignedToUser", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    const roleId = new UniqueEntityId();
    const result = user.assignRole(roleId, new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(user.roleIds.length, 1);
    assert.equal(user.roleIds[0]!.equals(roleId), true);
    assert.equal(user.domainEvents.some((event) => event instanceof RoleAssignedToUser), true);
  });

  it("revoga um Role atribuído e dispara RoleRevokedFromUser", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    const roleId = new UniqueEntityId();
    user.assignRole(roleId, new UniqueEntityId());
    const result = user.revokeRole(roleId, new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(user.roleIds.length, 0);
    assert.equal(user.domainEvents.some((event) => event instanceof RoleRevokedFromUser), true);
  });

  it("revogar um roleId não atribuído é idempotente, não falha", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    const result = user.revokeRole(new UniqueEntityId(), new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(user.roleIds.length, 0);
  });

  it("roleIds nunca embute o objeto Role — só UniqueEntityId", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    const roleId = new UniqueEntityId();
    user.assignRole(roleId, new UniqueEntityId());
    assert.equal(user.roleIds[0] instanceof UniqueEntityId, true);
  });
});

describe("User — Auditable/Versionable/HasMetadata", () => {
  it("incrementa version e atualiza updatedAt/updatedBy a cada mutação bem-sucedida", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    const firstUpdatedAt = user.updatedAt;
    const actor = new UniqueEntityId();
    user.activate(actor);
    assert.equal(user.version, 2);
    assert.equal(user.updatedBy.equals(actor), true);
    assert.equal(user.updatedAt.getTime() >= firstUpdatedAt.getTime(), true);
  });

  it("não incrementa version quando uma mutação falha", () => {
    const user = User.create(buildCreateInput()).getValue()!;
    user.disable(new UniqueEntityId());
    assert.equal(user.version, 1);
  });
});
