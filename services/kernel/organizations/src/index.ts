// Organization Service — barrel de exportação pública.
// Populado conforme cada camada de src/ ganha implementação real.

export {
  Organization,
  type OrganizationProps,
  type OrganizationStatus,
  type OrganizationMetadata,
  type OrganizationAddress,
  type CreateOrganizationInput,
  type UpdateOrganizationProfileInput,
} from "./domain/aggregates/organization/organization.js";

export { OrganizationCreated } from "./domain/domain-events/organization-created.js";

export type { OrganizationRepository } from "./domain/repositories/organization-repository.js";

// Application Layer (`ENG-0128`) — mesma disciplina de `@novaris/sales`/`@novaris/customer`.
export { UpdateOrganizationProfileCommand } from "./application/commands/update-organization-profile/update-organization-profile.command.js";
export { UpdateOrganizationProfileHandler } from "./application/handlers/update-organization-profile/update-organization-profile.handler.js";

// Factory de Infrastructure — mantém a implementação concreta de Repository
// privada ao pacote (mesmo padrão de `@novaris/sales`).
export { createOrganizationRepository } from "./infrastructure/factories.js";
