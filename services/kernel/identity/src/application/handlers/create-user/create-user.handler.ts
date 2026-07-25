import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { EventBus } from "@novaris/event-bus";
import { User } from "../../../domain/aggregates/user/user.js";
import { Email } from "../../../domain/value-objects/email.js";
import type { UserRepository } from "../../../domain/repositories/user-repository.js";
import type { CreateUserCommand } from "../../commands/create-user/create-user.command.js";

/**
 * CreateUserHandler — Application Layer, Identity Domain.
 *
 * Orquestra: `CreateUserCommand` → `Email.create()` (validação de formato) →
 * `User.create()` → `UserRepository.save()` → `Result<User, DomainError |
 * InfrastructureError>`. Mesmo padrão de `CreatePartyHandler` (Customer,
 * `ENG-0125`) — `save()` sempre verificado, nunca descartado (bug real
 * corrigido em `ENG-0126`, aplicado desde o primeiro Handler deste domínio).
 *
 * `User` nasce em status `"created"` (`user.ts`) — nunca `"active"` diretamente;
 * `ActivateUserHandler` é um caso de uso separado, mesma disciplina de não
 * pular etapas da máquina de estados já congelada
 * (`IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 11`).
 *
 * Após `save()` ter sucesso, publica os `domainEvents` do `User` (hoje,
 * `UserCreated`) via `EventBus` — primeira integração real do Event Bus
 * (`ADR-0037`). Mesma disciplina de `ADR-0035` (Audit): a publicação é uma
 * consequência observacional da operação primária já persistida, nunca uma
 * condição para o sucesso dela — se um Subscriber falhar, `EventBus` já
 * isola o erro internamente (`InProcessEventBus`), então esta chamada nunca
 * lança.
 */
export class CreateUserHandler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<User, DomainError | InfrastructureError>> {
    const emailResult = Email.create(command.email);
    if (emailResult.isFailure) {
      return Result.fail(emailResult.getError()!);
    }

    const createResult = User.create({
      organizationId: new UniqueEntityId(command.organizationId),
      email: emailResult.getValue()!,
      createdBy: new UniqueEntityId(command.createdBy),
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }

    const user = createResult.getValue()!;
    const saveResult = await this.userRepository.save(user);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    for (const event of user.domainEvents) {
      this.eventBus.publish(event);
    }
    user.clearEvents();

    return Result.ok(user);
  }
}
