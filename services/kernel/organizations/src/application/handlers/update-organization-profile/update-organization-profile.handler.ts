import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { CreateAuditEntryCommand, type CreateAuditEntryHandler } from "@novaris/audit";
import type { Organization } from "../../../domain/aggregates/organization/organization.js";
import type { OrganizationRepository } from "../../../domain/repositories/organization-repository.js";
import type { UpdateOrganizationProfileCommand } from "../../commands/update-organization-profile/update-organization-profile.command.js";

/**
 * UpdateOrganizationProfileHandler — Application Layer, Organization Domain.
 *
 * Orquestra: `UpdateOrganizationProfileCommand` →
 * `OrganizationRepository.findById()` → `Organization.updateProfile()` →
 * `OrganizationRepository.save()`. Mesmo padrão de
 * `AdvanceOpportunityStageHandler` (Sales) — `findById()`/`save()` sempre
 * verificados (`ENG-0126`). Não dispara Domain Event (`updateProfile()` não
 * emite nenhum — `organization.ts`).
 *
 * **Primeira integração real com o Audit Domain (`ADR-0035`, `ENG-0135`)**:
 * depois de salvar com sucesso, enriquece e registra um `AuditEntry`
 * (`actorId` do usuário autenticado, `changeSet` com o antes/depois só dos
 * campos de fato alterados). Falha ao registrar a auditoria **não** reverte
 * nem falha esta operação — a atualização do perfil já foi persistida com
 * sucesso antes da tentativa de auditoria; a trilha é uma preocupação
 * secundária/observacional, nunca um invariante da operação primária
 * (`ADR-0035`, seção Decision).
 */
export class UpdateOrganizationProfileHandler {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly createAuditEntryHandler: CreateAuditEntryHandler,
  ) {}

  async execute(command: UpdateOrganizationProfileCommand): Promise<Result<Organization, DomainError | InfrastructureError>> {
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

    const updateResult = organization.updateProfile({
      name: command.name,
      legalName: command.legalName,
      document: command.document,
      address: command.address,
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
        action: "OrganizationProfileUpdated",
        occurredAt: new Date(),
        origin: "api",
        changeSet: Object.keys(before).length > 0 ? { before, after } : undefined,
      }),
    );

    return Result.ok(organization);
  }
}

/** Recorta só os campos presentes em `command` — nunca o objeto inteiro, para não fabricar um "antes"/"depois" de campos não tocados. */
function snapshotChangedFields(organization: Organization, command: UpdateOrganizationProfileCommand): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  if (command.name !== undefined) snapshot.name = organization.name;
  if (command.legalName !== undefined) snapshot.legalName = organization.legalName;
  if (command.document !== undefined) snapshot.document = organization.document;
  if (command.address !== undefined) snapshot.address = organization.address;
  return snapshot;
}
