# Contrato de Serviço — notifications

## Objetivo

Envio de notificações a usuários. Implementado real em `ENG-0140`/`ADR-0039` — mecanismo (Port) real, canal externo (email/SMS/push) deliberadamente adiado.

## Interface Pública

```typescript
interface Notifier {
  notify(recipientUserId: string, message: string, context?: NotifierContext): void;
}
```

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `notify` | `recipientUserId: string`, `message: string`, `context?: NotifierContext` | `void` | `ConsoleNotifier` (Infrastructure) só loga — nenhum canal externo real é acionado |

## Erros

Não aplicável — `ConsoleNotifier` nunca lança (mesmo padrão de `ConsoleLogger`).

## Eventos Emitidos

Nenhum — este módulo é consumidor (subscriber), não origem de eventos.

## Dependências

Identity (`recipientUserId` referencia um `User`).

## Object Specification

Não aplicável — infraestrutura transversal, não expõe um Business Object do BOM.

## Status

🟡 Parcial, real (`ENG-0140`, `ADR-0039`). `Notifier` (Port) + `ConsoleNotifier` (Infrastructure) implementados e testados. Integração real: subscriber em `apps/api/src/main.ts` consome `UserCreated` (Event Bus) e chama `notify()` com uma mensagem de boas-vindas — verificado ao vivo. **Nenhum canal externo real** (email/SMS/push) implementado — escolha de fornecedor é decisão de negócio/custo explicitamente fora do escopo desta missão.
