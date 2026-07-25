# Título

`Bug: <resumo curto do problema>`

## Objetivo

Padronizar como um defeito é reportado, para que qualquer pessoa (ou agente) consiga reproduzir, avaliar severidade e priorizar sem precisar perguntar o básico de novo.

## Estrutura

```markdown
# Bug: <resumo>

## Ambiente
## Passos para Reproduzir
## Comportamento Esperado
## Comportamento Atual
## Evidências (logs, screenshots)
## Severidade
## Prioridade
## Responsável
## Status
```

## Campos Obrigatórios

| Campo | Descrição |
|---|---|
| Ambiente | Onde o bug ocorre (produção, staging, local; versão) |
| Passos para Reproduzir | Sequência mínima que reproduz o problema |
| Comportamento Esperado | O que deveria acontecer |
| Comportamento Atual | O que acontece de fato |
| Severidade | Impacto técnico (`Crítica` / `Alta` / `Média` / `Baixa`) |
| Prioridade | Urgência de correção |
| Responsável | Quem investiga/corrige |
| Status | `Aberto` / `Em investigação` / `Em correção` / `Corrigido` / `Não reproduzido` |

## Checklist

- [ ] Passos para reproduzir são suficientes para outra pessoa reproduzir sem contexto adicional
- [ ] Comportamento esperado vs. atual está claro, não é opinião
- [ ] Severidade e prioridade são campos distintos, preenchidos separadamente
- [ ] Se o bug expõe dado de cliente ou falha de segurança, [docs/09-seguranca/resposta-a-incidentes.md](../docs/09-seguranca/resposta-a-incidentes.md) é acionado, não só este template
