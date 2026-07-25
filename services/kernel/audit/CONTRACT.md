# Contrato de Serviço — audit

## Objetivo

Trilha de auditoria imutável de todas as alterações da plataforma ([NOVARIS_CONSTITUTION.md Article XVIII](../../../knowledge/core/NOVARIS_CONSTITUTION.md), [objects/Organization.md § Auditoria](../../../knowledge/core/objects/Organization.md)).

## Interface Pública

```typescript
logEvent(entry: AuditEntry): void
getAuditTrail(objectId: string): AuditEntry[]
```

Apenas assinaturas — sem corpo de implementação nesta missão.

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `logEvent` | `entry: AuditEntry` | `void` | `AuditEntry` inclui usuário, data, IP, origem, evento, valores antigos/novos, conforme [objects/Organization.md § Auditoria](../../../knowledge/core/objects/Organization.md) |
| `getAuditTrail` | `objectId: string` | `AuditEntry[]` | Ordenado cronologicamente; paginação ainda `TODO` |

## Erros

🚧 TODO.

## Eventos Emitidos

Não aplicável no sentido usual — `audit` registra eventos de outros módulos, não emite os seus próprios. Se `audit` precisar notificar (ex.: alerta de acesso suspeito), isso é `TODO`.

## Dependências

Identity, Organizations (Fase B) — todo registro de auditoria precisa saber quem e em qual organização.

## Object Specification

Não aplicável diretamente — `audit` é infraestrutura transversal (`Audit Log` é um System Object em [BOM.md § 8](../../../knowledge/core/BOM.md), ainda sem especificação individual).

## Status

🚧 Estrutura de contrato criada (Missão ARCH-001). Nenhuma implementação de código.
