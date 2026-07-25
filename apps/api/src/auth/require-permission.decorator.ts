import { SetMetadata } from "@nestjs/common";

export const REQUIRED_PERMISSION_KEY = "requiredPermission";

/**
 * Marca um Controller (ou rota) como exigindo uma `Permission` específica —
 * verificada por `PermissionGuard` via `AuthorizationDomainService` (Identity
 * Domain, já implementado e testado, nunca alterado por esta ADR).
 * Aplicado no nível de classe em todo Controller protegido (`ADR-0036`) — um
 * único código cobre todas as rotas daquele recurso, mesma granularidade do
 * único precedente real (`sales.opportunities.manage`).
 */
export const RequirePermission = (permissionCode: string) => SetMetadata(REQUIRED_PERMISSION_KEY, permissionCode);
