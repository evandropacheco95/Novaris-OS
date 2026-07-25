import type { PrismaClient } from "@novaris/database";
import type { OpportunityRepository } from "../domain/repositories/opportunity-repository.js";
import type { PipelineRepository } from "../domain/repositories/pipeline-repository.js";
import type { LeadRepository } from "../domain/repositories/lead-repository.js";
import type { ProductRepository } from "../domain/repositories/product-repository.js";
import type { QuotationRepository } from "../domain/repositories/quotation-repository.js";
import type { ContractRepository } from "../domain/repositories/contract-repository.js";
import type { RevenueRepository } from "../domain/repositories/revenue-repository.js";
import { PrismaOpportunityRepository } from "./repositories/prisma-opportunity-repository.js";
import { PrismaPipelineRepository } from "./repositories/prisma-pipeline-repository.js";
import { PrismaLeadRepository } from "./repositories/prisma-lead-repository.js";
import { PrismaProductRepository } from "./repositories/prisma-product-repository.js";
import { PrismaQuotationRepository } from "./repositories/prisma-quotation-repository.js";
import { PrismaContractRepository } from "./repositories/prisma-contract-repository.js";
import { PrismaRevenueRepository } from "./repositories/prisma-revenue-repository.js";

/**
 * Factories de Composition Root — único ponto público de acesso às
 * implementações concretas de Repository (`PrismaOpportunityRepository`/
 * `PrismaPipelineRepository`, `infrastructure/repositories/`). As classes em
 * si nunca são exportadas diretamente pelo barrel público (`src/index.ts`) —
 * apenas estas factories, que devolvem o tipo da interface (`OpportunityRepository`/
 * `PipelineRepository`), nunca o tipo concreto. Uma Composition Root externa
 * (`apps/api`) nunca precisa (nem consegue) importar a classe concreta.
 */
export function createOpportunityRepository(client: PrismaClient): OpportunityRepository {
  return new PrismaOpportunityRepository(client);
}

export function createPipelineRepository(client: PrismaClient): PipelineRepository {
  return new PrismaPipelineRepository(client);
}

export function createLeadRepository(client: PrismaClient): LeadRepository {
  return new PrismaLeadRepository(client);
}

export function createProductRepository(client: PrismaClient): ProductRepository {
  return new PrismaProductRepository(client);
}

export function createQuotationRepository(client: PrismaClient): QuotationRepository {
  return new PrismaQuotationRepository(client);
}

export function createContractRepository(client: PrismaClient): ContractRepository {
  return new PrismaContractRepository(client);
}

export function createRevenueRepository(client: PrismaClient): RevenueRepository {
  return new PrismaRevenueRepository(client);
}
