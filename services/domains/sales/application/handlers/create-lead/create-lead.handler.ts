import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Lead } from "../../../domain/aggregates/lead/lead.js";
import type { LeadRepository } from "../../../domain/repositories/lead-repository.js";
import type { CreateLeadCommand } from "../../commands/create-lead/create-lead.command.js";

/** CreateLeadHandler — Application Layer, Sales Domain (`ADR-0042`). */
export class CreateLeadHandler {
  constructor(private readonly leadRepository: LeadRepository) {}

  async execute(command: CreateLeadCommand): Promise<Result<Lead, DomainError | InfrastructureError>> {
    const createResult = Lead.create({
      organizationId: new UniqueEntityId(command.organizationId),
      name: command.name,
      email: command.email,
      phone: command.phone,
      company: command.company,
      source: command.source,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }
    const lead = createResult.getValue()!;

    const saveResult = await this.leadRepository.save(lead);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(lead);
  }
}
