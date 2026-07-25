import { Result } from "@novaris/shared-kernel";
import type { AsyncDomainService, DomainServiceResult, UniqueEntityId } from "@novaris/shared-kernel";
import type { UserRepository } from "../../repositories/user-repository.js";
import type { RoleRepository } from "../../repositories/role-repository.js";
import { Permission } from "../../value-objects/permission.js";

export interface CheckPermissionInput {
  userId: UniqueEntityId;
  permissionCode: string;
}

/**
 * Coordena a verificação de autorização do Identity Domain — aprovado em
 * [DOMAIN_SERVICE_IDENTIFICATION.md § 5](../../../../DOMAIN_SERVICE_IDENTIFICATION.md)
 * (R10), assinatura congelada em `IDENTITY_TECHNICAL_BLUEPRINT.md §§ 4, 10`.
 *
 * Carrega o `User`, carrega cada `Role` referenciado em `user.roleIds` (via
 * `findById` em loop — escolha de índice que o próprio Blueprint § 10 deixava
 * explicitamente em aberto), e verifica se algum deles possui a `Permission`
 * pedida. Somente leitura — nenhum Repository é usado para escrita.
 *
 * `userId` inexistente e `roleId` órfão (referencia um `Role` que não existe)
 * não são falhas — são respostas de domínio válidas ("não tem a permissão"),
 * devolvidas como `Result.ok(false)`. `Result.fail` fica reservado para
 * falhas reais: `permissionCode` malformado ou Repository indisponível.
 *
 * Sem Factory Method (ENS-0003 § 6) — construtor público recebe as
 * dependências diretamente.
 */
export class AuthorizationDomainService implements AsyncDomainService<CheckPermissionInput, boolean> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(input: CheckPermissionInput): Promise<DomainServiceResult<boolean>> {
    const permissionResult = Permission.create(input.permissionCode);
    if (permissionResult.isFailure) {
      return Result.fail(permissionResult.getError()!);
    }
    const permission = permissionResult.getValue()!;

    const userResult = await this.userRepository.findById(input.userId);
    if (userResult.isFailure) {
      return Result.fail(userResult.getError()!);
    }
    const userOption = userResult.getValue()!;
    if (userOption.isNone) {
      return Result.ok(false);
    }
    const user = userOption.getOrElse(null as never);

    if (user.roleIds.length === 0) {
      return Result.ok(false);
    }

    const roleResults = await Promise.all(user.roleIds.map((roleId) => this.roleRepository.findById(roleId)));

    for (const roleResult of roleResults) {
      if (roleResult.isFailure) {
        return Result.fail(roleResult.getError()!);
      }
      const roleOption = roleResult.getValue()!;
      if (roleOption.isNone) {
        continue;
      }
      const role = roleOption.getOrElse(null as never);
      if (role.permissions.some((candidate) => candidate.equals(permission))) {
        return Result.ok(true);
      }
    }

    return Result.ok(false);
  }
}
