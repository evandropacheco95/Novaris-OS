// Sales Domain Service — barrel de exportação pública.
// Populado conforme cada camada de domain/ ganha implementação real —
// mesmo padrão de services/kernel/organizations/src/index.ts (ENG-0003.7).
//
// Nota estrutural (ENG-0051): este pacote não segue o layout `src/domain/`
// já usado no Kernel — `domain/`, `application/`, `infrastructure/`,
// `contracts/` vivem na raiz do pacote (`services/domains/sales/`), não sob
// `src/`, porque `ENG-0037` (Domain Skeleton) já os criou assim, seguindo o
// exemplo literal de `SALES_TECHNICAL_BLUEPRINT.md § 4`. `src/` contém
// apenas este barrel — divergência registrada, não corrigida
// retroativamente (moveria/alteraria arquivos de Aggregate já implementados,
// fora do escopo desta missão).
//
// Não exporta: Records de persistência (`infrastructure/persistence/`),
// Mappers (`infrastructure/mappers/`) ou implementações concretas de
// Repository (`infrastructure/repositories/`) — infraestrutura interna, só a
// interface de Repository é pública, mesmo padrão de `organizations`.

export {
  Opportunity,
  type OpportunityProps,
  type OpportunityStatus,
  type CreateOpportunityInput,
} from "../domain/aggregates/opportunity/opportunity.js";

export { Pipeline, type PipelineProps, type CreatePipelineInput } from "../domain/aggregates/pipeline/pipeline.js";

export {
  Proposal,
  type ProposalProps,
  type ProposalStatus,
  type CreateProposalInput,
} from "../domain/entities/proposal/proposal.js";

export { Stage, type StageProps, type CreateStageInput } from "../domain/entities/stage/stage.js";

export { OpportunityCreated } from "../domain/events/opportunity-created.js";
export { OpportunityWon } from "../domain/events/opportunity-won.js";
export { OpportunityLost } from "../domain/events/opportunity-lost.js";
export { ProposalApproved } from "../domain/events/proposal-approved.js";

export type { OpportunityRepository } from "../domain/repositories/opportunity-repository.js";
export type { PipelineRepository } from "../domain/repositories/pipeline-repository.js";

// Lead (`ADR-0042`) — adaptado do Lead-to-Convert do Salesforce, por
// autorização direta do CTO. Vive em Sales (não Customer) por
// `DOMAIN_MODEL.md § DEPENDÊNCIAS` — ver `ADR-0042 § Decision`.
export { Lead, type LeadProps, type LeadStatus, type CreateLeadInput } from "../domain/aggregates/lead/lead.js";
export { LeadCreated } from "../domain/events/lead-created.js";
export { LeadConverted } from "../domain/events/lead-converted.js";
export type { LeadRepository } from "../domain/repositories/lead-repository.js";

// Product + Quotation (`ADR-0043`) — adaptados do Salesforce Product2/Quote,
// preenchendo a lacuna de `Quotation` já reservada desde `ADR-0020`.
export { Product, type ProductProps, type CreateProductInput } from "../domain/aggregates/product/product.js";
export type { ProductRepository } from "../domain/repositories/product-repository.js";

export { Quotation, type QuotationProps, type QuotationStatus, type CreateQuotationInput } from "../domain/aggregates/quotation/quotation.js";
export {
  QuotationLineItem,
  type QuotationLineItemProps,
  type CreateQuotationLineItemInput,
} from "../domain/entities/quotation-line-item/quotation-line-item.js";
export { QuotationCreated } from "../domain/events/quotation-created.js";
export { QuotationAccepted } from "../domain/events/quotation-accepted.js";
export { QuotationRejected } from "../domain/events/quotation-rejected.js";
export type { QuotationRepository } from "../domain/repositories/quotation-repository.js";

// Contract (`ADR-0044`) — gerado a partir de uma Quotation `accepted`.
export { Contract, type ContractProps, type ContractStatus, type CreateContractInput } from "../domain/aggregates/contract/contract.js";
export { ContractCreated } from "../domain/events/contract-created.js";
export { ContractActivated } from "../domain/events/contract-activated.js";
export { ContractTerminated } from "../domain/events/contract-terminated.js";
export type { ContractRepository } from "../domain/repositories/contract-repository.js";

// Revenue (`ADR-0047`) — gerado a partir de um Contract `active`, sem estados.
export { Revenue, type RevenueProps, type CreateRevenueInput } from "../domain/aggregates/revenue/revenue.js";
export type { RevenueRepository } from "../domain/repositories/revenue-repository.js";

// Application Layer (Commands + Handlers) — adicionado nesta fase ("Sales de
// ponta a ponta") para permitir que uma Composition Root real (`apps/api`)
// monte os casos de uso completos. Não exportado até agora porque nenhum
// consumidor externo existia — mesma disciplina de "popular conforme a
// camada ganha uso real" já declarada no topo deste arquivo.
export { CreateOpportunityCommand } from "../application/commands/create-opportunity/create-opportunity.command.js";
export { AdvanceOpportunityStageCommand } from "../application/commands/advance-opportunity-stage/advance-opportunity-stage.command.js";
export { SubmitProposalCommand } from "../application/commands/submit-proposal/submit-proposal.command.js";
export { ApproveProposalCommand } from "../application/commands/approve-proposal/approve-proposal.command.js";
export { MarkOpportunityWonCommand } from "../application/commands/mark-opportunity-won/mark-opportunity-won.command.js";
export { MarkOpportunityLostCommand } from "../application/commands/mark-opportunity-lost/mark-opportunity-lost.command.js";

export { CreateOpportunityHandler } from "../application/handlers/create-opportunity/create-opportunity.handler.js";
export { AdvanceOpportunityStageHandler } from "../application/handlers/advance-opportunity-stage/advance-opportunity-stage.handler.js";
export { SubmitProposalHandler } from "../application/handlers/submit-proposal/submit-proposal.handler.js";
export { ApproveProposalHandler } from "../application/handlers/approve-proposal/approve-proposal.handler.js";
export { MarkOpportunityWonHandler } from "../application/handlers/mark-opportunity-won/mark-opportunity-won.handler.js";
export { MarkOpportunityLostHandler } from "../application/handlers/mark-opportunity-lost/mark-opportunity-lost.handler.js";

export { CreateLeadCommand } from "../application/commands/create-lead/create-lead.command.js";
export { CreateLeadHandler } from "../application/handlers/create-lead/create-lead.handler.js";
export { UpdateLeadStatusCommand } from "../application/commands/update-lead-status/update-lead-status.command.js";
export { UpdateLeadStatusHandler } from "../application/handlers/update-lead-status/update-lead-status.handler.js";
export { ConvertLeadCommand } from "../application/commands/convert-lead/convert-lead.command.js";
export { ConvertLeadHandler } from "../application/handlers/convert-lead/convert-lead.handler.js";

export { CreateProductCommand } from "../application/commands/create-product/create-product.command.js";
export { CreateProductHandler } from "../application/handlers/create-product/create-product.handler.js";
export { UpdateProductPriceCommand } from "../application/commands/update-product-price/update-product-price.command.js";
export { UpdateProductPriceHandler } from "../application/handlers/update-product-price/update-product-price.handler.js";
export { DeactivateProductCommand } from "../application/commands/deactivate-product/deactivate-product.command.js";
export { DeactivateProductHandler } from "../application/handlers/deactivate-product/deactivate-product.handler.js";
export { ActivateProductCommand } from "../application/commands/activate-product/activate-product.command.js";
export { ActivateProductHandler } from "../application/handlers/activate-product/activate-product.handler.js";

export { CreateQuotationCommand } from "../application/commands/create-quotation/create-quotation.command.js";
export { CreateQuotationHandler } from "../application/handlers/create-quotation/create-quotation.handler.js";
export { AddQuotationLineItemCommand } from "../application/commands/add-quotation-line-item/add-quotation-line-item.command.js";
export { AddQuotationLineItemHandler } from "../application/handlers/add-quotation-line-item/add-quotation-line-item.handler.js";
export { SendQuotationCommand } from "../application/commands/send-quotation/send-quotation.command.js";
export { SendQuotationHandler } from "../application/handlers/send-quotation/send-quotation.handler.js";
export { AcceptQuotationCommand } from "../application/commands/accept-quotation/accept-quotation.command.js";
export { AcceptQuotationHandler } from "../application/handlers/accept-quotation/accept-quotation.handler.js";
export { RejectQuotationCommand } from "../application/commands/reject-quotation/reject-quotation.command.js";
export { RejectQuotationHandler } from "../application/handlers/reject-quotation/reject-quotation.handler.js";

export { GenerateContractFromQuotationCommand } from "../application/commands/generate-contract-from-quotation/generate-contract-from-quotation.command.js";
export { GenerateContractFromQuotationHandler } from "../application/handlers/generate-contract-from-quotation/generate-contract-from-quotation.handler.js";
export { ActivateContractCommand } from "../application/commands/activate-contract/activate-contract.command.js";
export { ActivateContractHandler } from "../application/handlers/activate-contract/activate-contract.handler.js";
export { TerminateContractCommand } from "../application/commands/terminate-contract/terminate-contract.command.js";
export { TerminateContractHandler } from "../application/handlers/terminate-contract/terminate-contract.handler.js";
export { GenerateRevenueFromContractCommand } from "../application/commands/generate-revenue-from-contract/generate-revenue-from-contract.command.js";
export { GenerateRevenueFromContractHandler } from "../application/handlers/generate-revenue-from-contract/generate-revenue-from-contract.handler.js";

// Contracts Layer — Root Barrel já congelado (SALES_CONTRACTS_FREEZE_V2.md),
// reexportado aqui sem alteração.
export * from "../contracts/index.js";

// Factories de Infrastructure — mantêm as classes concretas de Repository
// privadas ao pacote (nunca exportadas diretamente, mesmo padrão já declarado
// no topo deste arquivo: "só a interface de Repository é pública"); uma
// Composition Root externa (`apps/api`) recebe uma instância já pronta,
// tipada apenas pela interface pública.
export {
  createOpportunityRepository,
  createPipelineRepository,
  createLeadRepository,
  createProductRepository,
  createQuotationRepository,
  createContractRepository,
  createRevenueRepository,
} from "../infrastructure/factories.js";
