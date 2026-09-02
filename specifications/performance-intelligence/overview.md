# Performance Intelligence — Overview

> Constituição do produto. Preserva os princípios do master-context doc fornecido pelo usuário (2026-09-01). Refinamentos futuros de implementação podem mudar tecnologia e sequenciamento, mas **não podem violar os não-negociáveis da seção "Princípios"** abaixo sem um novo ADR explícito.

## Objetivo

Uma plataforma de análise, gestão e otimização de mídia paga com suporte a decisão — não um dashboard. Vai além de "quanto foi gasto / quantos cliques" para responder: o que aconteceu, o que mudou, por que provavelmente mudou, isso é relevante ou é ruído, onde estamos perdendo dinheiro, onde há oportunidade, o que fazer, com que evidência, com que confiança, com que risco, e (depois de executado) se realmente funcionou.

Plataforma inicial: **Google Ads**. Empresas iniciais: **Winnet Metais** e **Allbinox Metais**. Desenhado desde o início para suportar múltiplas empresas, múltiplas contas por empresa e futuras plataformas de mídia paga (Meta Ads, etc.) sem redesenho.

## O ciclo central de operação

```
COLLECT → NORMALIZE → ANALYZE → DETECT → DIAGNOSE → RESEARCH →
RECOMMEND → VALIDATE → APPROVE → EXECUTE → MEASURE → LEARN
```

Cada estágio tem responsabilidade própria e não deve ser fundido arbitrariamente com outro. Detalhe de cada estágio: ver seção 4 do master doc original, resumida em [features.md](features.md).

## Distinção não-negociável: Fato / Sinal / Hipótese / Recomendação

- **Fato** — um dado objetivamente observado (ex.: "custo subiu de R$1.000 para R$1.400").
- **Sinal** — um padrão ou desvio relevante detectado (ex.: "custo subiu 40% enquanto conversões ficaram estáveis").
- **Hipótese** — uma explicação possível, nunca apresentada como fato (ex.: "o aumento de CPC pode estar contribuindo").
- **Recomendação** — uma ação concreta proposta, com evidência, impacto esperado, confiança, risco e necessidade de aprovação explícitas.

O sistema nunca apresenta uma hipótese como fato.

## Princípios (não-negociáveis)

1. **Nunca inventar dado.** Estados explícitos (`NOT_CONNECTED`, `NO_DATA`, `SYNC_REQUIRED`, `INSUFFICIENT_DATA`, `AI_UNAVAILABLE`, `ERROR`...) substituem qualquer fallback de dado simulado em produção. *(O protótipo Python `Desktop/Winnet/google-ads-analyzer` viola este princípio — por isso está sendo aposentado, não migrado.)*
2. **Nunca apresentar hipótese como fato.**
3. **Nunca otimizar usando uma métrica isolada sem contexto** (ex.: CTR caiu não significa "piorou" sem olhar impressões, cliques, conversões, CPC e mix de termos de busca juntos).
4. **Nunca permitir acesso cross-company sem autorização explícita.** Isolamento multi-tenant reforçado em código, não só em RLS (mesmo padrão já adotado em `OpportunityController` do CRM, `ADR-0057`).
5. **Nunca expor credenciais** (API keys, client secrets, refresh/access tokens, developer token do Google Ads) ao frontend ou a logs.
6. **Nunca tratar conteúdo web aleatório como verdade automática.** Pesquisa externa gera conhecimento/hipótese; dado da própria conta valida a relevância antes de virar recomendação.
7. **Nunca executar mudanças de alto impacto sem política de aprovação apropriada.** Fases iniciais operam em Nível 1 (só recomendação) + Nível 2 (aprovação humana obrigatória) — nunca começar por execução autônoma irrestrita.
8. **Nunca construir autonomia antes de medição e aprendizado.** A ordem é fixa: dado real → armazenamento confiável → análise determinística → detecção de sinal → interpretação por IA → pesquisa → recomendação → ação controlada → medição → aprendizado. Essa ordem não deve ser invertida.
9. **Sempre preservar evidência** e **sempre preservar auditabilidade** (quem, o quê, antes/depois, quando, por quê, resultado).

## Os 5 níveis de análise

1. **Conta** — investimento, conversões, CPA, ROAS, anomalias.
2. **Campanha** — melhores/piores, tendência, sinais, recomendações.
3. **Grupo de anúncios** — estrutura, relevância, segmentação.
4. **Palavras-chave e termos de busca** — classificação de intenção (alta intenção comercial, comercial, pesquisa, informacional, irrelevante), candidatos a negativação, candidatos a expansão. Uma classificação semântica isolada nunca aciona ação automática — sempre combinada com performance, contexto de negócio e estágio de funil.
5. **Mercado e oportunidade externa** — pesquisa (Google Ads policy/features, benchmarks, tendências), sempre disparada por um problema real, nunca "pesquisa aleatória".

## Framework PULSE

**P**erformance · **U**nderperformance Detection · **L**earning & Trends · **S**earch Intelligence · **E**xecution — guia o raciocínio de produto em todas as fases.

## Motor de detecção — abordagem híbrida

`RULE BASED DETECTION` (limiares configuráveis, auditáveis) + `STATISTICAL DETECTION` (volume absoluto, tamanho de amostra, baseline histórico, sazonalidade — nunca declarar anomalia só por variação percentual) + `AI CONTEXTUAL DIAGNOSTICS` (múltiplos sinais → hipóteses, evidência a favor/contra, o que falta saber). IA nunca substitui cálculo determinístico.

## Modelo de agentes de IA (especializados, não um "super-agente")

- **Performance Analyst** — interpretação de métricas, comparação de período.
- **Campaign Diagnostician** — geração de hipóteses, evidência a favor/contra, próximos passos de validação.
- **Search Intelligence Agent** — classificação de intenção, candidatos a waste/negativação/expansão.
- **Optimization Strategist** — transforma inteligência em recomendação concreta, priorização, risco.
- **Research Agent** — pesquisa externa hierarquizada por fonte, extração de evidência, limitações.
- **Action Guardian** — valida suficiência de dado, risco, conflito, cooldown, permissão e elegibilidade de execução antes de qualquer ação. Nenhum agente tem permissão de mutação irrestrita.

## Score de prioridade

`Impacto Esperado × Confiança × Urgência × Reversibilidade ÷ (Risco + Custo de Implementação)` — fórmula exata configurável, não hardcoded prematuramente. Faixas de saída: 0–39 Baixo, 40–59 Médio, 60–79 Alto, 80–100 Crítico.

## Filosofia de automação (a autonomia é conquistada, não assumida)

`Ver → Entender → Recomendar → Aprovar → Executar → Medir → Aprender → Automatizar decisões de baixo risco selecionadas` — cada etapa exige evidência, medição, confiabilidade, política e histórico antes de avançar para a próxima.

## Composição no NOVARIS (Product Layer, não Domain Layer)

Este produto **não é** um bounded context técnico novo — é composição de domínios/kernel já existentes, mesmo teste já aplicado a `NOVARIS Growth` ([ADR-0007](../../adr/ADR-0007-domain-boundaries.md)). Ver [database.md](database.md) e [ADR-0058](../../adr/ADR-0058-novaris-performance-intelligence-product.md) para o mapeamento completo.

## Fonte

Texto completo original (inglês, master-context doc do usuário, seções 1-55) preservado fora deste repositório na conversa que originou este produto; este overview é a tradução/curadoria dos princípios que precisam sobreviver a qualquer implementação futura, não uma cópia literal seção-a-seção.
