# Contrato de Serviço — automation-runtime

## Objetivo

Execução de workflows e automações. Implementado real em `ENG-0142`/`ADR-0041`, inspirado no Salesforce Flow: gatilho (Event Bus) → ações (`log`/`notify`/`webhook`), configurável em runtime via API — não workflows hardcoded por esta engenharia.

## Interface Pública

```typescript
type AutomationAction =
  | { type: "log"; message: string }
  | { type: "notify"; recipientUserId: string; message: string }
  | { type: "webhook"; url: string };

class CreateAutomationRuleCommand { organizationId: string; name: string; triggerEventName: string; actions: AutomationAction[] }
class CreateAutomationRuleHandler { execute(command): Promise<Result<AutomationRule, DomainError | InfrastructureError>> }
class ToggleAutomationRuleCommand { ruleId: string; enabled: boolean }
class ToggleAutomationRuleHandler { execute(command): Promise<Result<AutomationRule, DomainError | InfrastructureError>> }

interface AutomationRuntime {
  register(rule: AutomationRule): Subscription; // Subscription de @novaris/event-bus
  unregister(subscription: Subscription): void;
}
```

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `CreateAutomationRuleHandler.execute` | `organizationId`, `name`, `triggerEventName`, `actions[]` | `Result<AutomationRule, ...>` | Após `save()`, a regra já é registrada como Subscriber real do Event Bus — reage a eventos no mesmo processo, sem restart |
| `ToggleAutomationRuleHandler.execute` | `ruleId`, `enabled` | `Result<AutomationRule, ...>` | Liga/desliga a assinatura real no Event Bus |

## Erros

`ValidationError` (name/triggerEventName/actions vazios; action malformada — `notify` sem `recipientUserId`/`message`, `webhook` com `url` inválida). `NotFoundError` (toggle de `ruleId` inexistente). Falha de uma `action` em runtime (ex.: webhook indisponível) é isolada e logada — nunca propaga como erro do Handler nem interrompe outras actions/regras.

## Eventos Emitidos

Nenhum — este módulo é consumidor (subscriber) do Event Bus, não origem.

## Dependências

**Correção (`ENG-0142`)**: a versão anterior citava `Event Bus, Scheduler, Identity`. Implementação real depende de `Event Bus` (mecanismo de gatilho), `Logging` (action `log` e diagnóstico de falha) e `Notifications` (action `notify`) — `Scheduler`/`Identity` não são exercidos nesta versão.

## Object Specification

Não aplicável — `AutomationRule` é um Aggregate mínimo definido por `ADR-0041`, não um Business Object do BOM.

## Status

🟢 Real (`ENG-0142`, `ADR-0041`). `AutomationRule` (Aggregate) + `InProcessAutomationRuntime` + `AutomationRuleRegistry` (Infrastructure) + Application (Create/Toggle) implementados e testados (unitários + integração real). Exposto via `POST`/`GET /automation-rules`, `POST /automation-rules/:id/toggle` (`apps/api`). **Sem `conditions`** — `DomainEvent` (`ADR-0037`) não carrega payload de negócio para avaliar; toda regra dispara incondicionalmente ao evento gatilho. Verificado ao vivo: regra com action `webhook` recebendo um evento `UserCreated` real e entregando o payload a um listener HTTP real.
