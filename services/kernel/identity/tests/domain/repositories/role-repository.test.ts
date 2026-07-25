import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option } from "@novaris/shared-kernel";
import type { InfrastructureError, ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { RoleRepository } from "../../../src/domain/repositories/role-repository.js";
import { Role } from "../../../src/domain/aggregates/role/role.js";

/**
 * Fake em memória — existe apenas para testar o contrato deste arquivo.
 * Não é entregável da missão (nenhuma implementação concreta de produção,
 * nenhuma Infrastructure Layer), mesmo padrão de fixture já usado em
 * packages/shared-kernel/src/core/repositories/repository.test.ts (ENG-0001.7).
 */
class InMemoryRoleRepository implements RoleRepository {
  private readonly store = new Map<string, Role>();

  async findById(id: UniqueEntityId): Promise<Result<Option<Role>, InfrastructureError>> {
    const found = this.store.get(id.toValue());
    return Result.ok(found ? Option.some(found) : Option.none<Role>());
  }

  async findAll(): Promise<Result<Role[], InfrastructureError>> {
    return Result.ok(Array.from(this.store.values()));
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.store.has(id.toValue()));
  }

  async save(entity: Role): Promise<Result<void, InfrastructureError>> {
    this.store.set(entity.id.toValue(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.store.delete(id.toValue());
    return Result.ok(undefined);
  }
}

function buildRole(): Role {
  return Role.create({
    organizationId: new UniqueEntityId(),
    name: "Sales Manager",
    createdBy: new UniqueEntityId(),
  }).getValue()!;
}

describe("RoleRepository — composição de ReadRepository<Role> + WriteRepository<Role>", () => {
  it("uma implementação de RoleRepository é atribuível a ReadRepository<Role> e WriteRepository<Role> isoladamente", () => {
    const repo = new InMemoryRoleRepository();
    const asRead: ReadRepository<Role> = repo;
    const asWrite: WriteRepository<Role> = repo;
    assert.notEqual(asRead, undefined);
    assert.notEqual(asWrite, undefined);
  });

  it("findById devolve Option.none quando o Role não existe", async () => {
    const repo = new InMemoryRoleRepository();
    const result = await repo.findById(new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()?.isNone, true);
  });

  it("findById devolve Option.some com o Role correto após save", async () => {
    const repo = new InMemoryRoleRepository();
    const role = buildRole();
    await repo.save(role);

    const result = await repo.findById(role.id);
    const option = result.getValue();
    assert.equal(option?.isSome, true);
    assert.equal(option?.getOrElse(role).id.equals(role.id), true);
  });

  it("exists reflete o estado de save/delete", async () => {
    const repo = new InMemoryRoleRepository();
    const role = buildRole();

    assert.equal((await repo.exists(role.id)).getValue(), false);
    await repo.save(role);
    assert.equal((await repo.exists(role.id)).getValue(), true);
    await repo.delete(role.id);
    assert.equal((await repo.exists(role.id)).getValue(), false);
  });

  it("findAll devolve todos os Roles salvos", async () => {
    const repo = new InMemoryRoleRepository();
    await repo.save(buildRole());
    await repo.save(buildRole());

    const result = await repo.findAll();
    assert.equal(result.getValue()?.length, 2);
  });
});
