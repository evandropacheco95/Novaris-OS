# Contrato de Serviço — identity

## Objetivo

Autenticação, sessões e identidade de usuários. Todo módulo que precisa saber "quem é este usuário" ou "esta sessão é válida" passa por aqui — nenhum módulo lê tabelas de usuário/sessão diretamente.

## Interface Pública

```typescript
getUser(id: string): User
verifyCredentials(email: string, password: string): Session
createSession(userId: string): Session
revokeSession(sessionId: string): void
```

Apenas assinaturas — sem corpo de implementação nesta missão.

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `getUser` | `id: string` | `User` | `User` é o objeto definido em `BOM.md`; especificação individual ainda `TODO` (ver `objects/User.md`) |
| `verifyCredentials` | `email, password: string` | `Session` | Não retorna a senha nem qualquer dado sensível além da sessão |
| `createSession` | `userId: string` | `Session` | — |
| `revokeSession` | `sessionId: string` | `void` | Idempotente — revogar sessão já revogada não é erro |

## Erros

🚧 TODO — condições de falha (credenciais inválidas, usuário desativado, sessão expirada) e como são sinalizadas ainda não definidas.

## Eventos Emitidos

🚧 TODO — nenhum evento deste módulo foi nomeado em documento oficial ainda (ver nota em `README.md`).

## Dependências

Logging, Event Bus (Fase A).

## Object Specification

[objects/User.md](../../../knowledge/core/objects/User.md) — parcial (v0.1.0); atributos, estados e regras de negócio ainda `TODO`.

## Status

🚧 Estrutura de contrato criada (Missão ARCH-001). Nenhuma implementação de código.
