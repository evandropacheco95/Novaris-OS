import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import {
  createOpportunityRepository,
  createLeadRepository,
  createProductRepository,
  createQuotationRepository,
  createContractRepository,
  createRevenueRepository,
  CreateOpportunityHandler,
  AdvanceOpportunityStageHandler,
  SubmitProposalHandler,
  ApproveProposalHandler,
  MarkOpportunityWonHandler,
  MarkOpportunityLostHandler,
  CreateLeadHandler,
  UpdateLeadStatusHandler,
  ConvertLeadHandler,
  CreateProductHandler,
  UpdateProductPriceHandler,
  CreateQuotationHandler,
  AddQuotationLineItemHandler,
  SendQuotationHandler,
  AcceptQuotationHandler,
  RejectQuotationHandler,
  GenerateContractFromQuotationHandler,
  ActivateContractHandler,
  TerminateContractHandler,
  GenerateRevenueFromContractHandler,
} from "@novaris/sales";
import { CreatePartyHandler } from "@novaris/customer";
import { AuthModule } from "../auth/auth.module.js";
import { CustomerModule } from "../customer/customer.module.js";
import { OpportunityController } from "./opportunity.controller.js";
import { LeadController } from "./lead.controller.js";
import { ProductController } from "./product.controller.js";
import { QuotationController } from "./quotation.controller.js";
import { ContractController } from "./contract.controller.js";
import { RevenueController } from "./revenue.controller.js";

const OPPORTUNITY_REPOSITORY = "OPPORTUNITY_REPOSITORY";
const LEAD_REPOSITORY = "LEAD_REPOSITORY";
const PRODUCT_REPOSITORY = "PRODUCT_REPOSITORY";
const QUOTATION_REPOSITORY = "QUOTATION_REPOSITORY";
const CONTRACT_REPOSITORY = "CONTRACT_REPOSITORY";
const REVENUE_REPOSITORY = "REVENUE_REPOSITORY";

/**
 * SalesModule — Composition Root do Sales Domain dentro da API. Único lugar
 * onde a implementação concreta de Infrastructure (`PrismaOpportunityRepository`,
 * via `createOpportunityRepository()`) é instanciada e conectada aos Handlers
 * da Application Layer — nem o Controller, nem os Handlers, nem o Domain
 * conhecem Prisma diretamente. Os 6 Handlers do Sales Domain compartilham a
 * mesma instância de `OpportunityRepository` (token `OPPORTUNITY_REPOSITORY`),
 * mesmo padrão já usado para `CreateOpportunityHandler`.
 *
 * Importa `AuthModule` (`ENG-0122`) para que `OpportunityController` possa
 * usar `@UseGuards(JwtAuthGuard)` — `JwtAuthGuard`/`JwtModule` são exportados
 * por `AuthModule`, não redeclarados aqui.
 */
@Module({
  imports: [AuthModule, CustomerModule],
  controllers: [OpportunityController, LeadController, ProductController, QuotationController, ContractController, RevenueController],
  providers: [
    {
      provide: OPPORTUNITY_REPOSITORY,
      useFactory: () => createOpportunityRepository(prisma),
    },
    {
      provide: CreateOpportunityHandler,
      useFactory: (repository: ReturnType<typeof createOpportunityRepository>) => new CreateOpportunityHandler(repository),
      inject: [OPPORTUNITY_REPOSITORY],
    },
    {
      provide: AdvanceOpportunityStageHandler,
      useFactory: (repository: ReturnType<typeof createOpportunityRepository>) => new AdvanceOpportunityStageHandler(repository),
      inject: [OPPORTUNITY_REPOSITORY],
    },
    {
      provide: SubmitProposalHandler,
      useFactory: (repository: ReturnType<typeof createOpportunityRepository>) => new SubmitProposalHandler(repository),
      inject: [OPPORTUNITY_REPOSITORY],
    },
    {
      provide: ApproveProposalHandler,
      useFactory: (repository: ReturnType<typeof createOpportunityRepository>) => new ApproveProposalHandler(repository),
      inject: [OPPORTUNITY_REPOSITORY],
    },
    {
      provide: MarkOpportunityWonHandler,
      useFactory: (repository: ReturnType<typeof createOpportunityRepository>) => new MarkOpportunityWonHandler(repository),
      inject: [OPPORTUNITY_REPOSITORY],
    },
    {
      provide: MarkOpportunityLostHandler,
      useFactory: (repository: ReturnType<typeof createOpportunityRepository>) => new MarkOpportunityLostHandler(repository),
      inject: [OPPORTUNITY_REPOSITORY],
    },
    {
      // OpportunityController injeta a interface diretamente (token de string
      // porque TypeScript interfaces não existem em tempo de execução — mesmo
      // padrão de Dependency Injection já usado por NestJS para Ports/Contracts).
      provide: "OpportunityRepository",
      useExisting: OPPORTUNITY_REPOSITORY,
    },
    {
      provide: LEAD_REPOSITORY,
      useFactory: () => createLeadRepository(prisma),
    },
    {
      provide: CreateLeadHandler,
      useFactory: (repository: ReturnType<typeof createLeadRepository>) => new CreateLeadHandler(repository),
      inject: [LEAD_REPOSITORY],
    },
    {
      provide: UpdateLeadStatusHandler,
      useFactory: (repository: ReturnType<typeof createLeadRepository>) => new UpdateLeadStatusHandler(repository),
      inject: [LEAD_REPOSITORY],
    },
    {
      // Primeira composição real entre 2 Business Domains (`ADR-0042`) —
      // `CreatePartyHandler` vem de `CustomerModule` (importado acima),
      // exportado de lá explicitamente por esse motivo. Reaproveita a mesma
      // instância de `CreateOpportunityHandler` já provida acima, não cria
      // uma segunda.
      provide: ConvertLeadHandler,
      useFactory: (
        leadRepository: ReturnType<typeof createLeadRepository>,
        createPartyHandler: CreatePartyHandler,
        createOpportunityHandler: CreateOpportunityHandler,
      ) => new ConvertLeadHandler(leadRepository, createPartyHandler, createOpportunityHandler),
      inject: [LEAD_REPOSITORY, CreatePartyHandler, CreateOpportunityHandler],
    },
    {
      provide: "LeadRepository",
      useExisting: LEAD_REPOSITORY,
    },
    {
      provide: PRODUCT_REPOSITORY,
      useFactory: () => createProductRepository(prisma),
    },
    {
      provide: CreateProductHandler,
      useFactory: (repository: ReturnType<typeof createProductRepository>) => new CreateProductHandler(repository),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: UpdateProductPriceHandler,
      useFactory: (repository: ReturnType<typeof createProductRepository>) => new UpdateProductPriceHandler(repository),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: "ProductRepository",
      useExisting: PRODUCT_REPOSITORY,
    },
    {
      provide: QUOTATION_REPOSITORY,
      useFactory: () => createQuotationRepository(prisma),
    },
    {
      provide: CreateQuotationHandler,
      useFactory: (repository: ReturnType<typeof createQuotationRepository>) => new CreateQuotationHandler(repository),
      inject: [QUOTATION_REPOSITORY],
    },
    {
      // Composição dentro do mesmo domínio (Sales→Sales, `ADR-0043`) — resolve
      // o preço a partir do Product real, mesmo princípio de `ConvertLeadHandler`
      // (`ADR-0042`), mais simples por não cruzar Business Domains.
      provide: AddQuotationLineItemHandler,
      useFactory: (
        quotationRepository: ReturnType<typeof createQuotationRepository>,
        productRepository: ReturnType<typeof createProductRepository>,
      ) => new AddQuotationLineItemHandler(quotationRepository, productRepository),
      inject: [QUOTATION_REPOSITORY, PRODUCT_REPOSITORY],
    },
    {
      provide: SendQuotationHandler,
      useFactory: (repository: ReturnType<typeof createQuotationRepository>) => new SendQuotationHandler(repository),
      inject: [QUOTATION_REPOSITORY],
    },
    {
      provide: AcceptQuotationHandler,
      useFactory: (repository: ReturnType<typeof createQuotationRepository>) => new AcceptQuotationHandler(repository),
      inject: [QUOTATION_REPOSITORY],
    },
    {
      provide: RejectQuotationHandler,
      useFactory: (repository: ReturnType<typeof createQuotationRepository>) => new RejectQuotationHandler(repository),
      inject: [QUOTATION_REPOSITORY],
    },
    {
      provide: "QuotationRepository",
      useExisting: QUOTATION_REPOSITORY,
    },
    {
      provide: CONTRACT_REPOSITORY,
      useFactory: () => createContractRepository(prisma),
    },
    {
      // Composição intra-domínio (Sales→Sales, `ADR-0044`) — mesmo padrão de
      // `AddQuotationLineItemHandler`, mas aqui exige que a Quotation de
      // origem já esteja "accepted".
      provide: GenerateContractFromQuotationHandler,
      useFactory: (
        contractRepository: ReturnType<typeof createContractRepository>,
        quotationRepository: ReturnType<typeof createQuotationRepository>,
      ) => new GenerateContractFromQuotationHandler(contractRepository, quotationRepository),
      inject: [CONTRACT_REPOSITORY, QUOTATION_REPOSITORY],
    },
    {
      provide: ActivateContractHandler,
      useFactory: (repository: ReturnType<typeof createContractRepository>) => new ActivateContractHandler(repository),
      inject: [CONTRACT_REPOSITORY],
    },
    {
      provide: TerminateContractHandler,
      useFactory: (repository: ReturnType<typeof createContractRepository>) => new TerminateContractHandler(repository),
      inject: [CONTRACT_REPOSITORY],
    },
    {
      provide: "ContractRepository",
      useExisting: CONTRACT_REPOSITORY,
    },
    {
      provide: REVENUE_REPOSITORY,
      useFactory: () => createRevenueRepository(prisma),
    },
    {
      // Composição intra-domínio (Sales→Sales, `ADR-0047`) — mesmo padrão de
      // `GenerateContractFromQuotationHandler`, mas sem bloqueio de "já
      // existe" (múltiplos Revenue podem nascer do mesmo Contract).
      provide: GenerateRevenueFromContractHandler,
      useFactory: (
        revenueRepository: ReturnType<typeof createRevenueRepository>,
        contractRepository: ReturnType<typeof createContractRepository>,
      ) => new GenerateRevenueFromContractHandler(revenueRepository, contractRepository),
      inject: [REVENUE_REPOSITORY, CONTRACT_REPOSITORY],
    },
    {
      provide: "RevenueRepository",
      useExisting: REVENUE_REPOSITORY,
    },
  ],
})
export class SalesModule {}
