# Performance Intelligence — Events

> Nenhum evento existe hoje. `services/kernel/event-bus` já existe e é reaproveitado, não recriado (mesmo padrão de `ADR-0042`/Lead-to-Convert, que usa o Event Bus para composição entre domínios).

## Eventos propostos

- `PerformanceIntelligence.SyncRunCompleted` — dispara possível `SyncRun` seguinte / detecção.
- `PerformanceIntelligence.SignalDetected` — dispara diagnóstico por IA (Kernel `ai-runtime`).
- `PerformanceIntelligence.RecommendationCreated`
- `PerformanceIntelligence.RecommendationApproved` / `RecommendationRejected`
- `PerformanceIntelligence.ActionExecuted`
- `PerformanceIntelligence.MeasurementCompleted` — fecha o loop de aprendizado.

## Consumidores futuros possíveis

- `services/kernel/automation-runtime` (inspirado no Salesforce Flow, `ADR-0041`) — hoje existe mas sem nenhum gatilho real conectado em nenhum domínio (mesmo achado documentado em `PRODUCTS.md § NOVARIS CRM § Integrações`). Performance Intelligence poderia ser o primeiro caso real de gatilho automático (ex.: notificar quando uma `Recommendation` crítica é criada).
