import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option, InfrastructureError, ValidationError } from "@novaris/shared-kernel";
import type { InfrastructureError as InfrastructureErrorType, Result as ResultType } from "@novaris/shared-kernel";
import { AuthorizationDomainService } from "../../../../src/domain/services/authorization/authorization-domain-service.js";
import type { UserRepository } from "../../../../src/domain/repositories/user-repository.js";
import type { RoleRepository } from "../../../../src/domain/repositories/role-repository.js";
import { User } from "../../../../src/domain/aggregates/user/user.js";
import { Role } from "../../../../src/domain/aggregates/role/role.js";
import { Email } from "../../../../src/domain/value-objects/email.js";
import { Permission } from "../../../../src/domain/value-objects/permission.js";

/**
 * Fakes em memória — existem apenas para testar este Domain Service. Não são
 * entregáveis de produção, mesmo padrão já usado em ENG-0002.9/ENG-0002.10B.
 */
class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();
  failNextFindById = false;

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

function buildUser(): User {
  return User.create({
    organizationId: new UniqueEntityId(),
    email: Email.create("user@novaris.dev").getValue()!,
    createdBy: new UniqueEntityId(),
  }).getValue()!;
}

function buildRoleWithPermission(organizationId: UniqueEntityId, permissionCode: string): Role {
  const role = Role.create({
    organizationId,
    name: "Sales Manager",
    createdBy: new UniqueEntityId(),
  }).getValue()!;
  role.grantPermission(Permission.create(permissionCode).getValue()!, new UniqueEntityId());
  return role;
}

describe("AuthorizationDomainService — cenário autorizado", () => {
  it("devolve true quando um dos Roles do User possui a Permission", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const user = buildUser();
    const role = buildRoleWithPermission(user.organizationId, "crm.leads.read");
    user.assignRole(role.id, new UniqueEntityId());
    userRepository.seed(user);
    roleRepository.seed(role);

    const service = new AuthorizationDomainService(userRepository, roleRepository);
    const result = await service.execute({ userId: user.id, permissionCode: "crm.leads.read" });

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue(), true);
  });
});

describe("AuthorizationDomainService — cenário não autorizado", () => {
  it("devolve false quando nenhum Role do User possui a Permission", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const user = buildUser();
    const role = buildRoleWithPermission(user.organizationId, "crm.leads.read");
    user.assignRole(role.id, new UniqueEntityId());
    userRepository.seed(user);
    roleRepository.seed(role);

    const service = new AuthorizationDomainService(userRepository, roleRepository);
    const result = await service.execute({ userId: user.id, permissionCode: "financial.invoice.delete" });

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue(), false);
  });
});

describe("AuthorizationDomainService — ausência de User", () => {
  it("devolve false (não erro) quando o userId não corresponde a nenhum User", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const service = new AuthorizationDomainService(userRepository, roleRepository);

    const result = await service.execute({ userId: new UniqueEntityId(), permissionCode: "crm.leads.read" });

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue(), false);
  });
});

describe("AuthorizationDomainService — ausência de Role", () => {
  it("devolve false quando o User não tem nenhum roleId", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const user = buildUser();
    userRepository.seed(user);

    const service = new AuthorizationDomainService(userRepository, roleRepository);
    const result = await service.execute({ userId: user.id, permissionCode: "crm.leads.read" });

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue(), false);
  });

  it("devolve false quando o roleId referenciado é órfão (Role não existe)", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const user = buildUser();
    user.assignRole(new UniqueEntityId(), new UniqueEntityId());
    userRepository.seed(user);

    const service = new AuthorizationDomainService(userRepository, roleRepository);
    const result = await service.execute({ userId: user.id, permissionCode: "crm.leads.read" });

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue(), false);
  });
});

describe("AuthorizationDomainService — permissionCode malformado", () => {
  it("devolve Result.fail com ValidationError quando o código não segue o formato oficial", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const service = new AuthorizationDomainService(userRepository, roleRepository);

    const result = await service.execute({ userId: new UniqueEntityId(), permissionCode: "invalido" });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof ValidationError, true);
  });
});

describe("AuthorizationDomainService — falha de infraestrutura", () => {
  it("propaga InfrastructureError quando o UserRepository falha", async () => {
    const userRepository = new InMemoryUserRepository();
    userRepository.failNextFindById = true;
    const roleRepository = new InMemoryRoleRepository();
    const service = new AuthorizationDomainService(userRepository, roleRepository);

    const result = await service.execute({ userId: new UniqueEntityId(), permissionCode: "crm.leads.read" });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof InfrastructureError, true);
  });

  it("propaga InfrastructureError quando o RoleRepository falha", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    roleRepository.failNextFindById = true;
    const user = buildUser();
    user.assignRole(new UniqueEntityId(), new UniqueEntityId());
    userRepository.seed(user);

    const service = new AuthorizationDomainService(userRepository, roleRepository);
    const result = await service.execute({ userId: user.id, permissionCode: "crm.leads.read" });

    assert.equal(result.isFailure, true);
    assert.equal(result.getError() instanceof InfrastructureError, true);
  });
});

describe("AuthorizationDomainService — nunca lança exceção", () => {
  it("nunca lança exceção, mesmo com entrada inválida", async () => {
    const userRepository = new InMemoryUserRepository();
    const roleRepository = new InMemoryRoleRepository();
    const service = new AuthorizationDomainService(userRepository, roleRepository);

    await assert.doesNotReject(() =>
      service.execute({ userId: new UniqueEntityId(), permissionCode: "" }),
    );
  });
});
