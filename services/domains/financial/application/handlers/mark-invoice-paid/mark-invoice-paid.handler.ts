import { Result, UniqueEntityId, NotFoundError } from "@novaris/shared-kernel";
import type { DomainError, InfrastructureError } from "@novaris/shared-kernel";
import type { Invoice } from "../../../domain/aggregates/invoice/invoice.js";
import type { InvoiceRepository } from "../../../domain/repositories/invoice-repository.js";
import type { MarkInvoicePaidCommand } from "../../commands/mark-invoice-paid/mark-invoice-paid.command.js";

/**
 * MarkInvoicePaidHandler — Application Layer, Financial Domain.
 * Orquestra: `MarkInvoicePaidCommand` → `InvoiceRepository.findById()` →
 * `Invoice.markPaid()` (dispara `InvoicePaid`) → `InvoiceRepository.save()`.
 */
export class MarkInvoicePaidHandler {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(command: MarkInvoicePaidCommand): Promise<Result<Invoice, DomainError | InfrastructureError>> {
    const invoiceId = new UniqueEntityId(command.invoiceId);

    const findResult = await this.invoiceRepository.findById(invoiceId);
    if (findResult.isFailure) {
      return Result.fail(findResult.getError()!);
    }
    const option = findResult.getValue()!;
    if (option.isNone) {
      return Result.fail(new NotFoundError(`Invoice "${command.invoiceId}" não encontrada`));
    }

    const invoice = option.getOrElse(null as never);
    const markPaidResult = invoice.markPaid();
    if (markPaidResult.isFailure) {
      return Result.fail(markPaidResult.getError()!);
    }

    const saveResult = await this.invoiceRepository.save(invoice);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError()!);
    }

    return Result.ok(invoice);
  }
}
