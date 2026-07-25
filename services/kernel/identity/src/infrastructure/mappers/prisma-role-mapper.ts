import { UniqueEntityId } from "@novaris/shared-kernel";
import type { Role as PrismaRole } from "@novaris/database";
import { Role, type RoleProps } from "../../domain/aggregates/role/role.js";
import { Permission } from "../../domain/value-objects/permission.js";

/**
 * PrismaRoleMapper — tradução pura Aggregate ↔ linha real do Postgres (via
 * Prisma Client), sem I/O próprio. Mesma disciplina de `PrismaUserMapper`.
 *
 * `permissions` persistida como `TEXT[]` de códigos (`Permission.code`) —
 * cada código já foi validado no momento da escrita (nunca se concede uma
 * `Permission` sem passar por `Permission.create()` primeiro), mesmo
 * raciocínio de reconstituição já aplicado a `email` em `PrismaUserMapper`.
 */
export class PrismaRoleMapper {
  static toPersistenceCreate(role: Role) {
    return {
      id: role.id.toString(),
      organizationId: role.organizationId.toString(),
      name: role.name,
      permissions: role.permissions.map((permission) => permission.code),
      createdBy: role.createdBy.toString(),
      updatedBy: role.updatedBy.toString(),
      version: role.version,
    };
  }

  static toDomain(record: PrismaRole): Role {
    const props: RoleProps = {
      organizationId: new UniqueEntityId(record.organizationId),
      name: record.name,
      permissions: record.permissions.map((code) => Permission.create(code).getValue()!),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      createdBy: new UniqueEntityId(record.createdBy),
      updatedBy: new UniqueEntityId(record.updatedBy),
      version: record.version,
    };

    return Role.reconstitute(props, new UniqueEntityId(record.id));
  }
}
