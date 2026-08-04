import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { CreateAuditEntryCommand, type CreateAuditEntryHandler } from "@novaris/audit";
import type { Organization } from "../../../domain/aggregates/organization/organization.js";
import type { OrganizationRepository } from "../../../domain/repositories/organization-repository.js";
import type { UpdateOrganizationPlanCommand } from "../../commands/update-organization-plan/update-organization-plan.command.js";

/**
 * UpdateOrganizationPlanHandler — Application Layer, Organization Domain
 * (`ENG-0164`). Mesmo padrão de `UpdateOrganizationProfileHandler`:
 * `findById()` → `Organization.updatePlan()` → `save()` → `AuditEntry`
 * (falha de auditoria não reverte a operação primária, `ADR-0035`).
 */
export class UpdateOrganizationPlanHandler {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly createAuditEntryHandler: CreateAuditEntryHandler,
  ) {}

  async execute(command: UpdateOrganizationPlanCommand): Promise<Result<Organization, DomainError | InfrastructureError>> {
    const organizationId = new UniqueEntityId(command.organizationId);

    const findResult = await this.organizationRepository.findById(organizationId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Organization "${command.organizationId}" não encontrada`));
    }

    const organization = option.getOrElse(null as never);
    const before = snapshotChangedFields(organization, command);

    const updateResult = organization.updatePlan({
      plan: command.plan,
      billingStatus: command.billingStatus,
      trialEnd: command.trialEnd,
      maxUsers: command.maxUsers,
      enabledDomains: command.enabledDomains,
    });
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError()!);
    }

    const saveResult = await this.organizationRepository.save(organization);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    const after = snapshotChangedFields(organization, command);
    await this.createAuditEntryHandler.execute(
      new CreateAuditEntryCommand({
        actorId: command.actorId,
        organizationId: command.organizationId,
        targetId: command.organizationId,
        targetType: "Organization",
        action: "OrganizationPlanUpdated",
        occurredAt: new Date(),
        origin: "api",
        changeSet: Object.keys(before).length > 0 ? { before, after } : undefined,
      }),
    );

    return Result.ok(organization);
  }
}

/** Recorta só os campos presentes em `command` — nunca o objeto inteiro, para não fabricar um "antes"/"depois" de campos não tocados. */
function snapshotChangedFields(organization: Organization, command: UpdateOrganizationPlanCommand): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  if (command.plan !== undefined) snapshot.plan = organization.plan;
  if (command.billingStatus !== undefined) snapshot.billingStatus = organization.billingStatus;
  if (command.trialEnd !== undefined) snapshot.trialEnd = organization.trialEnd ?? null;
  if (command.maxUsers !== undefined) snapshot.maxUsers = organization.maxUsers ?? null;
  if (command.enabledDomains !== undefined) snapshot.enabledDomains = organization.enabledDomains ?? null;
  return snapshot;
}
