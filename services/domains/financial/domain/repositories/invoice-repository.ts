import type { ReadRepository, WriteRepository } from "@novaris/shared-kernel";
import type { Invoice } from "../aggregates/invoice/invoice.js";

/** Contrato de persistência do Aggregate `Invoice` — port da Domain Layer. Mesmo padrão de `OpportunityRepository`. */
export interface InvoiceRepository extends ReadRepository<Invoice>, WriteRepository<Invoice> {}
