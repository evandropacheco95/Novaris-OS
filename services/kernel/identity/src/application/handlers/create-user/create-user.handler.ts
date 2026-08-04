import { Result, UniqueEntityId, ConflictError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { EventBus } from "@novaris/event-bus";
import type { OrganizationRepository } from "@novaris/organizations";
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
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  /**
   * `ENG-0164` — checa `Organization.maxUsers` antes de criar. `undefined` =
   * sem limite (comportamento de toda Organization anterior a esta missão,
   * preservado). Conta via `findAll()` + filtro em memória, mesmo padrão já
   * usado em toda rota `list()` desta engenharia (`LeadController`,
   * `AutomationRuleController` etc.) — `UserRepository` deliberadamente não
   * ganhou um método de conveniência (`countByOrganization`), mesma
   * disciplina que rejeitou `findByEmail` (`user-repository.ts`).
   */
  async execute(command: CreateUserCommand): Promise<Result<User, DomainError | InfrastructureError>> {
    const orgResult = await this.organizationRepository.findById(new UniqueEntityId(command.organizationId));
    if (orgResult.isFailure) {
      return Result.fail(orgResult.getError()!);
    }
    const orgOption = orgResult.getValue()!;
    if (orgOption.isSome) {
      const organization = orgOption.getOrElse(null as never);
      if (organization.maxUsers !== undefined) {
        const usersResult = await this.userRepository.findAll();
        if (usersResult.isFailure) {
          return Result.fail(usersResult.getError()!);
        }
        const currentCount = usersResult
          .getValue()!
          .filter((user) => user.organizationId.toString() === command.organizationId).length;
        if (currentCount >= organization.maxUsers) {
          return Result.fail(
            new ConflictError(`Organization já atingiu o limite de ${organization.maxUsers} usuário(s) do plano atual`),
          );
        }
      }
    }

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
