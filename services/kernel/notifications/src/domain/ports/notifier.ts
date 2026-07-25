/**
 * Port de Notifications (`ENGINEERING_PLAYBOOK.md § 9`) — envio de
 * notificações a usuários. Canal real (email/SMS/push) é decisão de
 * fornecedor externo, deliberadamente adiada (`ADR-0039`) — esta missão
 * implementa só o Port e um adapter que não envia nada de verdade.
 */
export interface NotifierContext {
  readonly [key: string]: unknown;
}

export interface Notifier {
  notify(recipientUserId: string, message: string, context?: NotifierContext): void;
}
