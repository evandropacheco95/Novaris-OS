import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { PrismaClient } from "@novaris/database";
import type { Logger, LogContext } from "@novaris/logging";
import { DatabaseHealthCheck } from "../../src/infrastructure/database-health-check.js";

class FakeLogger implements Logger {
  readonly errors: Array<{ message: string; context?: LogContext }> = [];
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(message: string, context?: LogContext): void {
    this.errors.push({ message, context });
  }
}

function fakePrisma(queryRaw: () => Promise<unknown>): PrismaClient {
  return { $queryRaw: queryRaw } as unknown as PrismaClient;
}

describe("DatabaseHealthCheck — Postgres acessível", () => {
  it("devolve healthy: true e checks.database: true", async () => {
    const prisma = fakePrisma(() => Promise.resolve([{ "?column?": 1 }]));
    const healthCheck = new DatabaseHealthCheck(prisma, new FakeLogger());

    const status = await healthCheck.check();

    assert.equal(status.healthy, true);
    assert.equal(status.checks.database, true);
  });
});

describe("DatabaseHealthCheck — Postgres inacessível", () => {
  it("devolve healthy: false, checks.database: false, sem lançar exceção", async () => {
    const prisma = fakePrisma(() => Promise.reject(new Error("connection refused")));
    const logger = new FakeLogger();
    const healthCheck = new DatabaseHealthCheck(prisma, logger);

    const status = await healthCheck.check();

    assert.equal(status.healthy, false);
    assert.equal(status.checks.database, false);
    assert.equal(logger.errors.length, 1);
  });
});
