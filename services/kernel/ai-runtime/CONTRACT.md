# Contrato de Serviço — ai-runtime

## Objetivo

Execução controlada de IA — todo acesso de agentes a dados passa por aqui. Implementado real em `ENG-0142`/`ADR-0041` — **estrutural**, inspirado no Salesforce Einstein Copilot: nenhuma credencial de IA existe (`OPENAI_API_KEY`/`ANTHROPIC_API_KEY` vazias em `.env.example`), então nenhuma chamada real a um modelo de linguagem acontece.

## Interface Pública

```typescript
interface AIContext { readonly [key: string]: unknown }
interface AIResponse { readonly answer: string; readonly loggedOnly: boolean }
interface AIRuntime { ask(prompt: string, context?: AIContext): Promise<AIResponse> }
```

## Entradas/Saídas

| Função | Entrada | Saída | Observação |
|---|---|---|---|
| `ask` | `prompt: string`, `context?: AIContext` | `AIResponse` | `ConsoleAIRuntime` só loga o prompt e devolve uma resposta fixa — nenhum modelo de IA real é chamado |

## Erros

Não aplicável — `ConsoleAIRuntime` nunca lança.

## Eventos Emitidos

Nenhum.

## Dependências

Logging (efetivamente usada). `Event Bus`, `Configuration`, `Identity`, citadas originalmente, não são exercidas nesta versão.

## Object Specification

Não aplicável — infraestrutura transversal.

## Status

🟡 Estrutural, real (`ENG-0142`, `ADR-0041`). `AIRuntime` (Port) + `ConsoleAIRuntime` (Infrastructure) implementados e testados. Exposto via `POST /ai/ask` (`apps/api`), toda resposta inclui `loggedOnly: true`. Adapter real (OpenAI/Anthropic) fica para quando a credencial existir — troca de adapter sem mudar o Port nem quem o consome.
