import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option, InfrastructureError, NotFoundError, BusinessRuleError } from "@novaris/shared-kernel";
import type { InfrastructureError as InfrastructureErrorType, Result as ResultType } from "@novaris/shared-kernel";
import { RoleAssignmentDomainService } from "../../../../src/domain/services/role-assignment/role-assignment-domain-service.js";
import type { UserRepository } from "../../../../src/domain/repositories/user-repository.js";
import type { RoleRepository } from "../../../../src/domain/repositories/role-repository.js";
import { User } from "../../../../src/domain/aggregates/user/user.js";
import { Role } from "../../../../src/domain/aggregates/role/role.js";
import { Email } from "../../../../src/domain/value-objects/email.js";

/**
 * Fakes em memória — existem apenas para testar este Domain Service. Não são
 * entregáveis de produção, mesmo padrão já usado em ENG-0002.9/10B/10C.
 */
class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();
  failNextFindById = false;
  failNextSave = false;

  seed(user: User): void {
    this.store.set(user.id.toValue(), user);
  }

  async findById(id: UniqueEntityId): Promise<ResultType<Option<User>, InfrastructureErrorType>> {
    if (this.failNextFindById) {
      return Result.fail(new InfrastructureError("falha ao consultar usuário"));
    }
    const found = this.store.get(id.toValue());
    return Result.ok(found ? Option.some(found) : Option.none<User>());
  }

  async findAll(): Promise<ResultType<User[], InfrastructureErrorType>> {
    return Result.ok(Array.from(this.store.values()));
  }

  async exists(id: UniqueEntityId): Promise<ResultType<boolean, InfrastructureErrorType>> {
    return Result.ok(this.store.has(id.toValue()));
  }

  async save(entity: User): Promise<ResultType<void, InfrastructureErrorType>> {
    if (this.failNextSave) {
      return Result.fail(new InfrastructureError("falha ao persistir usuário"));
    }
    this.store.set(entity.id.toValue(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<ResultType<void, InfrastructureErrorType>> {
    this.store.delete(id.toValue());
    return Result.ok(undefined);
  }
}

class InMemoryRoleRepository implements RoleRepository {
  private readonly store = new Map<string, Role>();
  failNextFindById = false;

  seed(role: Role): void {
    this.store.set(role.id.toValue(), role);
  }

  async findById(id: UniqueEntityId): Promise<ResultType<Option<Role>, InfrastructureErrorType>> {
    if (this.failNextFindById) {
      return Result.fail(new InfrastructureError("falha ao consultar papel"));
    }
    const found = this.store.get(id.toValue());
    return Result.ok(found ? Option.some(found) : Option.none<Role>());
  }

  async findAll(): Promise<ResultType<Role[], InfrastructureErrorType>> {
    return Result.ok(Array.from(this.store.values()));
  }

  async exists(id: UniqueEntityId): Promise<ResultType<boolean, InfrastructureErrorType>> {
    return Result.ok(this.store.has(id.toValue()));
  }

  async save(entity: Role): Promise<ResultType<void, InfrastructureErrorType>> {
    this.store.set(entity.id.toValue(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<ResultType<void, InfrastructureErrorType>> {
    this.store.delete(id.toValue());
    return Result.ok(undefined);
  }
}

function buildUser(organizationId: UniqueEntityId): User {
  return User.create({
    organizationId,
    email: Email.create("user@novaris.dev").getValue()!,
    createdBy: new UniqueEntityId(),
  }).getValue()!;
}

function buildRole(organizationId: UniqueEntityId): Role {
  return Role.create({
    organizationId,
    name: "Sales Manager",
    createdBy: new UniqueEntityId(),
  }).getValue()!;
}

describe("RoleAssignmentDomainService — atribuição válida", () => {
  it("atribui o Role ao User quando ambos pertencem à mesma Organization", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const organizationId = new UniqueEntityId();
    const user = buildUser(organizationId);
    const role = buildRole(organizationId);
    userRepository.seed(user);
    roleRepository.seed(role);

    const service = new RoleAssignmentDomainService(userRepository, roleRepository);
    const result = await service.execute({ userId: user.id, roleId: role.id, assignedBy: new UniqueEntityId() });

    assert.equal(result.isSuccess, true);
    assert.equal(user.roleIds.length, 1);
    assert.equal(user.roleIds[0]!.equals(role.id), true);
  });

  it("persiste o User atualizado via UserRepository.save", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const organizationId = new UniqueEntityId();
    const user = buildUser(organizationId);
    const role = buildRole(organizationId);
    userRepository.seed(user);
    roleRepository.seed(role);

    const service = new RoleAssignmentDomainService(userRepository, roleRepository);
    await service.execute({ userId: user.id, roleId: role.id, assignedBy: new UniqueEntityId() });

    const persisted = (await userRepository.findById(user.id)).getValue()!.getOrElse(user);
    assert.equal(persisted.roleIds.length, 1);
  });
});

describe("RoleAssignmentDomainService — User inexistente", () => {
  it("devolve NotFoundError quando o userId não corresponde a nenhum User", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const role = buildRole(new UniqueEntityId());
    roleRepository.seed(role);

    const service = new RoleAssignmentDomainService(userRepository, roleRepository);
    const result = await service.execute({
      userId: new UniqueEntityId(),
      roleId: role.id,
      assignedBy: new UniqueEntityId(),
    });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof NotFoundError, true);
  });
});

describe("RoleAssignmentDomainService — Role inexistente", () => {
  it("devolve NotFoundError quando o roleId não corresponde a nenhum Role", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const user = buildUser(new UniqueEntityId());
    userRepository.seed(user);

    const service = new RoleAssignmentDomainService(userRepository, roleRepository);
    const result = await service.execute({
      userId: user.id,
      roleId: new UniqueEntityId(),
      assignedBy: new UniqueEntityId(),
    });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof NotFoundError, true);
  });
});

describe("RoleAssignmentDomainService — Organization incompatível", () => {
  it("devolve BusinessRuleError quando o Role pertence a outra Organization", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const user = buildUser(new UniqueEntityId());
    const role = buildRole(new UniqueEntityId());
    userRepository.seed(user);
    roleRepository.seed(role);

    const service = new RoleAssignmentDomainService(userRepository, roleRepository);
    const result = await service.execute({ userId: user.id, roleId: role.id, assignedBy: new UniqueEntityId() });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof BusinessRuleError, true);
    assert.equal(user.roleIds.length, 0);
  });
});

describe("RoleAssignmentDomainService — Role duplicada", () => {
  it("atribuir o mesmo Role duas vezes não falha — comportamento herdado de User.assignRole, não alterado por esta missão", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const organizationId = new UniqueEntityId();
    const user = buildUser(organizationId);
    const role = buildRole(organizationId);
    userRepository.seed(user);
    roleRepository.seed(role);

    const service = new RoleAssignmentDomainService(userRepository, roleRepository);
    const first = await service.execute({ userId: user.id, roleId: role.id, assignedBy: new UniqueEntityId() });
    const second = await service.execute({ userId: user.id, roleId: role.id, assignedBy: new UniqueEntityId() });

    assert.equal(first.isSuccess, true);
    assert.equal(second.isSuccess, true);
    assert.equal(user.roleIds.length, 2);
  });
});

describe("RoleAssignmentDomainService — falha de persistência", () => {
  it("propaga InfrastructureError quando o UserRepository.findById falha", async () => {
    const userRepository = new InMemoryUserRepository();
    userRepository.failNextFindById = true;
    const roleRepository = new InMemoryRoleRepository();

    const service = new RoleAssignmentDomainService(userRepository, roleRepository);
    const result = await service.execute({
      userId: new UniqueEntityId(),
      roleId: new UniqueEntityId(),
      assignedBy: new UniqueEntityId(),
    });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof InfrastructureError, true);
  });

  it("propaga InfrastructureError quando o RoleRepository.findById falha", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    roleRepository.failNextFindById = true;
    const user = buildUser(new UniqueEntityId());
    userRepository.seed(user);

    const service = new RoleAssignmentDomainService(userRepository, roleRepository);
    const result = await service.execute({
      userId: user.id,
      roleId: new UniqueEntityId(),
      assignedBy: new UniqueEntityId(),
    });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof InfrastructureError, true);
  });

  it("propaga InfrastructureError quando o UserRepository.save falha", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const organizationId = new UniqueEntityId();
    const user = buildUser(organizationId);
    const role = buildRole(organizationId);
    userRepository.seed(user);
    roleRepository.seed(role);
    userRepository.failNextSave = true;

    const service = new RoleAssignmentDomainService(userRepository, roleRepository);
    const result = await service.execute({ userId: user.id, roleId: role.id, assignedBy: new UniqueEntityId() });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof InfrastructureError, true);
  });
});

describe("RoleAssignmentDomainService — nunca lança exceção", () => {
  it("nunca lança exceção, mesmo com entrada inválida", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const service = new RoleAssignmentDomainService(userRepository, roleRepository);

    await assert.doesNotReject(() =>
      service.execute({ userId: new UniqueEntityId(), roleId: new UniqueEntityId(), assignedBy: new UniqueEntityId() }),
    );
  });
});
