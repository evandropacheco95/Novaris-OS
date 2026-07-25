import type { PrismaClient } from "@novaris/database";
import type { InvoiceRepository } from "../domain/repositories/invoice-repository.js";
import type { SubscriptionRepository } from "../domain/repositories/subscription-repository.js";
import { PrismaInvoiceRepository } from "./repositories/prisma-invoice-repository.js";
import { PrismaSubscriptionRepository } from "./repositories/prisma-subscription-repository.js";

/** Factories de Infrastructure — mantêm as classes concretas privadas ao pacote. */
export function createInvoiceRepository(client: PrismaClient): InvoiceRepository {
  return new PrismaInvoiceRepository(client);
}

export function createSubscriptionRepository(client: PrismaClient): SubscriptionRepository {
  return new PrismaSubscriptionRepository(client);
}
