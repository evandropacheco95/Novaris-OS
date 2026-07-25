# Execution Protocol — Protocolo Oficial da Engenharia NOVARIS

Status: Vigente
Escopo: Toda implementação técnica no repositório NOVARIS — código, infraestrutura, schema de banco, configuração de agente ou automação.

## Regra de Bloqueio

Nenhuma implementação pode começar sem cumprir, em ordem, as 11 fases abaixo. Nenhuma fase pode ser pulada, combinada informalmente com outra, ou iniciada antes que a fase anterior tenha atingido seu critério de saída. A Fase 7 (Implementação) é a única fase que produz código ou muda comportamento do sistema — todas as fases anteriores são preparatórias e reversíveis.

## Relação com Outros Documentos

Este documento define a sequência de fases. Cada fase se apoia em templates e documentos já existentes no repositório, referenciados nela. Este é o documento de referência para a sequência de fases da engenharia NOVARIS.

---

## FASE 1 — Entendimento

**Objetivo**: compreender completamente o que está sendo pedido antes de consultar qualquer documento ou tocar em qualquer arquivo.

**Critério de Entrada**: existe uma solicitação de implementação, mudança ou correção.

**Atividades**: identificar o problema real por trás do pedido, o objetivo a ser alcançado, e a quem ou a que domínio ele pertence.

**Critério de Saída**: o problema e o objetivo podem ser descritos em uma frase, sem ambiguidade, sem depender de suposições não confirmadas.

---

## FASE 2 — Leitura da Documentação

**Objetivo**: ler o que já existe antes de propor algo novo, para não duplicar nem contradizer trabalho já registrado.

**Critério de Entrada**: Fase 1 concluída.

**Atividades**: consultar `docs/`, `knowledge/`, `architecture/`, `engineering/`, `specifications/`, `business/`, `playbooks/`, `agents/` e `.claude/` na medida em que forem relevantes ao domínio identificado na Fase 1.

**Critério de Saída**: está claro o que já existe, o que está desatualizado e o que precisa ser criado.

---

## FASE 3 — Leitura dos ADRs

**Objetivo**: verificar se já existe uma decisão de arquitetura registrada sobre o tema, para respeitá-la, ou identificar que uma decisão nova será necessária.

**Critério de Entrada**: Fase 2 concluída.

**Atividades**: consultar o índice em [adr/README.md](../adr/README.md) e ler qualquer ADR relacionado ao domínio da tarefa.

**Critério de Saída**: confirmado se existe ADR aplicável. Se existir, a implementação deve respeitá-lo. Se não existir e a tarefa tiver natureza arquitetural, fica registrado que um novo ADR (seguindo [adr/TEMPLATE.md](../adr/TEMPLATE.md)) será produzido na Fase 5.

---

## FASE 4 — Análise de Impacto

**Objetivo**: mapear tudo que é afetado pela mudança antes de planejá-la.

**Critério de Entrada**: Fase 3 concluída.

**Atividades**: identificar documentos, módulos, decisões, dependências e pessoas afetadas. Responder às perguntas de [engineering/decision-tree.md](../engineering/decision-tree.md) (documentação, componente, API, tabela, padrão, impacto, migração, teste, rollback).

**Critério de Saída**: lista de impactos e dependências completa. Qualquer resposta negativa em `engineering/decision-tree.md` interrompe o fluxo aqui e exige revisão antes de prosseguir.

---

## FASE 5 — Plano Técnico

**Objetivo**: produzir um plano técnico formal e revisável antes de qualquer execução.

**Critério de Entrada**: Fase 4 concluída, sem impactos pendentes de revisão.

**Atividades**: escrever o plano seguindo [.command-center/IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — contexto, escopo, fora de escopo, passos de execução, dependências, riscos, plano de testes, critério de aceite. Se a Fase 3 identificou necessidade de ADR, redigi-lo aqui.

**Critério de Saída**: plano técnico completo, com critério de aceite verificável.

---

## FASE 6 — Validação

**Objetivo**: obter aprovação explícita do plano antes de qualquer execução.

**Critério de Entrada**: Fase 5 concluída.

**Atividades**: apresentar o plano técnico para validação. Confirmar que o plano não contradiz `PROJECT_RULES.md` nem `knowledge/core/CONSTITUTION.md`.

**Critério de Saída**: aprovação explícita registrada. Silêncio, ou uma mensagem subsequente sobre outro assunto, não constitui aprovação. Sem este critério cumprido, a Fase 7 não pode começar.

---

## FASE 7 — Implementação

**Objetivo**: executar exatamente o que foi validado na Fase 6.

**Critério de Entrada**: Fase 6 concluída com aprovação explícita.

**Atividades**: implementar o plano. Qualquer desvio de escopo relevante em relação ao que foi validado retorna o trabalho à Fase 5.

**Critério de Saída**: implementação completa, correspondente ao plano aprovado.

---

## FASE 8 — Testes

**Objetivo**: validar que a implementação cumpre o critério de aceite definido na Fase 5.

**Critério de Entrada**: Fase 7 concluída.

**Atividades**: executar os testes definidos no plano de testes, seguindo [engineering/estrategia-de-testes.md](../engineering/estrategia-de-testes.md).

**Critério de Saída**: testes executados e aprovados. Nenhuma implementação é considerada concluída sem esta fase (Constituição, Artigo 19).

---

## FASE 9 — Atualização da Documentação

**Objetivo**: garantir que nenhuma documentação fique desatualizada em relação ao que foi implementado.

**Critério de Entrada**: Fase 8 concluída.

**Atividades**: atualizar `docs/`, `specifications/` e/ou `knowledge/` afetados (registrar em `decisoes.md` e, se houver lição aprendida, em `aprendizados.md` do domínio); atualizar o Roadmap (`docs/02-produto/roadmap.md` e/ou `knowledge/core/MASTER_ROADMAP.md`) quando aplicável; confirmar que qualquer ADR previsto na Fase 5 foi de fato criado.

**Critério de Saída**: toda documentação afetada reflete o estado real do sistema.

---

## FASE 10 — Atualização do CHANGELOG

**Objetivo**: registrar a mudança de forma rastreável.

**Critério de Entrada**: Fase 9 concluída.

**Atividades**: adicionar entrada em [CHANGELOG.md](../CHANGELOG.md) descrevendo o que mudou.

**Critério de Saída**: entrada de changelog criada e correspondente à implementação real.

---

## FASE 11 — Conclusão

**Objetivo**: encerrar formalmente o ciclo, confirmando que todas as fases anteriores — não apenas a implementação — foram cumpridas.

**Critério de Entrada**: Fases 1 a 10 concluídas.

**Atividades**: revisar, fase a fase, que cada critério de saída foi atingido. Se algum não foi, o ciclo não está concluído, independentemente de o código estar funcionando. Produzir os relatórios obrigatórios, na ordem abaixo — cada um se apoia nos anteriores, nenhum substitui outro (ver [ARCHITECTURE_REVIEW_GATE_STANDARD.md § Relação com Self Review, DMV e ACR](../knowledge/engineering/standards/ARCHITECTURE_REVIEW_GATE_STANDARD.md)):

1. **Self Review** — obrigatório em toda missão (regra vigente desde as missões do Shared Kernel): arquivos criados/alterados, decisões, riscos, pendências, validações.
2. **Domain Model Validation (DMV)** — obrigatório quando a missão envolve modelagem de domínio (regra vigente desde a Ordem de Missão ENG-0002.4/ENG-0002.5): 7 perguntas sobre Entities/Aggregates tocados, regras de negócio novas, necessidade de ADR, consistência com Blueprints/Freezes e com a Linguagem Ubíqua.
3. **Architecture Compliance Report (ACR)** — obrigatório em toda missão (regra vigente desde a Ordem de Missão "Architecture Governance Update", ENG-0002.A) — [ARCHITECTURE_COMPLIANCE_REPORT_TEMPLATE.md](ARCHITECTURE_COMPLIANCE_REPORT_TEMPLATE.md): Shared Kernel Reuse, DDD Compliance, Layer Compliance, Dependency Analysis, Architectural Drift, ADR Candidates, Technical Debt, Quality Gate, CTO Recommendation.
4. **Architecture Review Gate (ARG)** — obrigatório para toda missão de implementação (`ENG-`) (regra vigente desde a Ordem de Missão "Architecture Review Gate Standard", ENS-0002) — [ARCHITECTURE_REVIEW_GATE_TEMPLATE.md](ARCHITECTURE_REVIEW_GATE_TEMPLATE.md): gate binário PASS/FAIL de 12 critérios, último passo antes do Relatório Final e do pedido de aprovação ao CTO.

**Critério de Saída**: todas as 11 fases confirmadas como cumpridas **e** todos os relatórios obrigatórios apresentados (Self Review e ACR sempre; DMV quando a missão envolve modelagem de domínio; ARG quando a missão é do tipo `ENG-`). Nenhuma missão é considerada concluída faltando um relatório que se aplique a ela. Uma missão `ENG-` cujo ARG resultou em FAIL não está concluída, independentemente dos demais relatórios.

---

## Status

🟢 Vigente a partir desta instrução. Aplica-se a toda implementação futura neste repositório.
