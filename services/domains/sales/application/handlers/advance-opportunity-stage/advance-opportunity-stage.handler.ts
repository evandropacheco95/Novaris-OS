import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Opportunity } from "../../../domain/aggregates/opportunity/opportunity.js";
import type { OpportunityRepository } from "../../../domain/repositories/opportunity-repository.js";
import type { AdvanceOpportunityStageCommand } from "../../commands/advance-opportunity-stage/advance-opportunity-stage.command.js";

/**
 * AdvanceOpportunityStageHandler — Application Layer, Sales Domain.
 *
 * Traceability: [SALES_TECHNICAL_BLUEPRINT.md § 6](../../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md)
 * ("Candidate Commands" — `AdvanceOpportunityStage`) —
 * [SALES_DOMAIN_COMPLETION_AUDIT.md § 14](../../../../../../knowledge/architecture/analysis/SALES_DOMAIN_COMPLETION_AUDIT.md)
 * (autoriza a abertura da Application Layer exatamente para este Use Case).
 * Mesmo padrão estrutural de
 * [create-opportunity.handler.ts](../create-opportunity/create-opportunity.handler.ts)
 * (`ENG-0060`) — dependência única injetada via construtor, conversão
 * `string` → `UniqueEntityId` como única lógica própria do Handler.
 *
 * Converte `command.opportunityId`/`command.stageId` para `UniqueEntityId`,
 * localiza o Aggregate via `OpportunityRepository.findById()`. Se a
 * `Option` devolvida for `None`, retorna imediatamente `Result.fail(new
 * NotFoundError(...))` — reutiliza exclusivamente o erro já existente do
 * Shared Kernel (`NotFoundError`, mesmo usado em
 * `Opportunity.approveProposal()` para o caso análogo de `Proposal`
 * inexistente), nenhum erro novo criado.
 *
 * **Bug real corrigido (`ENG-0126`)**: `findById()`/`save()` agora têm seus
 * `Result` checados — a versão anterior lia `findById().getValue()!` e
 * chamava `save()` sem checar, justificado à época por
 * `InMemoryOpportunityRepository` nunca falhar. Desde `ENG-0120`, a
 * Infrastructure real é `PrismaOpportunityRepository`, que pode falhar
 * (mesmo achado de `create-opportunity.handler.ts`). Assinatura ampliada
 * para `Result<Opportunity, DomainError | InfrastructureError>`.
 *
 * Quando encontrado, chama exclusivamente `opportunity.advanceStage(stageId)`
 * — nenhum outro método do Aggregate. Se o `Result` falhar, o mesmo erro é
 * propagado sem adaptação (`advanceResult.getError()!`, nunca reembalado ou
 * reinterpretado). Em caso de sucesso, persiste via `OpportunityRepository.save()`
 * e devolve `Result.ok(opportunity)`.
 *
 * Não valida stage, pipeline, organização, status ou a própria `Opportunity`
 * — toda invariante permanece exclusivamente em `Opportunity.advanceStage()`.
 * Não publica Domain Event (`advanceStage()` não dispara nenhum — confirmado
 * em `opportunity.ts`), não acessa Mapper, Infrastructure concreta ou banco
 * diretamente — classe TypeScript pura.
 */
export class AdvanceOpportunityStageHandler {
  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async execute(command: AdvanceOpportunityStageCommand): Promise<Result<Opportunity, DomainError | InfrastructureError>> {
    const opportunityId = new UniqueEntityId(command.opportunityId);
    const stageId = new UniqueEntityId(command.stageId);

    const findResult = await this.opportunityRepository.findById(opportunityId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;

    if (option.isNone) {
      return Result.fail(new NotFoundError(`Opportunity "${command.opportunityId}" não encontrada`));
    }

    const opportunity = option.getOrElse(null as never);

    const advanceResult = opportunity.advanceStage(stageId);
    if (advanceResult.isFailure) {
      return Result.fail(advanceResult.getError()!);
    }

    const saveResult = await this.opportunityRepository.save(opportunity);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(opportunity);
  }
}
