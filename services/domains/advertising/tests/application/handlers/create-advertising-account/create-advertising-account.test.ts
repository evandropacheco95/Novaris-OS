import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Option, Result, type InfrastructureError } from "@novaris/shared-kernel";
import type { AdvertisingAccount } from "../../../../domain/aggregates/advertising-account/advertising-account.js";
import type { AdvertisingAccountRepository } from "../../../../domain/repositories/advertising-account-repository.js";
import { CreateAdvertisingAccountHandler } from "../../../../application/handlers/create-advertising-account/create-advertising-account.handler.js";
import { CreateAdvertisingAccountCommand } from "../../../../application/commands/create-advertising-account/create-advertising-account.command.js";

class FakeAdvertisingAccountRepository implements AdvertisingAccountRepository {
  constructor(private readonly accounts: Map<string, AdvertisingAccount> = new Map()) {}
  async findById(id: UniqueEntityId): Promise<Result<Option<AdvertisingAccount>, InfrastructureError>> {
    const found = this.accounts.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<AdvertisingAccount>());
  }
  async findAll(): Promise<Result<AdvertisingAccount[], InfrastructureError>> {
    return Result.ok([...this.accounts.values()]);
  }
  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.accounts.has(id.toString()));
  }
  async save(entity: AdvertisingAccount): Promise<Result<void, InfrastructureError>> {
    this.accounts.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }
  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.accounts.delete(id.toString());
    return Result.ok(undefined);
  }
}

describe("CreateAdvertisingAccountHandler", () => {
  it("cria e persiste uma AdvertisingAccount válida", async () => {
    const repository = new FakeAdvertisingAccountRepository();
    const handler = new CreateAdvertisingAccountHandler(repository);
    const organizationId = new UniqueEntityId();

    const result = await handler.execute(
      new CreateAdvertisingAccountCommand({ organizationId: organizationId.toString(), provider: "google_ads", name: "Allbinox Metais — Google Ads" }),
    );
    assert.equal(result.isSuccess, true);

    const account = result.getValue()!;
    assert.equal(account.name, "Allbinox Metais — Google Ads");
    assert.equal(account.connectionStatus, "NOT_CONNECTED");
    assert.equal((await repository.exists(account.id)).getValue(), true);
  });

  it("devolve ValidationError sem persistir quando name é vazio", async () => {
    const repository = new FakeAdvertisingAccountRepository();
    const handler = new CreateAdvertisingAccountHandler(repository);

    const result = await handler.execute(
      new CreateAdvertisingAccountCommand({ organizationId: new UniqueEntityId().toString(), provider: "google_ads", name: "" }),
    );
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "VALIDATION_ERROR");
    assert.equal((await repository.findAll()).getValue()!.length, 0);
  });
});
