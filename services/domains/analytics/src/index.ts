// Analytics Domain Service — barrel de exportação pública.
// Populado conforme cada camada ganha implementação real.

export { Dashboard, type DashboardProps, type CreateDashboardInput } from "../domain/aggregates/dashboard/dashboard.js";

export type { DashboardRepository } from "../domain/repositories/dashboard-repository.js";

// Application Layer
export { CreateDashboardCommand } from "../application/commands/create-dashboard/create-dashboard.command.js";
export { CreateDashboardHandler } from "../application/handlers/create-dashboard/create-dashboard.handler.js";

// Factories de Infrastructure — mantêm as classes concretas privadas ao pacote.
export { createDashboardRepository } from "../infrastructure/factories.js";
