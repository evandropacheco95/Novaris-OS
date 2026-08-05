import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Option, Result, type InfrastructureError } from "@novaris/shared-kernel";
import { SalesChannel } from "../../../../domain/aggregates/sales-channel/sales-channel.js";
import type { SalesChannelRepository } from "../../../../domain/repositories/sales-channel-repository.js";
import { CreateSalesChannelHandler } from "../../../../application/handlers/create-sales-channel/create-sales-channel.handler.js";
import { CreateSalesChannelCommand } from "../../../../application/commands/create-sales-channel/create-sales-channel.command.js";
import { RenameSalesChannelHandler } from "../../../../application/handlers/rename-sales-channel/rename-sales-channel.handler.js";
import { RenameSalesChannelCommand } from "../../../../application/commands/rename-sales-channel/rename-sales-channel.command.js";
import { ActivateSalesChannelHandler } from "../../../../application/handlers/activate-sales-channel/activate-sales-channel.handler.js";
import { ActivateSalesChannelCommand } from "../../../../application/commands/activate-sales-channel/activate-sales-channel.command.js";
import { DeactivateSalesChannelHandler } from "../../../../application/handlers/deactivate-sales-channel/deactivate-sales-channel.handler.js";
import { DeactivateSalesChannelCommand } from "../../../../application/commands/deactivate-sales-channel/deactivate-sales-channel.command.js";

class FakeSalesChannelRepository implements SalesChannelRepository {
  constructor(private readonly channels: Map<string, SalesChannel> = new Map()) {}
  add(channel: SalesChannel): void {
    this.channels.set(channel.id.toString(), channel);
  }
  async findById(id: UniqueEntityId): Promise<Result<Option<SalesChannel>, InfrastructureError>> {
    const found = this.channels.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<SalesChannel>());
  }
  async findAll(): Promise<Result<SalesChannel[], InfrastructureError>> {
    return Result.ok([...this.channels.values()]);
  }
  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.channels.has(id.toString()));
  }
  async save(entity: SalesChannel): Promise<Result<void, InfrastructureError>> {
    this.channels.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }
  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.channels.delete(id.toString());
    return Result.ok(undefined);
  }
}

describe("CreateSalesChannelHandler", () => {
  it("cria e persiste um SalesChannel válido", async () => {
    const repository = new FakeSalesChannelRepository();
    const handler = new CreateSalesChannelHandler(repository);

    const result = await handler.execute(
      new CreateSalesChannelCommand({ organizationId: new UniqueEntityId().toString(), name: "Mercado Livre", type: "marketplace" }),
    );
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.name, "Mercado Livre");
    assert.equal((await repository.findAll()).getValue()!.length, 1);
  });

  it("devolve ValidationError para type inválido, sem chamar save()", async () => {
    const repository = new FakeSalesChannelRepository();
    const handler = new CreateSalesChannelHandler(repository);

    const result = await handler.execute(
      new CreateSalesChannelCommand({ organizationId: new UniqueEntityId().toString(), name: "X", type: "reseller" as never }),
    );
    assert.equal(result.isFailure, true);
    assert.equal((await repository.findAll()).getValue()!.length, 0);
  });
});

describe("RenameSalesChannelHandler", () => {
  it("renomeia um SalesChannel existente", async () => {
    const repository = new FakeSalesChannelRepository();
    const handler = new RenameSalesChannelHandler(repository);
    const channel = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "X", type: "direct" }).getValue()!;
    repository.add(channel);

    const result = await handler.execute(new RenameSalesChannelCommand({ salesChannelId: channel.id.toString(), name: "Direto B2B" }));
    assert.equal(result.isSuccess, true);
    assert.equal(result.getValue()!.name, "Direto B2B");
  });

  it("devolve NotFoundError para salesChannelId inexistente", async () => {
    const repository = new FakeSalesChannelRepository();
    const handler = new RenameSalesChannelHandler(repository);
    const result = await handler.execute(new RenameSalesChannelCommand({ salesChannelId: new UniqueEntityId().toString(), name: "X" }));
    assert.equal(result.isFailure, true);
    assert.equal(result.getError()!.code, "NOT_FOUND_ERROR");
  });
});

describe("ActivateSalesChannelHandler / DeactivateSalesChannelHandler", () => {
  it("desativa e reativa um SalesChannel existente", async () => {
    const repository = new FakeSalesChannelRepository();
    const deactivateHandler = new DeactivateSalesChannelHandler(repository);
    const activateHandler = new ActivateSalesChannelHandler(repository);
    const channel = SalesChannel.create({ organizationId: new UniqueEntityId(), name: "X", type: "online_store" }).getValue()!;
    repository.add(channel);

    const deactivateResult = await deactivateHandler.execute(new DeactivateSalesChannelCommand({ salesChannelId: channel.id.toString() }));
    assert.equal(deactivateResult.isSuccess, true);
    assert.equal(deactivateResult.getValue()!.active, false);

    const activateResult = await activateHandler.execute(new ActivateSalesChannelCommand({ salesChannelId: channel.id.toString() }));
    assert.equal(activateResult.isSuccess, true);
    assert.equal(activateResult.getValue()!.active, true);
  });
});
