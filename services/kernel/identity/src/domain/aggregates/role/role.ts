import { AggregateRoot, Result } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Auditable, Versionable } from "@novaris/shared-kernel";
import type { Permission } from "../../value-objects/permission.js";
import { RoleCreated } from "../../domain-events/role-created.js";
import { PermissionGrantedToRole } from "../../domain-events/permission-granted-to-role.js";
import { PermissionRevokedFromRole } from "../../domain-events/permission-revoked-from-role.js";

export interface RoleProps {
  organizationId: UniqueEntityId;
  name: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: UniqueEntityId;
  updatedBy: UniqueEntityId;
  version: number;
}

export interface CreateRoleInput {
  organizationId: UniqueEntityId;
  name: string;
  createdBy: UniqueEntityId;
}

/**
 * Aggregate Root do Identity Domain — IDENTITY_TECHNICAL_BLUEPRINT.md § 1,
 * congelado em IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 1, 4, 5, 8, 9. Segue
 * AGGREGATE_IMPLEMENTATION_STANDARD.md (ENS-0001) e o mesmo padrão estrutural
 * de `User` (ENG-0002.7): construtor privado, `create`/`reconstitute`,
 * mutação só via métodos nomeados, `Result<T, DomainError>` em toda operação.
 *
 * Sem `implements HasMetadata` — decisão já tomada em IDENTITY_TECHNICAL_BLUEPRINT.md
 * § 1: "nenhuma fonte oficial ou proposta associa metadados a Role; não inventado
 * aqui". Sem `status`/máquina de estados — `Role` não tem ciclo de vida com
 * transições (diferente de `User`); só cresce/diminui `permissions` (Freeze § 11).
 * Nunca importa nem referencia `User` — isolamento de Aggregate (Freeze § 9:
 * "Role nunca mantém referência de volta para User").
 */
export class Role extends AggregateRoot<RoleProps> implements Auditable, Versionable {
  private constructor(props: RoleProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateRoleInput): Result<Role, DomainError> {
    const now = new Date();
    const props: RoleProps = {
      organizationId: input.organizationId,
      name: input.name,
      permissions: [],
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
      updatedBy: input.createdBy,
      version: 1,
    };
    const role = new Role(props);
    role.addDomainEvent(new RoleCreated(role.id));
    return Result.ok(role);
  }

  /** Usado exclusivamente por uma futura implementação de `RoleRepository` (ENS-0001 § 8). */
  static reconstitute(props: RoleProps, id: UniqueEntityId): Role {
    return new Role(props, id);
  }

  /**
   * `permissions` embute os Value Objects diretamente, por valor, dentro da
   * própria fronteira de consistência (Freeze §§ 4, 5, 8) — nunca por referência.
   * Unicidade de `Permission` dentro de `permissions` não é uma invariante
   * documentada em nenhuma fonte — não fabricada aqui (mesmo critério já
   * aplicado a `User.assignRole`, ENG-0002.7).
   */
  grantPermission(permission: Permission, updatedBy: UniqueEntityId): Result<void, DomainError> {
    this.props.permissions = [...this.props.permissions, permission];
    this.touch(updatedBy);
    this.addDomainEvent(new PermissionGrantedToRole(this.id));
    return Result.ok(undefined);
  }

  /** Idempotente: revogar uma `Permission` não concedida não é uma violação de invariante documentada. */
  revokePermission(permission: Permission, updatedBy: UniqueEntityId): Result<void, DomainError> {
    this.props.permissions = this.props.permissions.filter((existing) => !existing.equals(permission));
    this.touch(updatedBy);
    this.addDomainEvent(new PermissionRevokedFromRole(this.id));
    return Result.ok(undefined);
  }

  private touch(updatedBy: UniqueEntityId): void {
    this.props.updatedAt = new Date();
    this.props.updatedBy = updatedBy;
    this.props.version += 1;
  }

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get name(): string {
    return this.props.name;
  }

  get permissions(): ReadonlyArray<Permission> {
    return this.props.permissions;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get createdBy(): UniqueEntityId {
    return this.props.createdBy;
  }

  get updatedBy(): UniqueEntityId {
    return this.props.updatedBy;
  }

  get version(): number {
    return this.props.version;
  }
}
