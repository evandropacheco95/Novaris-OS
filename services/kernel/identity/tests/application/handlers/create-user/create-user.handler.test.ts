import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { UniqueEntityId, Result, Option } from "@novaris/shared-kernel";
import type { InfrastructureError, DomainEvent } from "@novaris/shared-kernel";
import type { EventBus, EventHandler, Subscription } from "@novaris/event-bus";
import { User } from "../../../../src/domain/aggregates/user/user.js";
import type { UserRepository } from "../../../../src/domain/repositories/user-repository.js";
import { CreateUserHandler } from "../../../../src/application/handlers/create-user/create-user.handler.js";
import { CreateUserCommand } from "../../../../src/application/commands/create-user/create-user.command.js";

/**
 * Testes de `CreateUserHandler` — primeira suíte deste Handler. Cobre tanto
 * a orquestração já existente (email → create → save) quanto a nova
 * integração real com o Event Bus (`ADR-0037`, `ENG-0139`): `UserCreated`
 * publicado após `save()` ter sucesso, nunca antes de uma falha.
 *
 * `FakeUserRepository`/`FakeEventBus` — Fakes em memória, mesmo padrão de
 * `update-organization-profile.handler.test.ts` (Organization, `ENG-0135`).
 */
class FakeUserRepository implements UserRepository {
  private readonly records = new Map<string, User>();
  shouldFailSave = false;

  async findById(id: UniqueEntityId): Promise<Result<Option<User>, InfrastructureError>> {
    const found = this.records.get(id.toString());
    return Result.ok(found ? Option.some(found) : Option.none<User>());
  }

  async findAll(): Promise<Result<User[], InfrastructureError>> {
    return Result.ok(Array.from(this.records.values()));
  }

  async exists(id: UniqueEntityId): Promise<Result<boolean, InfrastructureError>> {
    return Result.ok(this.records.has(id.toString()));
  }

  async save(entity: User): Promise<Result<void, InfrastructureError>> {
    if (this.shouldFailSave) {
      return Result.fail({ code: "INFRASTRUCTURE_ERROR", message: "Falha simulada" } as InfrastructureError);
    }
    this.records.set(entity.id.toString(), entity);
    return Result.ok(undefined);
  }

  async delete(id: UniqueEntityId): Promise<Result<void, InfrastructureError>> {
    this.records.delete(id.toString());
    return Result.ok(undefined);
  }
}

class FakeEventBus implements EventBus {
  readonly published: DomainEvent[] = [];

  publish(event: DomainEvent): void {
    this.published.push(event);
  }

  subscribe(eventType: string, handler: EventHandler): Subscription {
    return { eventType, handler };
  }

  unsubscribe(): void {
    // não usado nestes testes
  }
}

function buildHandler(userRepo = new FakeUserRepository(), eventBus = new FakeEventBus()) {
  const handler = new CreateUserHandler(userRepo, eventBus);
  return { handler, userRepo, eventBus };
}

function buildCommand(overrides: Partial<{ organizationId: string; email: string; createdBy: string }> = {}) {
  return new CreateUserCommand({
    organizationId: overrides.organizationId ?? new UniqueEntityId().toString(),
    email: overrides.email ?? "novo.usuario@novaris.com.br",
    createdBy: overrides.createdBy ?? new UniqueEntityId().toString(),
  });
}

describe("CreateUserHandler — orquestração básica", () => {
  it("cria e persiste um User válido", async () => {
    const { handler, userRepo } = buildHandler();
    const result = await handler.execute(buildCommand());

    assert.equal(result.isSuccess, true);
    const stored = await userRepo.findById(result.getValue()!.id);
    assert.equal(stored.getValue()!.isSome, true);
  });

  it("devolve ValidationError para email inválido, sem chamar save()", async () => {
    const { handler, userRepo } = buildHandler();
    const result = await handler.execute(buildCommand({ email: "não-é-um-email" }));

    assert.equal(result.isFailure, true);
    assert.equal((await userRepo.findAll()).getValue()!.length, 0);
  });
});

describe("CreateUserHandler — publicação via Event Bus (ADR-0037)", () => {
  it("publica UserCreated após save() ter sucesso", async () => {
    const { handler, eventBus } = buildHandler();
    const result = await handler.execute(buildCommand());

    assert.equal(result.isSuccess, true);
    assert.equal(eventBus.published.length, 1);
    assert.equal(eventBus.published[0]!.eventName, "UserCreated");
    assert.equal(eventBus.published[0]!.aggregateId.equals(result.getValue()!.id), true);
  });

  it("não publica nenhum evento quando a validação falha", async () => {
    const { handler, eventBus } = buildHandler();
    await handler.execute(buildCommand({ email: "inválido" }));

    assert.equal(eventBus.published.length, 0);
  });

  it("não publica nenhum evento quando save() falha", async () => {
    const userRepo = new FakeUserRepository();
    userRepo.shouldFailSave = true;
    const { handler, eventBus } = buildHandler(userRepo);

    const result = await handler.execute(buildCommand());

    assert.equal(result.isFailure, true);
    assert.equal(eventBus.published.length, 0);
  });

  it("limpa os domainEvents do User depois de publicar", async () => {
    const { handler } = buildHandler();
    const result = await handler.execute(buildCommand());

    assert.equal(result.getValue()!.domainEvents.length, 0);
  });
});
