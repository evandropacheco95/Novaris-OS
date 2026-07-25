import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { CreatePartyCommand, type CreatePartyHandler } from "@novaris/customer";
import type { Lead } from "../../../domain/aggregates/lead/lead.js";
import type { LeadRepository } from "../../../domain/repositories/lead-repository.js";
import { CreateOpportunityCommand } from "../../commands/create-opportunity/create-opportunity.command.js";
import type { CreateOpportunityHandler } from "../create-opportunity/create-opportunity.handler.js";
import type { ConvertLeadCommand } from "../../commands/convert-lead/convert-lead.command.js";

/**
 * ConvertLeadHandler — Application Layer, Sales Domain (`ADR-0042`).
 *
 * Primeira composição real entre 2 Business Domains desta engenharia (Sales
 * → Customer) — mesmo mecanismo de Dependency Injection já usado por
 * `ADR-0035` (Audit): o Handler de origem recebe o Handler do outro domínio
 * injetado no construtor e o chama diretamente. Diferença central em
 * relação a `ADR-0035`: ali, a chamada ao outro domínio era um efeito
 * colateral observacional (falha não reverte a operação primária). Aqui,
 * criar o `Party` **é** o propósito da conversão — se falhar, a conversão
 * inteira falha, nada é persistido.
 *
 * `partyType` é decidido por quem converte (não inferido automaticamente) —
 * mesma disciplina de não inventar regra de negócio sem evidência. Quando
 * `partyType === "external_organization"` e o Lead tem `company`, usa
 * `company` como nome do `Party` (mais correto para uma organização do que
 * o nome do contato); caso contrário, usa `name` do próprio Lead.
 */
export class ConvertLeadHandler {
  constructor(
    private readonly leadRepository: LeadRepository,
    private readonly createPartyHandler: CreatePartyHandler,
    private readonly createOpportunityHandler: CreateOpportunityHandler,
  ) {}

  async execute(command: ConvertLeadCommand): Promise<Result<Lead, DomainError | InfrastructureError>> {
    const findResult = await this.leadRepository.findById(new UniqueEntityId(command.leadId));
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Lead "${command.leadId}" não encontrado`));
    }
    const lead = option.getOrElse(null as never);

    const partyName = command.partyType === "external_organization" && lead.company ? lead.company : lead.name;
    const createPartyResult = await this.createPartyHandler.execute(
      new CreatePartyCommand({
        organizationId: lead.organizationId.toString(),
        partyType: command.partyType,
        name: partyName,
      }),
    );
    if (createPartyResult.isFailure) {
      return Result.fail(createPartyResult.getError()!);
    }
    const party = createPartyResult.getValue()!;

    let opportunityId: UniqueEntityId | undefined;
    if (command.createOpportunity) {
      const createOpportunityResult = await this.createOpportunityHandler.execute(
        new CreateOpportunityCommand({
          organizationId: lead.organizationId.toString(),
          partyId: party.id.toString(),
          pipelineId: command.pipelineId,
          currentStageId: command.currentStageId,
        }),
      );
      if (createOpportunityResult.isFailure) {
        return Result.fail(createOpportunityResult.getError()!);
      }
      opportunityId = createOpportunityResult.getValue()!.id;
    }

    const convertResult = lead.convert(party.id, opportunityId);
    if (convertResult.isFailure) {
      return Result.fail(convertResult.getError()!);
    }

    const saveResult = await this.leadRepository.save(lead);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(lead);
  }
}
