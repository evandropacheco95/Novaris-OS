// Monitoring Service — barrel de exportação pública.

export type { HealthCheck, HealthStatus } from "./domain/ports/health-check.js";
export { DatabaseHealthCheck } from "./infrastructure/database-health-check.js";
