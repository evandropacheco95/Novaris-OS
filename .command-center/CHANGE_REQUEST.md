# Título

`Change Request: <nome curto>`

## Objetivo

Padronizar como uma mudança em comportamento, processo ou regra já existente é solicitada — diferente de `FEATURE_REQUEST.md` (algo novo) e de um ADR (mudança de arquitetura, que tem processo próprio em [adr/TEMPLATE.md](../adr/TEMPLATE.md)).

## Estrutura

```markdown
# Change Request: <nome>

## O Que Existe Hoje
## O Que Muda
## Motivação
## Impactos
## Alternativas Consideradas
## Aprovação Necessária
## Plano de Rollback
## Status
```

## Campos Obrigatórios

| Campo | Descrição |
|---|---|
| O Que Existe Hoje | Estado atual, antes da mudança |
| O Que Muda | Estado proposto, depois da mudança |
| Motivação | Por que a mudança é necessária |
| Impactos | O que mais é afetado (documentos, código, processos, pessoas) |
| Alternativas Consideradas | Outras formas de resolver o mesmo problema |
| Aprovação Necessária | Quem precisa aprovar antes da mudança valer |
| Plano de Rollback | Como reverter se a mudança causar problema |
| Status | `Proposta` / `Aprovada` / `Rejeitada` / `Implementada` / `Revertida` |

## Checklist

- [ ] Se a mudança é de arquitetura, isto vira um ADR em vez de (ou além de) um Change Request (Constituição, Artigo 22)
- [ ] Impactos foram mapeados usando [engineering/decision-tree.md](../engineering/decision-tree.md)
- [ ] Existe plano de rollback antes da aprovação, não depois
- [ ] Aprovação está registrada explicitamente, não presumida
