import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AggregateRoot } from "../aggregate-roots/aggregate-root.js";
import { UniqueEntityId } from "../entities/unique-entity-id.js";
import { Result } from "../../types/result.js";
import { Option } from "../../types/option.js";
import type { InfrastructureError } from "../../errors/infrastructure-error.js";
import type { Repository } from "./repository.js";
import type { ReadRepository } from "./read-repository.js";
import type { WriteRepository } from "./write-repository.js";

interface TestProps {
  name: string;
}

class TestAggregate extends AggregateRoot<TestProps> {
  constructor(props: TestProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }
}

/**
 * Fake em memória — existe apenas para testar os contratos deste arquivo.
 * Não é entregável da missão (nenhuma implementação concreta de produção),
 * mesmo padrão de fixture já usado em entity.test.ts/aggregate-root.test.ts.
 */
class InMemoryTestRepository implements ReadRepository<TestAggregate>, WriteRepository<TestAggregate> {
  private readonly store = new Map<string, TestAggregate>();

  async findById(id: UniqueEntityId): Promise<Result<Option<TestAggregate>, InfrastructureError>> {
    const found = this.store.get(id.toValue());
    return Result.ok(found ? Option.some(found) : Option.none<TestAggregate>());
  }

  async findAll(): Promise<Result<TestAggregate[], InfrastructureError>> {
    return Result.ok(Array.from(this.store.values()));
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.store.has(id.toValue()));
  }

  async save(entity: TestAggregate): Promise<Result<void, InfrastructureError>> {
    this.store.set(entity.id.toValue(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.store.delete(id.toValue());
    return Result.ok(undefined);
  }
}

describe("Repository contracts — tipagem e herança entre interfaces", () => {
  it("uma implementação de ReadRepository+WriteRepository é atribuível a Repository<T>", () => {
    const repo = new InMemoryTestRepository();
    const asBase: Repository<TestAggregate> = repo;
    assert.notEqual(asBase, undefined);
  });

  it("uma implementação de ReadRepository+WriteRepository é atribuível a ReadRepository<T> e WriteRepository<T> isoladamente", () => {
    const repo = new InMemoryTestRepository();
    const asRead: ReadRepository<TestAggregate> = repo;
    const asWrite: WriteRepository<TestAggregate> = repo;
    assert.notEqual(asRead, undefined);
    assert.notEqual(asWrite, undefined);
  });
});

describe("ReadRepository — compatibilidade com Result e Option", () => {
  it("findById devolve Result<Option<T>, InfrastructureError> — None quando não existe", async () => {
    const repo = new InMemoryTestRepository();
    const result = await repo.findById(new UniqueEntityId("missing"));
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()?.isNone, true);
  });

  it("findById devolve Some quando o agregado existe", async () => {
    const repo = new InMemoryTestRepository();
    const aggregate = new TestAggregate({ name: "A" });
    await repo.save(aggregate);

    const result = await repo.findById(aggregate.id);
    assert.equal(result.isSuccess, true);
    const option = result.getValue();
    assert.equal(option?.isSome, true);
    assert.equal(option?.getOrElse(aggregate).name, "A");
  });

  it("findAll devolve Result<T[], InfrastructureError>", async () => {
    const repo = new InMemoryTestRepository();
    await repo.save(new TestAggregate({ name: "A" }));
    await repo.save(new TestAggregate({ name: "B" }));

    const result = await repo.findAll();
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()?.length, 2);
  });

  it("exists devolve Result<boolean, InfrastructureError>", async () => {
    const repo = new InMemoryTestRepository();
    const aggregate = new TestAggregate({ name: "A" });

    assert.equal((await repo.exists(aggregate.id)).getValue(), false);
    await repo.save(aggregate);
    assert.equal((await repo.exists(aggregate.id)).getValue(), true);
  });
});

describe("WriteRepository — compatibilidade com Result e AggregateRoot", () => {
  it("save aceita um AggregateRoot concreto e devolve Result<void, InfrastructureError>", async () => {
    const repo = new InMemoryTestRepository();
    const aggregate = new TestAggregate({ name: "A" });
    assert.equal(aggregate instanceof AggregateRoot, true);

    const result = await repo.save(aggregate);
    assert.equal(result.isSuccess, true);
  });

  it("delete remove o agregado e devolve Result<void, InfrastructureError>", async () => {
    const repo = new InMemoryTestRepository();
    const aggregate = new TestAggregate({ name: "A" });
    await repo.save(aggregate);

    const result = await repo.delete(aggregate.id);
    assert.equal(result.isSuccess, true);
    assert.equal((await repo.exists(aggregate.id)).getValue(), false);
  });
});
