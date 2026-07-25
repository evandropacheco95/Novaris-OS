import type { OrganizationAddress } from "../../../domain/aggregates/organization/organization.js";

/**
 * UpdateOrganizationProfileCommand — Application Layer, Organization Domain.
 * Mesmo padrão estrutural de `CreatePartyCommand` (Customer, `ENG-0125`).
 * `name`/`legalName`/`document`/`address` opcionais — `Organization.updateProfile()`
 * só altera o que for fornecido (`organization.ts`).
 *
 * `actorId` (obrigatório, `ADR-0035`) — quem está executando a operação;
 * origem em `req.user.userId` (JWT), nunca inferido pelo Handler. Único
 * campo aqui que existe exclusivamente para enriquecer o `AuditEntry`
 * eventualmente criado por este Handler — `Organization.updateProfile()`
 * em si não o utiliza.
 */
export interface UpdateOrganizationProfileCommandInput {
  readonly organizationId: string;
  readonly actorId: string;
  readonly name?: string;
  readonly legalName?: string;
  readonly document?: string;
  readonly address?: OrganizationAddress;
}

export class UpdateOrganizationProfileCommand {
  readonly organizationId: string;
  readonly actorId: string;
  readonly name?: string;
  readonly legalName?: string;
  readonly document?: string;
  readonly address?: OrganizationAddress;

  constructor(input: UpdateOrganizationProfileCommandInput) {
    this.organizationId = input.organizationId;
    this.actorId = input.actorId;
    this.name = input.name;
    this.legalName = input.legalName;
    this.document = input.document;
    this.address = input.address;
    Object.freeze(this);
  }
}
