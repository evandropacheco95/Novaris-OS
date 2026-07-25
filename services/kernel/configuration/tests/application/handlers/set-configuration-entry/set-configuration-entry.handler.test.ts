import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option } from "@novaris/shared-kernel";
import type { InfrastructureError } from "@novaris/shared-kernel";
import { ConfigurationEntry } from "../../../../src/domain/aggregates/configuration-entry/configuration-entry.js";
import type { ConfigurationEntryRepository } from "../../../../src/domain/repositories/configuration-entry-repository.js";
import { SetConfigurationEntryHandler } from "../../../../src/application/handlers/set-configuration-entry/set-configuration-entry.handler.js";
import { SetConfigurationEntryCommand } from "../../../../src/application/commands/set-configuration-entry/set-configuration-entry.command.js";

class FakeConfigurationEntryRepository implements ConfigurationEntryRepository {
  private readonly records = new Map<string, ConfigurationEntry>();

  async findById(id: UniqueEntityId): Promise<Result<Option<ConfigurationEntry>, InfrastructureError>> {
    const found = this.records.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<ConfigurationEntry>());
  }

  async findByOrganizationAndKey(organizationId: UniqueEntityId, key: string): Promise<Result<Option<ConfigurationEntry>, InfrastructureError>> {
    const found = Array.from(this.records.values()).find((entry) => entry.organizationId.equals(organizationId) && entry.key === key);
    return Result.ok(found ? Option.some(found) : Option.none<ConfigurationEntry>());
  }

  async findAll(): Promise<Result<ConfigurationEntry[], InfrastructureError>> {
    return Result.ok(Array.from(this.records.values()));
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.records.has(id.toString()));
  }

  async save(entity: ConfigurationEntry): Promise<Result<void, InfrastructureError>> {
    this.records.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.records.delete(id.toString());
    return Result.ok(undefined);
  }
}

describe("SetConfigurationEntryHandler — criação", () => {
  it("cria uma nova ConfigurationEntry quando a chave ainda não existe", async () => {
    const repository = new FakeConfigurationEntryRepository();
    const handler = new SetConfigurationEntryHandler(repository);
    const organizationId = new UniqueEntityId().toString();

    const result = await handler.execute(new SetConfigurationEntryCommand({ organizationId, key: "tema", value: "escuro" }));

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.value, "escuro");
    assert.equal((await repository.findAll()).getValue()!.length, 1);
  });
});

describe("SetConfigurationEntryHandler — upsert", () => {
  it("atualiza o value de uma entry existente em vez de duplicar", async () => {
    const repository = new FakeConfigurationEntryRepository();
    const handler = new SetConfigurationEntryHandler(repository);
    const organizationId = new UniqueEntityId().toString();

    await handler.execute(new SetConfigurationEntryCommand({ organizationId, key: "tema", value: "escuro" }));
    const result = await handler.execute(new SetConfigurationEntryCommand({ organizationId, key: "tema", value: "claro" }));

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.value, "claro");
    assert.equal((await repository.findAll()).getValue()!.length, 1, "não deveria duplicar a linha");
  });

  it("duas organizações podem ter a mesma key com values diferentes", async () => {
    const repository = new FakeConfigurationEntryRepository();
    const handler = new SetConfigurationEntryHandler(repository);
    const orgA = new UniqueEntityId().toString();
    const orgB = new UniqueEntityId().toString();

    await handler.execute(new SetConfigurationEntryCommand({ organizationId: orgA, key: "tema", value: "escuro" }));
    await handler.execute(new SetConfigurationEntryCommand({ organizationId: orgB, key: "tema", value: "claro" }));

    assert.equal((await repository.findAll()).getValue()!.length, 2);
  });
});

describe("SetConfigurationEntryHandler — validação", () => {
  it("devolve ValidationError para key vazia, sem persistir", async () => {
    const repository = new FakeConfigurationEntryRepository();
    const handler = new SetConfigurationEntryHandler(repository);

    const result = await handler.execute(new SetConfigurationEntryCommand({ organizationId: new UniqueEntityId().toString(), key: "  ", value: "x" }));

    assert.equal(result.isFailure, true);
    assert.equal((await repository.findAll()).getValue()!.length, 0);
  });
});
