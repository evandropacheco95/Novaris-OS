import { Module } from "@nestjs/common";
import { prisma } from "@novaris/database";
import {
  createInvoiceRepository,
  createSubscriptionRepository,
  CreateInvoiceHandler,
  MarkInvoicePaidHandler,
  CreateSubscriptionHandler,
} from "@novaris/financial";
import { AuthModule } from "../auth/auth.module.js";
import { InvoiceController } from "./invoice.controller.js";
import { SubscriptionController } from "./subscription.controller.js";

const INVOICE_REPOSITORY = "INVOICE_REPOSITORY";
const SUBSCRIPTION_REPOSITORY = "SUBSCRIPTION_REPOSITORY";

/** FinancialModule — Composition Root do Financial Domain (`ENG-0131`). */
@Module({
  imports: [AuthModule],
  controllers: [InvoiceController, SubscriptionController],
  providers: [
    { provide: INVOICE_REPOSITORY, useFactory: () => createInvoiceRepository(prisma) },
    { provide: SUBSCRIPTION_REPOSITORY, useFactory: () => createSubscriptionRepository(prisma) },
    {
      provide: CreateInvoiceHandler,
      useFactory: (repository: ReturnType<typeof createInvoiceRepository>) => new CreateInvoiceHandler(repository),
      inject: [INVOICE_REPOSITORY],
    },
    {
      provide: MarkInvoicePaidHandler,
      useFactory: (repository: ReturnType<typeof createInvoiceRepository>) => new MarkInvoicePaidHandler(repository),
      inject: [INVOICE_REPOSITORY],
    },
    {
      provide: CreateSubscriptionHandler,
      useFactory: (repository: ReturnType<typeof createSubscriptionRepository>) => new CreateSubscriptionHandler(repository),
      inject: [SUBSCRIPTION_REPOSITORY],
    },
    { provide: "InvoiceRepository", useExisting: INVOICE_REPOSITORY },
    { provide: "SubscriptionRepository", useExisting: SUBSCRIPTION_REPOSITORY },
  ],
})
export class FinancialModule {}
