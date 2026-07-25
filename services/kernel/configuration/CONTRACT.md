# Contrato de Serviço — configuration

## Objetivo

Configurações por organização — par chave/valor genérico, sem catálogo fechado de chaves (`ADR-0038`). Implementado real em `ENG-0140`.

## Interface Pública

```typescript
class SetConfigurationEntryCommand { organizationId: string; key: string; value: string }
class SetConfigurationEntryHandler { execute(command): Promise<Result<ConfigurationEntry, DomainError | InfrastructureError>> }
class GetConfigurationEntryCommand { organizationId: string; key: string }
class GetConfigurationEntryHandler { execute(command): Promise<Result<Option<ConfigurationEntry>, InfrastructureError>> }
```

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `SetConfigurationEntryHandler.execute` | `organizationId`, `key`, `value` | `Result<ConfigurationEntry, ...>` | Upsert real — cria se não existe, atualiza `value` se já existe |
| `GetConfigurationEntryHandler.execute` | `organizationId`, `key` | `Result<Option<ConfigurationEntry>, ...>` | `Option.none` quando a chave não foi configurada ainda |

## Erros

`ValidationError` quando `key` é vazio. `InfrastructureError` em falha de persistência.

## Eventos Emitidos

Nenhum — `ADR-0038` decidiu não emitir Domain Event (mesmo critério de `Campaign`/`Dashboard`, `ADR-0033`/`0034`).

## Dependências

Organizations.

## Object Specification

Não aplicável — `Configuration` não é um Business Object do BOM (`ADR-0038 § Contexto`); Aggregate mínimo definido só por esta ADR.

## Status

🟢 Real (`ENG-0140`, `ADR-0038`). `ConfigurationEntry` (Aggregate Root) + Application (Set/Get Handlers) + Infrastructure (Prisma real, tabela `configuration_entries`, índice único `(organization_id, key)`) implementados e testados (unitários + integração real contra Postgres). Exposto via `GET/PUT /configuration/:key` (`apps/api`). Resolve o status "Discovery Required" de `services/kernel/README.md`.
