import { AggregateRoot, Result, ConflictError } from "@novaris/shared-kernel";
import type {
  UniqueEntityId,
  DomainError,
  Auditable,
  Versionable,
  HasMetadata,
} from "@novaris/shared-kernel";
import type { Email } from "../../value-objects/email.js";
import { UserCreated } from "../../domain-events/user-created.js";
import { UserInvited } from "../../domain-events/user-invited.js";
import { UserActivated } from "../../domain-events/user-activated.js";
import { UserDisabled } from "../../domain-events/user-disabled.js";
import { RoleAssignedToUser } from "../../domain-events/role-assigned-to-user.js";
import { RoleRevokedFromUser } from "../../domain-events/role-revoked-from-user.js";

/**
 * Estrutura ainda não definida por nenhuma fonte oficial — mantida como alias
 * do default estrutural de `HasMetadata` para não fabricar campo algum
 * (IDENTITY_TECHNICAL_BLUEPRINT.md § 1 só declara `HasMetadata<UserMetadata>`,
 * sem especificar forma).
 */
export type UserMetadata = Record<string, unknown>;

/**
 * Estados já inferíveis dos 4 Domain Events oficiais de `User` e do ciclo de
 * vida congelado em IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 11 — não é uma regra
 * de negócio nova, é a codificação direta do diagrama já aprovado. Reativação
 * de "disabled" para "active" permanece `requer decisão` (Freeze § 11) — por
 * isso não há transição de volta.
 */
export type UserStatus = "created" | "invited" | "active" | "disabled";

export interface UserProps {
  organizationId: UniqueEntityId;
  email: Email;
  status: UserStatus;
  roleIds: UniqueEntityId[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: UniqueEntityId;
  updatedBy: UniqueEntityId;
  version: number;
  metadata: UserMetadata;
}

export interface CreateUserInput {
  organizationId: UniqueEntityId;
  email: Email;
  createdBy: UniqueEntityId;
  metadata?: UserMetadata;
}

/**
 * Aggregate Root do Identity Domain — IDENTITY_TECHNICAL_BLUEPRINT.md § 1,
 * congelado em IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 1, 4, 5, 8, 9. Segue
 * AGGREGATE_IMPLEMENTATION_STANDARD.md (ENS-0001) em toda a estrutura.
 *
 * `id` nunca é fornecido a `create()` — é sempre gerado internamente
 * (`super(props)`, sem `id`), o que torna a invariante "um User não pode ser
 * seu próprio createdBy na criação" (Blueprint § 8, Freeze § 6, "Proposta")
 * estruturalmente impossível de violar: o `id` não existe antes da instância
 * ser construída, então nenhum `createdBy` fornecido pelo chamador pode
 * coincidir com ele. Nenhuma verificação em runtime é necessária para uma
 * condição que a própria forma do Factory Method já impede.
 */
export class User
  extends AggregateRoot<UserProps>
  implements Auditable, Versionable, HasMetadata<UserMetadata>
{
  private constructor(props: UserProps, id?: UniqueEntityId) {
    super(props, id);
  }

  static create(input: CreateUserInput): Result<User, DomainError> {
    const now = new Date();
    const props: UserProps = {
      organizationId: input.organizationId,
      email: input.email,
      status: "created",
      roleIds: [],
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
      updatedBy: input.createdBy,
      version: 1,
      metadata: input.metadata ?? {},
    };
    const user = new User(props);
    user.addDomainEvent(new UserCreated(user.id));
    return Result.ok(user);
  }

  /** Usado exclusivamente por uma futura implementação de `UserRepository` (ENS-0001 § 8). */
  static reconstitute(props: UserProps, id: UniqueEntityId): User {
    return new User(props, id);
  }

  /** Transição "created" → "invited" (IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 11). */
  invite(updatedBy: UniqueEntityId): Result<void, DomainError> {
    if (this.props.status !== "created") {
      return Result.fail(
        new ConflictError(
          `usuário no status "${this.props.status}" não pode ser convidado — transição válida só a partir de "created"`,
        ),
      );
    }
    this.props.status = "invited";
    this.touch(updatedBy);
    this.addDomainEvent(new UserInvited(this.id));
    return Result.ok(undefined);
  }

  /** Transição "created" ou "invited" → "active" (IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 11). */
  activate(updatedBy: UniqueEntityId): Result<void, DomainError> {
    if (this.props.status !== "created" && this.props.status !== "invited") {
      return Result.fail(
        new ConflictError(
          `usuário no status "${this.props.status}" não pode ser ativado — transição válida só a partir de "created" ou "invited"`,
        ),
      );
    }
    this.props.status = "active";
    this.touch(updatedBy);
    this.addDomainEvent(new UserActivated(this.id));
    return Result.ok(undefined);
  }

  /**
   * Transição "active" → "disabled" (IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 11).
   * Reativação (volta a "active") é `requer decisão` — não implementada.
   */
  disable(updatedBy: UniqueEntityId): Result<void, DomainError> {
    if (this.props.status !== "active") {
      return Result.fail(
        new ConflictError(
          `usuário no status "${this.props.status}" não pode ser desativado — transição válida só a partir de "active"`,
        ),
      );
    }
    this.props.status = "disabled";
    this.touch(updatedBy);
    this.addDomainEvent(new UserDisabled(this.id));
    return Result.ok(undefined);
  }

  /**
   * `roleIds` guarda só referências (IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 4) — nunca
   * o objeto `Role`. Verificar que `roleId` pertence à mesma Organization do `User`
   * (Freeze § 9, "proposta, não confirmada") exige carregar o `Role`, o que exige um
   * Repository — fora do escopo desta missão (ESCOPO PROIBIDO). Fica para a Application
   * Layer/Domain Service que tiver acesso a ambos os Repositories.
   */
  assignRole(roleId: UniqueEntityId, updatedBy: UniqueEntityId): Result<void, DomainError> {
    this.props.roleIds = [...this.props.roleIds, roleId];
    this.touch(updatedBy);
    this.addDomainEvent(new RoleAssignedToUser(this.id));
    return Result.ok(undefined);
  }

  /** Idempotente: revogar um `roleId` não atribuído não é uma violação de invariante documentada. */
  revokeRole(roleId: UniqueEntityId, updatedBy: UniqueEntityId): Result<void, DomainError> {
    this.props.roleIds = this.props.roleIds.filter((existing) => !existing.equals(roleId));
    this.touch(updatedBy);
    this.addDomainEvent(new RoleRevokedFromUser(this.id));
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

  get email(): Email {
    return this.props.email;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get roleIds(): ReadonlyArray<UniqueEntityId> {
    return this.props.roleIds;
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

  get metadata(): UserMetadata {
    return this.props.metadata;
  }
}
