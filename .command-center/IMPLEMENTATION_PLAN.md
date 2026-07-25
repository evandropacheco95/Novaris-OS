# Título

`Implementation Plan: <nome curto>`

## Objetivo

Padronizar o formato do plano técnico exigido na Fase 5 ("Plano Técnico") de [EXECUTION_PROTOCOL.md](EXECUTION_PROTOCOL.md), antes da Fase 6 (Validação).

## Estrutura

```markdown
# Implementation Plan: <nome>

## Contexto
## Escopo
## Fora de Escopo
## Passos de Execução
## Dependências
## Riscos
## Plano de Testes
## Critério de Aceite
## Aprovação
```

## Campos Obrigatórios

| Campo | Descrição |
|---|---|
| Contexto | Por que esta implementação é necessária, o que a motivou |
| Escopo / Fora de Escopo | O que entra e o que explicitamente não entra |
| Passos de Execução | Sequência concreta do que será feito, em ordem |
| Dependências | O que precisa existir antes (ver [knowledge/core/MISSING_MODULES.md](../knowledge/core/MISSING_MODULES.md)) |
| Riscos | O que pode dar errado e como mitigar |
| Plano de Testes | Como a implementação será validada (ver `engineering/estrategia-de-testes.md`) |
| Critério de Aceite | Condição objetiva para considerar concluído |
| Aprovação | Quem aprovou, quando, e o registro dessa aprovação |

## Checklist

- [ ] Passou pelas Fases 1–4 de [EXECUTION_PROTOCOL.md](EXECUTION_PROTOCOL.md) antes de ser escrito
- [ ] Todas as perguntas de [engineering/decision-tree.md](../engineering/decision-tree.md) foram respondidas
- [ ] Se a implementação é de natureza arquitetural, há um ADR associado (não apenas este plano)
- [ ] Aprovação está registrada explicitamente antes da Fase 7 (Implementação) começar
