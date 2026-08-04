import type { OrganizationPlan, OrganizationBillingStatus } from "../../../domain/aggregates/organization/organization.js";

/**
 * UpdateOrganizationPlanCommand — Application Layer, Organization Domain
 * (`ENG-0164`). Mesmo padrão estrutural de `UpdateOrganizationProfileCommand`
 * — separado por concern (perfil cadastral vs. plano/billing), não porque a
 * regra de negócio exija, mas para manter a Permission de billing (`workspace.plan.manage`)
 * distinta da de perfil (`workspace.profile.manage`).
 *
 * `trialEnd`/`maxUsers`/`enabledDomains` usam `| null` explícito (distinto de
 * `undefined`) — `undefined` = "não enviado, não mexer"; `null` = "remover o
 * limite/definir como sem restrição", mesma distinção de `Organization.updatePlan()`.
 */
export interface UpdateOrganizationPlanCommandInput {
  readonly organizationId: string;
  readonly actorId: string;
  readonly plan?: OrganizationPlan;
  readonly billingStatus?: OrganizationBillingStatus;
  readonly trialEnd?: Date | null;
  readonly maxUsers?: number | null;
  readonly enabledDomains?: string[] | null;
}

export class UpdateOrganizationPlanCommand {
  readonly organizationId: string;
  readonly actorId: string;
  readonly plan?: OrganizationPlan;
  readonly billingStatus?: OrganizationBillingStatus;
  readonly trialEnd?: Date | null;
  readonly maxUsers?: number | null;
  readonly enabledDomains?: string[] | null;

  constructor(input: UpdateOrganizationPlanCommandInput) {
    this.organizationId = input.organizationId;
    this.actorId = input.actorId;
    this.plan = input.plan;
    this.billingStatus = input.billingStatus;
    this.trialEnd = input.trialEnd;
    this.maxUsers = input.maxUsers;
    this.enabledDomains = input.enabledDomains;
    Object.freeze(this);
  }
}
