import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Lead } from "../../../domain/aggregates/lead/lead.js";
import type { LeadRepository } from "../../../domain/repositories/lead-repository.js";
import type { UpdateLeadStatusCommand } from "../../commands/update-lead-status/update-lead-status.command.js";

/** UpdateLeadStatusHandler — Application Layer, Sales Domain (`ADR-0042`). */
export class UpdateLeadStatusHandler {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(command: UpdateLeadStatusCommand): Promise<Result<Lead, DomainError | InfrastructureError>> {
    const findResult = await this.leadRepository.findById(new UniqueEntityId(command.leadId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Lead "${command.leadId}" não encontrado`));
    }
    const lead = option.getOrElse(null as never);

    const updateResult = lead.updateStatus(command.status);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError()!);
    }

    const saveResult = await this.leadRepository.save(lead);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(lead);
  }
}
