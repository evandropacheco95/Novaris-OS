// Event Bus Service — barrel de exportação pública.

export type { EventBus, EventHandler, Subscription } from "./domain/ports/event-bus.js";
export { InProcessEventBus } from "./infrastructure/in-process-event-bus.js";

import { InProcessEventBus } from "./infrastructure/in-process-event-bus.js";
import type { EventBus } from "./domain/ports/event-bus.js";

/**
 * Instância única do processo — mesmo padrão já usado para `prisma`
 * (`packages/database/src/index.ts`, `export const prisma = new
 * PrismaClient()`). Um Event Bus in-process só faz sentido como singleton:
 * todo `publish()`/`subscribe()` do processo precisa enxergar o mesmo estado.
 */
export const eventBus: EventBus = new InProcessEventBus();
