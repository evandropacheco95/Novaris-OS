import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Quotation } from "../aggregates/quotation/quotation.js";

/** Contrato de persistência do Aggregate `Quotation` (`ADR-0043`). */
export interface QuotationRepository extends ReadRepository<Quotation>, WriteRepository<Quotation> {}
