# Título

Engineering Checklist

## Objetivo

Consolidar, em um único checklist, os critérios de qualidade já exigidos em [CONSTITUTION.md § Artigo 19 — Qualidade](../knowledge/core/CONSTITUTION.md#artigo-19--qualidade) e em [engineering/decision-tree.md](../engineering/decision-tree.md), para uso rápido antes de considerar qualquer entrega pronta.

## Estrutura

```markdown
# Engineering Checklist — <item avaliado>

## Documentação
## Código
## Testes
## Segurança
## Revisão
## Deploy
```

## Campos Obrigatórios

| Campo | Descrição |
|---|---|
| Item Avaliado | O que está sendo verificado (feature, PR, release) |
| Categoria | Documentação / Código / Testes / Segurança / Revisão / Deploy |
| Critério | O que precisa ser verdade nessa categoria |
| Verificado Por | Quem confirmou o critério |
| Status | `Pendente` / `Atende` / `Não atende` |

## Checklist

- [ ] Documentação correspondente existe e foi atualizada
- [ ] Código segue [engineering/padroes-de-codigo.md](../engineering/padroes-de-codigo.md)
- [ ] Testes existem e passam (ver [engineering/estrategia-de-testes.md](../engineering/estrategia-de-testes.md))
- [ ] Nenhum segredo ou credencial commitado
- [ ] Revisão feita conforme [engineering/diretrizes-de-code-review.md](../engineering/diretrizes-de-code-review.md)
- [ ] Todas as respostas de [engineering/decision-tree.md](../engineering/decision-tree.md) são positivas, ou há revisão registrada para cada resposta negativa
