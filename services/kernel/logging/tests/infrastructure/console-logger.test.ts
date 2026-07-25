import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { ConsoleLogger } from "../../src/infrastructure/console-logger.js";

describe("ConsoleLogger", () => {
  const originalLog = console.log;
  let lines: string[];

  beforeEach(() => {
    lines = [];
    // eslint-disable-next-line no-console
    console.log = (line: string) => {
      lines.push(line);
    };
  });

  afterEach(() => {
    console.log = originalLog;
  });

  it("escreve info como JSON estruturado com level/message/timestamp", () => {
    const logger = new ConsoleLogger();
    logger.info("mensagem de teste");

    assert.equal(lines.length, 1);
    const parsed = JSON.parse(lines[0]!);
    assert.equal(parsed.level, "info");
    assert.equal(parsed.message, "mensagem de teste");
    assert.notEqual(parsed.timestamp, undefined);
    assert.equal(parsed.context, undefined);
  });

  it("inclui o context quando fornecido", () => {
    const logger = new ConsoleLogger();
    logger.error("falhou", { eventId: "abc-123", causa: "timeout" });

    const parsed = JSON.parse(lines[0]!);
    assert.equal(parsed.level, "error");
    assert.deepEqual(parsed.context, { eventId: "abc-123", causa: "timeout" });
  });

  it("cobre os 4 níveis (debug/info/warn/error)", () => {
    const logger = new ConsoleLogger();
    logger.debug("d");
    logger.info("i");
    logger.warn("w");
    logger.error("e");

    assert.equal(lines.length, 4);
    assert.deepEqual(
      lines.map((line) => JSON.parse(line).level),
      ["debug", "info", "warn", "error"],
    );
  });
});
