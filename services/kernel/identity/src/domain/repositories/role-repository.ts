import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Role } from "../aggregates/role/role.js";

/**
 * Contrato de persistência do Aggregate `Role` — port da Domain Layer
 * (ENGINEERING_PLAYBOOK.md § 3); implementação concreta vive em `infrastructure/`,
 * fora do escopo desta missão. Composição exata já congelada em
 * IDENTITY_TECHNICAL_BLUEPRINT.md § 5: `ReadRepository<Role>` +
 * `WriteRepository<Role>` do Shared Kernel (ENG-0001.7), sem nenhum método
 * próprio. Sem `PermissionRepository`: `Permission` é Value Object, persistida
 * como parte de `Role` (Blueprint § 5, Freeze §§ 3-4) — não tem ciclo de
 * persistência independente. Ver "Operações Rejeitadas" no Self Review da
 * Missão ENG-0002.9.
 */
export interface RoleRepository extends ReadRepository<Role>, WriteRepository<Role> {}
