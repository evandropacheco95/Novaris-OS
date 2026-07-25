# Decision Tree — Como Decisões de Implementação São Tomadas

## Objetivo

Antes de qualquer implementação técnica na NOVARIS, a decisão precisa passar pelas perguntas abaixo, em ordem. Se qualquer resposta for **negativa**, a implementação é interrompida e uma revisão deve ser solicitada antes de prosseguir.

## Árvore de Decisão

1. Existe documentação?
2. Existe componente?
3. Existe API?
4. Existe tabela?
5. Existe padrão?
6. Existe impacto (mapeado)?
7. Existe migração (planejada)?
8. Existe teste (planejado)?
9. Existe rollback (planejado)?

## Regra

Se qualquer uma das perguntas acima for respondida com **não**, a implementação é interrompida imediatamente. Solicitar revisão antes de prosseguir. Nenhuma exceção implícita.

## Relação com Outros Módulos

- [.command-center/EXECUTION_PROTOCOL.md](../.command-center/EXECUTION_PROTOCOL.md) — esta árvore é o crivo pergunta-a-pergunta usado dentro da Fase 4 ("Análise de Impacto") antes da Fase 6 (Validação)
- [knowledge/core/CONSTITUTION.md § Artigo 15 — Desenvolvimento](../knowledge/core/CONSTITUTION.md#artigo-15--desenvolvimento) e [§ Artigo 22 — Alterações](../knowledge/core/CONSTITUTION.md#artigo-22--alterações) — base constitucional que exige consulta prévia e ADR para mudanças estruturais
- [adr/TEMPLATE.md](../adr/TEMPLATE.md) — se a resposta a "Existe padrão?" ou "Existe impacto?" for negativa por se tratar de uma decisão nova, o caminho é abrir um ADR, não prosseguir sem registro

## Status

🟢 Vigente a partir desta instrução. Aplica-se a toda decisão de implementação futura neste repositório.
