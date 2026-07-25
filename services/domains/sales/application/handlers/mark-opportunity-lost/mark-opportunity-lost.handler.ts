import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Opportunity } from "../../../domain/aggregates/opportunity/opportunity.js";
import type { OpportunityRepository } from "../../../domain/repositories/opportunity-repository.js";
import type { MarkOpportunityLostCommand } from "../../commands/mark-opportunity-lost/mark-opportunity-lost.command.js";

/**
 * MarkOpportunityLostHandler — Application Layer, Sales Domain.
 *
 * Orquestra: `MarkOpportunityLostCommand` → `OpportunityRepository.findById()`
 * → `Opportunity.markLost()` → `OpportunityRepository.save()` →
 * `Result<Opportunity, DomainError>`. Mesmo padrão estrutural de
 * `create-opportunity.handler.ts` (`ENG-0060`), `advance-opportunity-stage.handler.ts`
 * (`ENG-0062`), `submit-proposal.handler.ts` (`ENG-0064`),
 * `approve-proposal.handler.ts` (`ENG-0066`) e `mark-opportunity-won.handler.ts`
 * (`ENG-0068`) — dependência única injetada via construtor, conversão
 * `string` → `UniqueEntityId` como única lógica própria do Handler.
 *
 * Converte `command.opportunityId` para `UniqueEntityId`, localiza o
 * Aggregate via `OpportunityRepository.findById()`. Se a `Option` devolvida
 * for `None`, retorna imediatamente `Result.fail(new NotFoundError(...))` —
 * reutiliza exclusivamente o erro já existente do Shared Kernel, mesmo
 * padrão dos Handlers anteriores, nenhum erro novo criado.
 *
 * **Bug real corrigido (`ENG-0126`)**: `findById()`/`save()` agora têm seus
 * `Result` checados — mesmo achado/correção de `advance-opportunity-stage.handler.ts`.
 * Assinatura ampliada para `Result<Opportunity, DomainError | InfrastructureError>`.
 *
 * Quando encontrado, chama exclusivamente `opportunity.markLost()` — nenhuma
 * outra operação no Aggregate. Se o `Result` falhar (`ConflictError`, ex.:
 * `Opportunity` já fechada), o mesmo erro é propagado sem adaptação
 * (`markLostResult.getError()!`). Em caso de sucesso, persiste via
 * `OpportunityRepository.save(opportunity)` e devolve `Result.ok(opportunity)`
 * — a mesma instância já mutada pelo Aggregate.
 *
 * Não valida motivo de perda, classificação, concorrente, receita perdida ou
 * usuário responsável, não cria Domain Event diretamente (`OpportunityLost`
 * é disparado pelo próprio `markLost()`, `opportunity.ts`), não acessa
 * Mapper, Infrastructure concreta ou banco diretamente — classe TypeScript
 * pura.
 */
export class MarkOpportunityLostHandler {
  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async execute(command: MarkOpportunityLostCommand): Promise<Result<Opportunity, DomainError | InfrastructureError>> {
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

    const markLostResult = opportunity.markLost();
    if (markLostResult.isFailure) {
      return Result.fail(markLostResult.getError()!);
    }

    const saveResult = await this.opportunityRepository.save(opportunity);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(opportunity);
  }
}
