import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option } from "@novaris/shared-kernel";
import type { InfrastructureError } from "@novaris/shared-kernel";
import { FeatureFlag } from "../../../../src/domain/aggregates/feature-flag/feature-flag.js";
import type { FeatureFlagRepository } from "../../../../src/domain/repositories/feature-flag-repository.js";
import { SetFeatureFlagHandler } from "../../../../src/application/handlers/set-feature-flag/set-feature-flag.handler.js";
import { SetFeatureFlagCommand } from "../../../../src/application/commands/set-feature-flag/set-feature-flag.command.js";

class FakeFeatureFlagRepository implements FeatureFlagRepository {
  private readonly records = new Map<string, FeatureFlag>();

  async findById(id: UniqueEntityId): Promise<Result<Option<FeatureFlag>, InfrastructureError>> {
    const found = this.records.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<FeatureFlag>());
  }

  async findByOrganizationAndKey(organizationId: UniqueEntityId, key: string): Promise<Result<Option<FeatureFlag>, InfrastructureError>> {
    const found = Array.from(this.records.values()).find((flag) => flag.organizationId.equals(organizationId) && flag.key === key);
    return Result.ok(found ? Option.some(found) : Option.none<FeatureFlag>());
  }

  async findAll(): Promise<Result<FeatureFlag[], InfrastructureError>> {
    return Result.ok(Array.from(this.records.values()));
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.records.has(id.toString()));
  }

  async save(entity: FeatureFlag): Promise<Result<void, InfrastructureError>> {
    this.records.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.records.delete(id.toString());
    return Result.ok(undefined);
  }
}

describe("SetFeatureFlagHandler — criação", () => {
  it("cria uma nova FeatureFlag quando a chave ainda não existe", async () => {
    const repository = new FakeFeatureFlagRepository();
    const handler = new SetFeatureFlagHandler(repository);
    const organizationId = new UniqueEntityId().toString();

    const result = await handler.execute(new SetFeatureFlagCommand({ organizationId, key: "novo-dashboard", enabled: true }));

    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.enabled, true);
  });
});

describe("SetFeatureFlagHandler — upsert", () => {
  it("alterna enabled de uma flag existente em vez de duplicar", async () => {
    const repository = new FakeFeatureFlagRepository();
    const handler = new SetFeatureFlagHandler(repository);
    const organizationId = new UniqueEntityId().toString();

    await handler.execute(new SetFeatureFlagCommand({ organizationId, key: "novo-dashboard", enabled: true }));
    const result = await handler.execute(new SetFeatureFlagCommand({ organizationId, key: "novo-dashboard", enabled: false }));

    assert.equal(result.getValue()!.enabled, false);
    assert.equal((await repository.findAll()).getValue()!.length, 1, "não deveria duplicar a linha");
  });
});

describe("SetFeatureFlagHandler — validação", () => {
  it("devolve ValidationError para key vazia, sem persistir", async () => {
    const repository = new FakeFeatureFlagRepository();
    const handler = new SetFeatureFlagHandler(repository);

    const result = await handler.execute(new SetFeatureFlagCommand({ organizationId: new UniqueEntityId().toString(), key: "", enabled: true }));

    assert.equal(result.isFailure, true);
    assert.equal((await repository.findAll()).getValue()!.length, 0);
  });
});
