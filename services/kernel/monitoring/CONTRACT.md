# Contrato de Serviço — monitoring

## Objetivo

Health check da plataforma. Implementado real em `ENG-0140`/`ADR-0039` — escopo restrito a conectividade com o Postgres; métricas/observabilidade completas ficam fora desta missão.

## Interface Pública

```typescript
interface HealthStatus {
  readonly healthy: boolean;
  readonly checks: Readonly<Record<string, boolean>>;
}

interface HealthCheck {
  check(): Promise<HealthStatus>;
}
```

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `check` | nenhuma | `HealthStatus` | Nunca lança — falha de conexão vira `healthy: false`, não exceção |

## Erros

Não aplicável a quem chama `check()` — toda falha interna (ex.: Postgres fora do ar) já é convertida em `healthy: false` antes de devolver.

## Eventos Emitidos

Nenhum.

## Dependências

**Correção (`ENG-0140`)**: a versão anterior desta linha citava `Logging, Event Bus` — nenhuma fonte formal (Discovery/ADR) já tinha decidido o desenho real. Implementação real depende de `Database` (`@novaris/database`, para o `SELECT 1`) e `Logging` (log de falha) — `Event Bus` permanece uma dependência aspiracional, não exercida nesta versão (métricas orientadas a evento ficam para uma iteração futura).

## Object Specification

Não aplicável — infraestrutura transversal, não expõe um Business Object do BOM.

## Status

🟡 Parcial, real (`ENG-0140`, `ADR-0039`). `HealthCheck` (Port) + `DatabaseHealthCheck` (Infrastructure, `SELECT 1` real) implementados e testados; exposto via `GET /health` (`apps/api`, sem autenticação — health check é infraestrutura operacional, não dado de negócio). Métricas/contadores baseados em Event Bus, e qualquer stack de observabilidade externa (Prometheus etc.), permanecem `requer decisão` (`IMPLEMENTATION_ROADMAP.md § 8`).
