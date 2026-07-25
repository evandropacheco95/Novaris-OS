// Financial Domain Service — barrel de exportação pública.
// Populado conforme cada camada ganha implementação real.

export { Invoice, type InvoiceProps, type InvoiceStatus, type CreateInvoiceInput } from "../domain/aggregates/invoice/invoice.js";
export { Subscription, type SubscriptionProps, type CreateSubscriptionInput } from "../domain/aggregates/subscription/subscription.js";

export { InvoicePaid } from "../domain/events/invoice-paid.js";

export type { InvoiceRepository } from "../domain/repositories/invoice-repository.js";
export type { SubscriptionRepository } from "../domain/repositories/subscription-repository.js";

// Application Layer
export { CreateInvoiceCommand } from "../application/commands/create-invoice/create-invoice.command.js";
export { CreateInvoiceHandler } from "../application/handlers/create-invoice/create-invoice.handler.js";
export { MarkInvoicePaidCommand } from "../application/commands/mark-invoice-paid/mark-invoice-paid.command.js";
export { MarkInvoicePaidHandler } from "../application/handlers/mark-invoice-paid/mark-invoice-paid.handler.js";
export { CreateSubscriptionCommand } from "../application/commands/create-subscription/create-subscription.command.js";
export { CreateSubscriptionHandler } from "../application/handlers/create-subscription/create-subscription.handler.js";

// Factories de Infrastructure — mantêm as classes concretas privadas ao pacote.
export { createInvoiceRepository, createSubscriptionRepository } from "../infrastructure/factories.js";
