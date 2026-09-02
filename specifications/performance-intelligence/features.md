# Performance Intelligence — Features

> Todas as capacidades abaixo são **propostas**, nada implementado ainda — mesma disciplina de honestidade usada em `PRODUCTS.md § NOVARIS CRM § KPIs` ("Propostos, não implementados").

## Coleta e sincronização

- Conectar conta Google Ads (Winnet, depois Allbinox) via `GoogleAdsProvider` (extensão do port existente em `integration-hub`).
- Testar conexão, sincronização manual, sincronização histórica inicial (90 dias, configurável).
- Rastreamento de cada `SyncRun` (status `PENDING/RUNNING/COMPLETED/FAILED/PARTIAL`, registros processados/criados/atualizados, erro).
- Idempotência via identificador externo do Google Ads — sincronização repetida não duplica registro.

## Análise (5 níveis)

- Conta: investimento, conversões, CPA, ROAS, variação, anomalias.
- Campanha: melhores/piores, tendência, sinais, recomendações, drill-down.
- Grupo de anúncios: relevância, segmentação, fragmentação.
- Palavra-chave / termo de busca: classificação de intenção, waste, negativação, expansão.
- Mercado/externo: pesquisa disparada por sinal, nunca solta.

## Comparação de período

- Hoje vs. ontem, últimos 7 dias vs. 7 anteriores, últimos 30 dias vs. 30 anteriores, período customizado vs. equivalente anterior.

## Detecção

- Detectores baseados em regra (limiar configurável): `HIGH_COST_NO_CONVERSION`, `CPA_DETERIORATION`, `CONVERSION_RATE_DROP`, `CPC_SPIKE`, `SEARCH_TERM_WASTE`, `WINNER_OPPORTUNITY`, `BUDGET_CONSTRAINT`.
- Detecção estatística (considera volume absoluto, amostra, baseline, volatilidade, sazonalidade).
- Um sinal nunca é apresentado como diagnóstico pronto.

## Diagnóstico por IA

- Geração de hipóteses com evidência a favor, evidência contra, o que ainda não se sabe, próximo passo de validação — schema estruturado (`SUMMARY / FACTS / SIGNALS / HYPOTHESES / SUPPORTING_EVIDENCE / CONTRADICTING_EVIDENCE / UNKNOWNS / CONFIDENCE / RECOMMENDED_NEXT_STEP`).

## Pesquisa externa

- Disparada por um sinal ou pergunta de inteligência real, nunca aleatória.
- Hierarquia de fonte: (1) documentação oficial, (2) fontes técnicas especializadas confiáveis, (3) estudos/benchmarks, (4) discussões de comunidade — nenhuma sozinha é suficiente para ação de alto impacto.
- Todo registro de pesquisa guarda: query, motivo, gatilho, fonte, data, resumo, relevância, evidência, limitações.

## Recomendação

- Objeto estruturado (categoria, o que está acontecendo, por que importa, diagnóstico, fatos, sinais, hipóteses, evidência, ação recomendada, impacto esperado, confiança, prioridade, risco, necessidade de aprovação, status de ciclo de vida).
- Nunca genérica ("melhore suas campanhas") — sempre específica e acionável.

## Central de ações

- Ciclo de vida: `DETECTED → ANALYZED → RECOMMENDED → PENDING_APPROVAL → APPROVED → SCHEDULED → EXECUTED → MEASURED → LEARNED` (ou `REJECTED/EXPIRED/INVALIDATED`).
- Action Guardian valida dado suficiente, validade, conflito, cooldown, permissão e política de risco antes de qualquer execução.
- Fases iniciais operam só em Nível 1 (recomendação) + Nível 2 (aprovação humana obrigatória) — nunca Nível 3+ (execução automática) sem histórico de medição.

## Medição e aprendizado

- Antes/depois por ação, janela de avaliação, resultado (`POSITIVE/NEGATIVE/NEUTRAL/INCONCLUSIVE/INSUFFICIENT_DATA`) — nunca forçar um resultado quando a evidência é insuficiente.
- Histórico de decisões alimenta prioridade/confiança de recomendações futuras — sem complexidade de ML prematura antes de haver dado histórico suficiente.
