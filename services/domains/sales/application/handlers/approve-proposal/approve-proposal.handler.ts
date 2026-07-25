import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Proposal } from "../../../domain/entities/proposal/proposal.js";
import type { OpportunityRepository } from "../../../domain/repositories/opportunity-repository.js";
import type { ApproveProposalCommand } from "../../commands/approve-proposal/approve-proposal.command.js";

/**
 * ApproveProposalHandler — Application Layer, Sales Domain.
 *
 * Orquestra: `ApproveProposalCommand` → `OpportunityRepository.findById()` →
 * `Opportunity.approveProposal(proposalId)` → `OpportunityRepository.save()` →
 * `Result<Proposal, DomainError>`. Mesmo padrão estrutural de
 * `create-opportunity.handler.ts` (`ENG-0060`), `advance-opportunity-stage.handler.ts`
 * (`ENG-0062`) e `submit-proposal.handler.ts` (`ENG-0064`) — dependência
 * única injetada via construtor, conversão `string` → `UniqueEntityId` como
 * única lógica própria do Handler.
 *
 * Converte `command.opportunityId`/`command.proposalId` para `UniqueEntityId`,
 * localiza o Aggregate via `OpportunityRepository.findById()`. Se a `Option`
 * devolvida for `None`, retorna imediatamente `Result.fail(new
 * NotFoundError(...))` — reutiliza exclusivamente o erro já existente do
 * Shared Kernel, mesmo padrão de `advance-opportunity-stage.handler.ts`/
 * `submit-proposal.handler.ts`, nenhum erro novo criado.
 *
 * **Bug real corrigido (`ENG-0126`)**: `findById()`/`save()` agora têm seus
 * `Result` checados — mesmo achado/correção de `advance-opportunity-stage.handler.ts`.
 * Assinatura ampliada para `Result<Proposal, DomainError | InfrastructureError>`.
 *
 * Quando encontrado, chama exclusivamente `opportunity.approveProposal(proposalId)`
 * — nenhuma outra operação de mutação no Aggregate. Se o `Result` falhar
 * (`ConflictError`/`NotFoundError` internos, ex.: `Proposal` já aprovada ou
 * inexistente na coleção), o mesmo erro é propagado sem adaptação
 * (`approveResult.getError()!`). Em caso de sucesso, persiste via
 * `OpportunityRepository.save(opportunity)`.
 *
 * **Achado técnico registrado, não silencioso**: `Opportunity.approveProposal()`
 * devolve `Result<void, DomainError>` — nunca a `Proposal` em si (`opportunity.ts`).
 * Para satisfazer a assinatura de retorno exigida por esta Ordem de Missão
 * (`Result<Proposal, DomainError>`, "a mesma instância devolvida pelo
 * Aggregate"), o Handler chama `opportunity.findProposal(proposalId)` após o
 * sucesso — uma leitura pura, sem mutação, sem evento, sem regra de negócio
 * própria (mesma natureza de `getStages()`/`getProposals()`, métodos de
 * consulta já existentes no Aggregate), não uma "outra operação" no sentido
 * de mutação que o Passo 5 restringe. Devolve exatamente a mesma instância de
 * `Proposal` que `proposal.approve()` já mutou internamente (mesma referência
 * de objeto, não uma cópia).
 *
 * Não valida `Proposal` manualmente, não altera status diretamente, não cria
 * `Proposal`, não publica `ProposalApproved` (isso é responsabilidade
 * exclusiva de `Opportunity.approveProposal()`), não acessa Mapper,
 * Infrastructure concreta ou banco diretamente — classe TypeScript pura.
 */
export class ApproveProposalHandler {
  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async execute(command: ApproveProposalCommand): Promise<Result<Proposal, DomainError | InfrastructureError>> {
    const opportunityId = new UniqueEntityId(command.opportunityId);
    const proposalId = new UniqueEntityId(command.proposalId);

    const findResult = await this.opportunityRepository.findById(opportunityId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;

    if (option.isNone) {
      return Result.fail(new NotFoundError(`Opportunity "${command.opportunityId}" não encontrada`));
    }

    const opportunity = option.getOrElse(null as never);

    const approveResult = opportunity.approveProposal(proposalId);
    if (approveResult.isFailure) {
      return Result.fail(approveResult.getError()!);
    }

    const saveResult = await this.opportunityRepository.save(opportunity);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(opportunity.findProposal(proposalId)!);
  }
}
