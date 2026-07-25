import { Controller, Get, HttpException, HttpStatus, Inject } from "@nestjs/common";
import type { HealthCheck, HealthStatus } from "@novaris/monitoring";

/**
 * HealthController — `GET /health`, público (sem `JwtAuthGuard`) — health
 * check é infraestrutura operacional consultada por quem opera a plataforma
 * (não por um usuário de negócio autenticado), mesmo critério já usado por
 * qualquer endpoint de saúde padrão de mercado (`ENG-0140`, `ADR-0039`).
 * `503` quando não saudável — convenção HTTP padrão para health checks.
 */
@Controller("health")
export class HealthController {
  constructor(@Inject("HealthCheck") private readonly healthCheck: HealthCheck) {}

  @Get()
  async check(): Promise<HealthStatus> {
    const status = await this.healthCheck.check();
    if (!status.healthy) {
      throw new HttpException(status, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return status;
  }
}
