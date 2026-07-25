# Contrato de Serviço — feature-flags

## Objetivo

Controle de funcionalidades habilitadas por organização — par chave/booleano genérico, sem catálogo fechado de chaves (`ADR-0038`). Implementado real em `ENG-0140`.

## Interface Pública

```typescript
class SetFeatureFlagCommand { organizationId: string; key: string; enabled: boolean }
class SetFeatureFlagHandler { execute(command): Promise<Result<FeatureFlag, DomainError | InfrastructureError>> }
class GetFeatureFlagCommand { organizationId: string; key: string }
class GetFeatureFlagHandler { execute(command): Promise<Result<Option<FeatureFlag>, InfrastructureError>> }
```

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `SetFeatureFlagHandler.execute` | `organizationId`, `key`, `enabled` | `Result<FeatureFlag, ...>` | Upsert real — cria se não existe, alterna `enabled` se já existe |
| `GetFeatureFlagHandler.execute` | `organizationId`, `key` | `Result<Option<FeatureFlag>, ...>` | `Option.none` quando a flag nunca foi configurada — chamador decide o default (tipicamente `false`) |

## Erros

`ValidationError` quando `key` é vazio. `InfrastructureError` em falha de persistência.

## Eventos Emitidos

Nenhum (`ADR-0038`).

## Dependências

Organizations.

## Object Specification

Não aplicável — Aggregate mínimo definido só por `ADR-0038`; `BOM.md § Feature Flag` era um one-liner sem campos.

## Status

🟢 Real (`ENG-0140`, `ADR-0038`). `FeatureFlag` (Aggregate Root) + Application (Set/Get Handlers) + Infrastructure (Prisma real, tabela `feature_flags`, índice único `(organization_id, key)`) implementados e testados. Exposto via `GET/PUT /feature-flags/:key` (`apps/api`). Resolve o status "Discovery Required" de `services/kernel/README.md`.
