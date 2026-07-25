# ADR-0001 - Registrar Decisões de Arquitetura como ADRs

## Status

Aceito

## Contexto

O NOVARIS é um projeto que integra múltiplas tecnologias complexas (Next.js, Supabase, PostgreSQL, múltiplos provedores de IA, automação via n8n). Sem um registro formal, decisões arquiteturais tendem a se perder em conversas, PRs ou na memória de quem as tomou, causando retrabalho e inconsistência.

## Decisão

Toda decisão de arquitetura com impacto relevante (escolha de tecnologia, padrão estrutural, trade-off de segurança/performance/custo) será registrada como um ADR nesta pasta, seguindo a estrutura:

- **Status**: Proposto / Aceito / Revogado (superseded) / Depreciado
- **Contexto**: qual problema motivou a decisão
- **Decisão**: o que foi decidido
- **Consequências**: trade-offs aceitos, impactos positivos e negativos

## Consequências

- **Positivas**: histórico rastreável, onboarding mais rápido, decisões defensáveis.
- **Negativas**: overhead de escrever um documento antes de codificar; mitigado por manter os ADRs curtos e objetivos.
