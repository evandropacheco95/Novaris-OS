import { UniqueEntityId } from "@novaris/shared-kernel";
import type { User as PrismaUser } from "@novaris/database";
import { User, type UserProps, type UserStatus, type UserMetadata } from "../../domain/aggregates/user/user.js";
import { Email } from "../../domain/value-objects/email.js";

/**
 * PrismaUserMapper — tradução pura Aggregate ↔ linha real do Postgres (via
 * Prisma Client), sem I/O próprio. Mesma disciplina de `PrismaOpportunityMapper`
 * (Sales, `ENG-0120`).
 *
 * `email` já foi validado no momento em que o registro foi escrito (nunca se
 * persiste um `User` sem passar por `Email.create()` primeiro) — `getValue()!`
 * ao reconstituir é seguro pela mesma razão já registrada para
 * `findById()`/`InMemoryOpportunityRepository` em Sales: reconstituição nunca
 * revalida uma invariante já garantida na escrita.
 */
export class PrismaUserMapper {
  static toPersistenceCreate(user: User) {
    return {
      id: user.id.toString(),
      organizationId: user.organizationId.toString(),
      email: user.email.value,
      status: user.status,
      roleIds: user.roleIds.map((roleId) => roleId.toString()),
      createdBy: user.createdBy.toString(),
      updatedBy: user.updatedBy.toString(),
      version: user.version,
      metadata: user.metadata as object,
    };
  }

  static toDomain(record: PrismaUser): User {
    const emailResult = Email.create(record.email);
    const props: UserProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      email: emailResult.getValue()!,
      status: record.status as UserStatus,
      roleIds: record.roleIds.map((roleId) => new UniqueEntityId(roleId)),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: new UniqueEntityId(record.createdBy),
      updatedBy: new UniqueEntityId(record.updatedBy),
      version: record.version,
      metadata: record.metadata as UserMetadata,
    };

    return User.reconstitute(props, new UniqueEntityId(record.id));
  }
}
