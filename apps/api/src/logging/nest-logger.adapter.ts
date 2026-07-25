import type { LoggerService } from "@nestjs/common";
import type { Logger } from "@novaris/logging";

/**
 * Adapter (Ports & Adapters, `ENGINEERING_PLAYBOOK.md § 3`) que conecta o
 * Port `Logger` (`@novaris/logging`, framework-agnóstico) ao mecanismo de
 * logging do NestJS (`NestFactory.create(AppModule, { logger })`). Vive em
 * `apps/api`, não em `@novaris/logging` — o pacote de Kernel não deve
 * depender de `@nestjs/common` (`ADR-0037`).
 */
export class NestLoggerAdapter implements LoggerService {
  constructor(private readonly logger: Logger) {}

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.info(String(message), this.contextFrom(optionalParams));
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.error(String(message), this.contextFrom(optionalParams));
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.warn(String(message), this.contextFrom(optionalParams));
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.debug(String(message), this.contextFrom(optionalParams));
  }

  private contextFrom(optionalParams: unknown[]): Record<string, unknown> | undefined {
    return optionalParams.length > 0 ? { optionalParams } : undefined;
  }
}
