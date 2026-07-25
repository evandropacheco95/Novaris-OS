import { Result, NotFoundError, BusinessRuleError } from "@novaris/shared-kernel";
import type { AsyncDomainService, DomainServiceResult, UniqueEntityId } from "@novaris/shared-kernel";
import type { UserRepository } from "../../repositories/user-repository.js";
import type { RoleRepository } from "../../repositories/role-repository.js";

export interface AssignRoleInput {
  userId: UniqueEntityId;
  roleId: UniqueEntityId;
  assignedBy: UniqueEntityId;
}

/**
 * Coordena a atribuição de um `Role` a um `User` — aprovado em
 * [DOMAIN_SERVICE_IDENTIFICATION.md § 5](../../../../DOMAIN_SERVICE_IDENTIFICATION.md)
 * (R7, **novo**, identificado a partir de uma lacuna já registrada no Self
 * Review de ENG-0002.7). Resolve a única parte da atribuição que nem `User`
 * nem `Role` conseguem decidir sozinhos: se o `Role` pertence à mesma
 * Organization do `User` ([IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 9](../../../../IDENTITY_AGGREGATE_DESIGN_FREEZE.md)
 * — cross-Organization proibido).
 *
 * A mutação em si continua exclusiva de `User.assignRole()` (intocado) — este
 * serviço só decide **se** pode chamá-lo, e persiste o resultado através do
 * `UserRepository` já existente. Somente leitura sobre `Role` — nunca grava
 * nele, nunca embute seu objeto em `User`.
 *
 * `User.assignRole()` não verifica duplicidade (decisão já tomada e revisada
 * em ENG-0002.7, não alterada aqui) — atribuir o mesmo `Role` duas vezes
 * produz duas referências em `user.roleIds`, comportamento herdado, não uma
 * regra nova desta missão.
 *
 * Sem Factory Method (ENS-0003 § 6) — construtor público recebe as
 * dependências diretamente.
 */
export class RoleAssignmentDomainService implements AsyncDomainService<AssignRoleInput, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(input: AssignRoleInput): Promise<DomainServiceResult<void>> {
    const userResult = await this.userRepository.findById(input.userId);
    if (userResult.isFailure) {
      return Result.fail(userResult.getError()!);
    }
    const userOption = userResult.getValue()!;
    if (userOption.isNone) {
      return Result.fail(new NotFoundError(`User ${input.userId.toValue()} não encontrado`));
    }
    const user = userOption.getOrElse(null as never);

    const roleResult = await this.roleRepository.findById(input.roleId);
    if (roleResult.isFailure) {
      return Result.fail(roleResult.getError()!);
    }
    const roleOption = roleResult.getValue()!;
    if (roleOption.isNone) {
      return Result.fail(new NotFoundError(`Role ${input.roleId.toValue()} não encontrado`));
    }
    const role = roleOption.getOrElse(null as never);

    if (!role.organizationId.equals(user.organizationId)) {
      return Result.fail(
        new BusinessRuleError(
          `Role ${input.roleId.toValue()} pertence a uma Organization diferente do User ${input.userId.toValue()}`,
        ),
      );
    }

    const assignResult = user.assignRole(role.id, input.assignedBy);
    if (assignResult.isFailure) {
      return Result.fail(assignResult.getError()!);
    }

    const saveResult = await this.userRepository.save(user);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(undefined);
  }
}
