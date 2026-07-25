import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Proposal } from "../../../domain/entities/proposal/proposal.js";
import type { OpportunityRepository } from "../../../domain/repositories/opportunity-repository.js";
import type { SubmitProposalCommand } from "../../commands/submit-proposal/submit-proposal.command.js";

/**
 * SubmitProposalHandler — Application Layer, Sales Domain.
 *
 * Traceability: [SALES_SUBMIT_PROPOSAL_DESIGN.md § 4](../../../../../../knowledge/architecture/analysis/SALES_SUBMIT_PROPOSAL_DESIGN.md)
 * (Option B — `Opportunity` cria a `Proposal` internamente; "o Command
 * `SubmitProposal`, quando implementado, deve chamar `opportunity.submitProposal()`,
 * nunca `Proposal.create()` diretamente") —
 * [SALES_DOMAIN_COMPLETION_AUDIT.md § 14](../../../../../../knowledge/architecture/analysis/SALES_DOMAIN_COMPLETION_AUDIT.md)
 * (autoriza a abertura da Application Layer exatamente para este Use Case).
 * Mesmo padrão estrutural de
 * [create-opportunity.handler.ts](../create-opportunity/create-opportunity.handler.ts)
 * (`ENG-0060`) e [advance-opportunity-stage.handler.ts](../advance-opportunity-stage/advance-opportunity-stage.handler.ts)
 * (`ENG-0062`) — dependência única injetada via construtor, conversão
 * `string` → `UniqueEntityId` como única lógica própria do Handler.
 *
 * Converte `command.opportunityId` para `UniqueEntityId`, localiza o
 * Aggregate via `OpportunityRepository.findById()`. Se a `Option` devolvida
 * for `None`, retorna imediatamente `Result.fail(new NotFoundError(...))` —
 * reutiliza exclusivamente o erro já existente do Shared Kernel, mesmo usado
 * em `advance-opportunity-stage.handler.ts` (`ENG-0062`) para o caso análogo,
 * nenhum erro novo criado.
 *
 * **Bug real corrigido (`ENG-0126`)**: `findById()`/`save()` agora têm seus
 * `Result` checados — mesmo achado/correção de `advance-opportunity-stage.handler.ts`.
 * Assinatura ampliada para `Result<Proposal, DomainError | InfrastructureError>`.
 *
 * Quando encontrado, chama exclusivamente `opportunity.submitProposal()` —
 * **sem nenhum parâmetro** (não cria `Proposal` manualmente, não chama
 * `Proposal.create()`, não monta `CreateProposalInput`; toda criação
 * pertence exclusivamente ao Aggregate, que já internaliza essa chamada,
 * `opportunity.ts`, `ENG-0049`). Se o `Result` falhar, o mesmo erro é
 * propagado sem adaptação (`submitResult.getError()!`). Em caso de sucesso,
 * persiste via `OpportunityRepository.save(opportunity)` (mesma Aggregate
 * Root, agora com a nova `Proposal` em sua coleção interna) e devolve
 * `Result.ok(proposal)` — exatamente a `Proposal` já retornada por
 * `submitProposal()`, nunca reconstruída ou reembalada.
 *
 * Não valida `Opportunity`, `Proposal`, `Pipeline` ou `Stage` — toda
 * invariante permanece exclusivamente em `Opportunity.submitProposal()`
 * (que já delega a `Proposal.create()` e `addProposal()` internamente). Não
 * publica Domain Event (`submitProposal()` não dispara nenhum — confirmado em
 * `opportunity.ts`), não acessa Mapper, Infrastructure concreta ou banco
 * diretamente — classe TypeScript pura.
 */
export class SubmitProposalHandler {
  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async execute(command: SubmitProposalCommand): Promise<Result<Proposal, DomainError | InfrastructureError>> {
    const opportunityId = new UniqueEntityId(command.opportunityId);

    const findResult = await this.opportunityRepository.findById(opportunityId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;

    if (option.isNone) {
      return Result.fail(new NotFoundError(`Opportunity "${command.opportunityId}" não encontrada`));
    }

    const opportunity = option.getOrElse(null as never);

    const submitResult = opportunity.submitProposal();
    if (submitResult.isFailure) {
      return Result.fail(submitResult.getError()!);
    }

    const saveResult = await this.opportunityRepository.save(opportunity);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(submitResult.getValue()!);
  }
}
