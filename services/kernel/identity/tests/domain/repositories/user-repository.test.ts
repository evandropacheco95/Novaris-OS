import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option } from "@novaris/shared-kernel";
import type { InfrastructureError, ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { UserRepository } from "../../../src/domain/repositories/user-repository.js";
import { User } from "../../../src/domain/aggregates/user/user.js";
import { Email } from "../../../src/domain/value-objects/email.js";

/**
 * Fake em memória — existe apenas para testar o contrato deste arquivo.
 * Não é entregável da missão (nenhuma implementação concreta de produção,
 * nenhuma Infrastructure Layer), mesmo padrão de fixture já usado em
 * packages/shared-kernel/src/core/repositories/repository.test.ts (ENG-0001.7).
 */
class InMemoryUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();

  async findById(id: UniqueEntityId): Promise<Result<Option<User>, InfrastructureError>> {
    const found = this.store.get(id.toValue());
    return Result.ok(found ? Option.some(found) : Option.none<User>());
  }

  async findAll(): Promise<Result<User[], InfrastructureError>> {
    return Result.ok(Array.from(this.store.values()));
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.store.has(id.toValue()));
  }

  async save(entity: User): Promise<Result<void, InfrastructureError>> {
    this.store.set(entity.id.toValue(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
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

describe("UserRepository — composição de ReadRepository<User> + WriteRepository<User>", () => {
  it("uma implementação de UserRepository é atribuível a ReadRepository<User> e WriteRepository<User> isoladamente", () => {
    const repo = new InMemoryUserRepository();
    const asRead: ReadRepository<User> = repo;
    const asWrite: WriteRepository<User> = repo;
    assert.notEqual(asRead, undefined);
    assert.notEqual(asWrite, undefined);
  });

  it("findById devolve Option.none quando o User não existe", async () => {
    const repo = new InMemoryUserRepository();
    const result = await repo.findById(new UniqueEntityId());
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()?.isNone, true);
  });

  it("findById devolve Option.some com o User correto após save", async () => {
    const repo = new InMemoryUserRepository();
    const user = buildUser();
    await repo.save(user);

    const result = await repo.findById(user.id);
    const option = result.getValue();
    assert.equal(option?.isSome, true);
    assert.equal(option?.getOrElse(user).id.equals(user.id), true);
  });

  it("exists reflete o estado de save/delete", async () => {
    const repo = new InMemoryUserRepository();
    const user = buildUser();

    assert.equal((await repo.exists(user.id)).getValue(), false);
    await repo.save(user);
    assert.equal((await repo.exists(user.id)).getValue(), true);
    await repo.delete(user.id);
    assert.equal((await repo.exists(user.id)).getValue(), false);
  });

  it("findAll devolve todos os Users salvos", async () => {
    const repo = new InMemoryUserRepository();
    await repo.save(buildUser());
    await repo.save(buildUser());

    const result = await repo.findAll();
    assert.equal(result.getValue()?.length, 2);
  });
});
