# Título

`Feature Request: <nome curto>`

## Objetivo

Padronizar como uma solicitação de funcionalidade nova é registrada antes de virar especificação formal em [specifications/](../specifications/README.md) ou item em [BACKLOG.md](../knowledge/core/BACKLOG.md).

## Estrutura

```markdown
# Feature Request: <nome>

## Problema / Necessidade
## Usuários Afetados
## Solução Proposta
## Alternativas Consideradas
## Fora de Escopo
## Valor de Negócio
## Dependências
## Prioridade
## Status
```

## Campos Obrigatórios

| Campo | Descrição |
|---|---|
| Problema / Necessidade | Por que esta feature é necessária |
| Usuários Afetados | Quem sente esse problema hoje |
| Solução Proposta | O que se propõe construir |
| Alternativas Consideradas | Outras formas de resolver o mesmo problema, e por que foram descartadas |
| Fora de Escopo | O que esta solicitação explicitamente não cobre |
| Valor de Negócio | Por que vale a pena priorizar |
| Dependências | O que precisa existir antes |
| Prioridade | Conforme esquema de `BACKLOG.md` |
| Status | `Recebida` / `Em avaliação` / `Aprovada` / `Rejeitada` / `Em especificação` |

## Checklist

- [ ] Problema está descrito a partir da necessidade do usuário, não da solução
- [ ] Pelo menos uma alternativa foi considerada e descartada com justificativa
- [ ] Se aprovada, gera um item em `specifications/<dominio>/features.md`, não é implementada direto a partir deste documento
- [ ] Se aprovada, entra em `BACKLOG.md` como Feature associada ao Epic correto
