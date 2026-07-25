import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Result, DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { RoleAssignmentDomainService } from "../../../domain/services/role-assignment/role-assignment-domain-service.js";
import type { AssignRoleCommand } from "../../commands/assign-role/assign-role.command.js";

/**
 * AssignRoleHandler — Application Layer, Identity Domain.
 *
 * Orquestra apenas a conversão `string` → `UniqueEntityId` e delega
 * inteiramente a `RoleAssignmentDomainService` (já implementado,
 * `DOMAIN_SERVICE_IDENTIFICATION.md § 5`, R7) — que decide se o `Role`
 * pertence à mesma Organization do `User` (cruza dois Aggregates, por isso é
 * Domain Service, não lógica de Handler). Devolve `Result<void, DomainError | InfrastructureError>`
 * (assinatura corrigida em consolidação — mesma imprecisão de tipo já
 * corrigida em `AuthenticateUserHandler`), mesma assinatura real já devolvida
 * pelo Domain Service (`DomainServiceResult<void>`).
 */
export class AssignRoleHandler {
  constructor(private readonly roleAssignmentDomainService: RoleAssignmentDomainService) {}

  async execute(command: AssignRoleCommand): Promise<Result<void, DomainError | InfrastructureError>> {
    return this.roleAssignmentDomainService.execute({
      userId: new UniqueEntityId(command.userId),
      roleId: new UniqueEntityId(command.roleId),
      assignedBy: new UniqueEntityId(command.assignedBy),
    });
  }
}
