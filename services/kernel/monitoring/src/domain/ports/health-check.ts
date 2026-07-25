/**
 * Port de Monitoring (`ENGINEERING_PLAYBOOK.md § 9`) — health check da
 * plataforma. Escopo desta missão (`ADR-0039`): apenas conectividade real
 * com o Postgres — métricas/observabilidade completas (`Event Bus` como
 * dependência declarada originalmente) permanecem fora de escopo, ver
 * `CONTRACT.md § Dependências`.
 */
export interface HealthStatus {
  readonly healthy: boolean;
  readonly checks: Readonly<Record<string, boolean>>;
}

export interface HealthCheck {
  check(): Promise<HealthStatus>;
}
