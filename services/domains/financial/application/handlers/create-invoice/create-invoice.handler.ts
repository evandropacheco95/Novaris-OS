import { Result, UniqueEntityId } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import { Invoice } from "../../../domain/aggregates/invoice/invoice.js";
import type { InvoiceRepository } from "../../../domain/repositories/invoice-repository.js";
import type { CreateInvoiceCommand } from "../../commands/create-invoice/create-invoice.command.js";

/** CreateInvoiceHandler — Application Layer, Financial Domain. Orquestra: `CreateInvoiceCommand` → `Invoice.create()` → `InvoiceRepository.save()`. */
export class CreateInvoiceHandler {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(command: CreateInvoiceCommand): Promise<Result<Invoice, DomainError | InfrastructureError>> {
    const createResult = Invoice.create({
      organizationId: new UniqueEntityId(command.organizationId),
      amount: command.amount,
      currency: command.currency,
      subscriptionId: command.subscriptionId ? new UniqueEntityId(command.subscriptionId) : undefined,
    });
    if (createResult.isFailure) {
      return Result.fail(createResult.getError()!);
    }

    const invoice = createResult.getValue()!;
    const saveResult = await this.invoiceRepository.save(invoice);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(invoice);
  }
}
