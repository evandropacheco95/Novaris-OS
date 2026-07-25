# Contrato de Serviço — logging

## Objetivo

Logs estruturados de toda a plataforma — uma linha JSON por evento (`timestamp`/`level`/`message`/`context?`), nunca texto livre concatenado. Implementado real em `ENG-0139`/`ADR-0037`.

## Interface Pública

```typescript
interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}
```

`LogContext = { readonly [key: string]: unknown }` — campos estruturados adicionais, opcionais.

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `debug`/`info`/`warn`/`error` | `message: string`, `context?: LogContext` | `void` | Cada chamada escreve exatamente uma linha JSON em `stdout` (`ConsoleLogger`, Infrastructure) |

## Erros

Não aplicável — logging nunca lança exceção própria; é sempre efeito colateral de escrita, não uma operação que pode falhar de forma que o chamador precise tratar.

## Eventos Emitidos

Nenhum — `logging` é consumidor final (sink), não origem nem transporte de eventos de domínio (diferente de `event-bus`).

## Dependências

Nenhuma (Fase A — fundação; `IMPLEMENTATION_ROADMAP.md § 7` confirma `logging`/`event-bus` como não-dependentes entre si).

## Object Specification

Não aplicável — infraestrutura transversal, não expõe um Business Object do BOM.

## Status

🟢 Real (`ENG-0139`). `Logger` (Port) + `ConsoleLogger` (Infrastructure, JSON estruturado em `stdout`) implementados e testados. Escolha de biblioteca externa (pino/winston) permanece `requer decisão` (`IMPLEMENTATION_ROADMAP.md § 8`) — `ConsoleLogger` cobre o caso de uso real sem antecipar essa escolha. Integração real: adapter `NestLoggerAdapter` (`apps/api/src/logging/`) conecta este Port ao bootstrap do NestJS (`app.useLogger`), substituindo o `console.log` avulso que existia em `main.ts`.
