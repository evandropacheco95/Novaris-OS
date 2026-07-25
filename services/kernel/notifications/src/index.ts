// Notifications Service — barrel de exportação pública.

export type { Notifier, NotifierContext } from "./domain/ports/notifier.js";
export { ConsoleNotifier } from "./infrastructure/console-notifier.js";
