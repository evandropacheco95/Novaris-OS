# Regras — Protocolo Operacional do Engenheiro Principal

Status: Vigente
Prioridade: Máxima *dentro da hierarquia definida em [PROJECT_RULES.md § Artigo 1](../PROJECT_RULES.md) — este protocolo é o processo pelo qual a [Constituição](../knowledge/core/CONSTITUTION.md) é cumprida, não uma autoridade concorrente a ela.*

## Relação com a Constituição

Este protocolo operacionaliza dois artigos já existentes em [CONSTITUTION.md](../knowledge/core/CONSTITUTION.md):

- **Artigo 15 — Desenvolvimento**: exige consultar documentação, regras de negócio, padrões, verificar reutilização e impacto, e atualizar documentação antes de implementar.
- **Artigo 22 — Alterações**: exige ADR para qualquer mudança de arquitetura, com motivação, alternativas, impactos, plano de migração, data e responsável.

O protocolo abaixo é o passo a passo concreto para cumprir esses dois artigos. Em caso de conflito de conteúdo entre este arquivo e a Constituição, a Constituição prevalece (Artigo 21).

## Relação com o NES

Todo trabalho de engenharia neste repositório deve seguir [NES/README.md](../NES/README.md) — NOVARIS Engineering System, "Documento Mestre de Engenharia" ("Ordem de Missão NES-001").

⚠️ Isto cria uma tensão explícita, não escondida: `NES § Capítulo 6` define um fluxo de 6 etapas próprio (Entendimento → Planejamento → Aprovação → Implementação → Testes → Documentação), diferente das 11 fases de `EXECUTION_PROTOCOL.md` referenciadas abaixo. Ambos os documentos estão hoje "vigentes" por instruções explícitas separadas. Este arquivo não escolhe qual prevalece — ver a nota completa em [PROJECT_RULES.md § Nota sobre NES/README.md](../PROJECT_RULES.md).

## Fluxo Obrigatório — Antes de Qualquer Implementação Futura

A sequência de fases vinculante é [.command-center/EXECUTION_PROTOCOL.md](../.command-center/EXECUTION_PROTOCOL.md) — 11 fases, de Entendimento a Conclusão. Este arquivo não repete o detalhamento de cada fase para não duplicar (Constituição, Artigo 16) nem correr o risco de divergir de `EXECUTION_PROTOCOL.md` conforme um dos dois for editado. Resumo das 11 fases, apenas para referência rápida:

Entendimento → Leitura da Documentação → Leitura dos ADRs → Análise de Impacto → Plano Técnico → Validação → Implementação → Testes → Atualização da Documentação → Atualização do CHANGELOG → Conclusão.

Nenhuma fase pode ser pulada. Nenhuma implementação (Fase 7) começa sem a Fase 6 (Validação) concluída com aprovação explícita.

> ⚠️ Antes desta instrução, este documento continha sua própria lista numerada de 10 passos, com nomes e agrupamentos ligeiramente diferentes dos de `EXECUTION_PROTOCOL.md` (ex.: "Encontrar dependências" cobria o que agora são as Fases 3 e 4 separadas). A partir de agora, `EXECUTION_PROTOCOL.md` é a fonte detalhada; qualquer implementação anterior a esta mudança que tenha citado "Passo N" deste arquivo deve ser reinterpretada pela fase correspondente em `EXECUTION_PROTOCOL.md`.

## Regras Absolutas

- Nunca pular fases do fluxo definido em `EXECUTION_PROTOCOL.md`.
- Nunca implementar (Fase 7) sem validação explícita (Fase 6).
- Nunca alterar arquitetura sem ADR (Constituição, Artigo 22).
- Nunca considerar uma implementação concluída sem as Fases 8, 9, 10 e 11.

## Status

🟢 Vigente a partir desta instrução. Aplica-se a toda implementação futura neste repositório.
