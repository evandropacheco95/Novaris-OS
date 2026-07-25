# 01 · Arquitetura

Documentação técnica de como o NOVARIS é construído: visão de sistema, stack tecnológica, modelagem de dados, design de APIs e estratégia multi-tenant.

Esta é a seção mais crítica do repositório: qualquer mudança estrutural relevante deve ser refletida aqui **antes** de ser implementada. O histórico de decisões arquiteturais (ADRs) vive em [adr/](../adr/README.md), pasta irmã desta.

## Conteúdo

| Arquivo/Pasta | Descrição |
|---|---|
| [visao-geral-do-sistema.md](visao-geral-do-sistema.md) | Diagrama e descrição macro dos componentes do sistema |
| [stack-tecnologica.md](stack-tecnologica.md) | Justificativa e detalhes de cada tecnologia adotada |
| [modelagem-de-dados.md](modelagem-de-dados.md) | Esquema do banco de dados PostgreSQL/Supabase |
| [design-de-api.md](design-de-api.md) | Convenções de API REST/RPC expostas pela plataforma |
| [multi-tenancy.md](multi-tenancy.md) | Estratégia de isolamento entre clientes/organizações |
| [ADM/](ADM/README.md) | Architecture Decision Matrix — índice executivo de todas as decisões arquiteturais aprovadas (Missão ADM-0001) |

ADRs: ver [adr/](../adr/README.md). Engineering Standards (ENS — padrões obrigatórios de implementação ou de processo): ver [knowledge/engineering/standards/](../knowledge/engineering/standards/README.md) — [AGGREGATE_IMPLEMENTATION_STANDARD.md](../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (como implementar um Aggregate, Missão ENS-0001), [ARCHITECTURE_REVIEW_GATE_STANDARD.md](../knowledge/engineering/standards/ARCHITECTURE_REVIEW_GATE_STANDARD.md) (gate PASS/FAIL ao final de toda missão `ENG-`, Missão ENS-0002), [DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md](../knowledge/engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) (como implementar um Domain Service, genérico para qualquer domínio, Missão ENS-0003). Guia mestre de todo o processo de engenharia, leitura linear: [knowledge/engineering/NOVARIS_ENGINEERING_HANDBOOK.md](../knowledge/engineering/NOVARIS_ENGINEERING_HANDBOOK.md) (Missão NEP-0001).

> ⚠️ A Ordem de Missão ADM-0001 pediu `docs/architecture/README.md` — esse caminho não existe (`docs/01-arquitetura/` foi promovido para cá, `architecture/`, por [ADR-0002](../adr/ADR-0002-reestruturar-arvore-do-repositorio.md)). Entendido como este documento, para não recriar um caminho já deprecado. Ver [ADM/ARCHITECTURE_DECISION_MATRIX.md § Nota sobre o Caminho](ADM/ARCHITECTURE_DECISION_MATRIX.md).

## Status

🚧 Arquitetura de referência a ser detalhada antes do início da implementação. [ADM/](ADM/README.md) é a exceção — já tem conteúdo real.
