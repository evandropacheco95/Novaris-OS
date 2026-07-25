import type { Logger } from "@novaris/logging";
import type { Notifier, NotifierContext } from "../domain/ports/notifier.js";

/**
 * Adapter real do Port `Notifier` — não envia nada a nenhum canal externo
 * (email/SMS/push), só registra via `@novaris/logging` que uma notificação
 * *seria* enviada (`ADR-0039`, mesmo padrão de "mecanismo real, fornecedor
 * adiado" já usado por `ConsoleLogger`). Substituível por um adapter real
 * (ex.: Resend, SES) sem mudar o Port nem quem o consome.
 */
export class ConsoleNotifier implements Notifier {
  constructor(private readonly logger: Logger) {}

  notify(recipientUserId: string, message: string, context?: NotifierContext): void {
    this.logger.info(`[notifications] Notificação para ${recipientUserId}: ${message}`, context);
  }
}
