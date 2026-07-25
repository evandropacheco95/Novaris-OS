import type { PrismaClient } from "@novaris/database";
import type { Logger } from "@novaris/logging";
import type { HealthCheck, HealthStatus } from "../domain/ports/health-check.js";

/**
 * Adapter real do Port `HealthCheck` — única verificação implementada nesta
 * missão (`ADR-0039`): conectividade com o Postgres real via `SELECT 1`.
 * Nunca lança — uma falha de conexão vira `healthy: false`, não uma exceção
 * (um endpoint de health check que lança exceção é, ele mesmo, um sintoma de
 * indisponibilidade, não uma resposta útil para quem consulta).
 */
export class DatabaseHealthCheck implements HealthCheck {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: Logger,
  ) {}

  async check(): Promise<HealthStatus> {
    let databaseOk = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      databaseOk = true;
    } catch (error) {
      this.logger.error("[monitoring] Health check do Postgres falhou", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
    return { healthy: databaseOk, checks: { database: databaseOk } };
  }
}
