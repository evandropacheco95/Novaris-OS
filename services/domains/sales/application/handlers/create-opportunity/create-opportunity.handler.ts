import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Opportunity, type CreateOpportunityInput } from "../../../domain/aggregates/opportunity/opportunity.js";
import type { OpportunityRepository } from "../../../domain/repositories/opportunity-repository.js";
import type { CreateOpportunityCommand } from "../../commands/create-opportunity/create-opportunity.command.js";

/**
 * CreateOpportunityHandler — Application Layer, Sales Domain.
 *
 * Traceability: [SALES_TECHNICAL_BLUEPRINT.md § 6](../../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md)
 * ("Candidate Commands" — `CreateOpportunity`) — [SALES_IMPLEMENTATION_READINESS.md § 6](../../../../../../knowledge/architecture/analysis/SALES_IMPLEMENTATION_READINESS.md)
 * ("Mapeia 1:1 para `Opportunity.create()`, já implementado") —
 * [SALES_DOMAIN_COMPLETION_AUDIT.md § 14](../../../../../../knowledge/architecture/analysis/SALES_DOMAIN_COMPLETION_AUDIT.md)
 * (autoriza a abertura da Application Layer exatamente para este Use Case).
 * `ENGINEERING_PLAYBOOK.md § 4` ("Handlers — Executam um Command ou Query,
 * orquestrando Domain + Repositories") — forma seguida sem alteração.
 *
 * Único ponto de conversão `string` (`CreateOpportunityCommand`) →
 * `UniqueEntityId` (`CreateOpportunityInput`) — a fronteira exata entre
 * Application Layer (dados desacoplados do domínio) e Domain Layer
 * (`ENGINEERING_PLAYBOOK.md § 4`), já registrada como responsabilidade do
 * Handler no cabeçalho de `create-opportunity.command.ts` (`ENG-0059`).
 * `pipelineId`/`currentStageId` só são convertidos quando presentes —
 * preserva a opcionalidade já definida em `CreateOpportunityInput`
 * (`opportunity.ts`), nenhuma obrigatoriedade nova inventada.
 *
 * Chama exclusivamente `Opportunity.create(input)` — nenhum outro método do
 * Aggregate, nenhuma regra de negócio própria. Se o `Result` falhar, o mesmo
 * erro (`DomainError`) é devolvido imediatamente, sem chamar o Repository —
 * nenhuma tentativa de persistir um Aggregate que nunca chegou a existir.
 *
 * Em caso de sucesso, chama `OpportunityRepository.save(opportunity)` e
 * devolve `Result.ok(opportunity)`.
 *
 * **Bug real corrigido (`ENG-0126`)**: a versão anterior aguardava `save()`
 * sem checar o `Result` — justificado à época porque a única implementação
 * existente, `InMemoryOpportunityRepository`, nunca falhava. Desde `ENG-0120`,
 * a Infrastructure real é `PrismaOpportunityRepository`, que **pode** falhar
 * (constraint, conexão) — descartar essa falha faria a API devolver
 * `Result.ok` com um Aggregate nunca persistido, exatamente o bug encontrado
 * e corrigido em `CreatePartyHandler` (Customer, `ENG-0125`). Assinatura
 * ampliada para `Result<Opportunity, DomainError | InfrastructureError>` —
 * `InfrastructureError` agora é propagado, nunca descartado.
 *
 * Não publica Domain Event, não despacha mensagem, não acessa banco
 * diretamente, não usa Mapper, Factory, Domain Service, UseCase adicional,
 * CommandBus ou qualquer framework — classe TypeScript pura, dependência
 * única injetada via construtor (`OpportunityRepository`, interface já
 * congelada, `ENG-0045`), nunca instanciada internamente.
 */
export class CreateOpportunityHandler {
  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async execute(command: CreateOpportunityCommand): Promise<Result<Opportunity, DomainError | InfrastructureError>> {
    const input: CreateOpportunityInput = {
      organizationId: new UniqueEntityId(command.organizationId),
      partyId: new UniqueEntityId(command.partyId),
      pipelineId: command.pipelineId ? new UniqueEntityId(command.pipelineId) : undefined,
      currentStageId: command.currentStageId ? new UniqueEntityId(command.currentStageId) : undefined,
    };

    const result = Opportunity.create(input);
    if (result.isFailure) {
      return Result.fail(result.getError()!);
    }

    const opportunity = result.getValue()!;
    const saveResult = await this.opportunityRepository.save(opportunity);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(opportunity);
  }
}
