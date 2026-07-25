# standards

## Objetivo

Padrões de engenharia (ENS) — documentos obrigatórios que definem **como** fazer algo de forma consistente em toda a NOVARIS: implementar um tipo de bloco de código (Aggregate, Domain Service) ou executar um processo de engenharia (Architecture Review Gate). Diferente do [ENGINEERING_PLAYBOOK.md](../ENGINEERING_PLAYBOOK.md) (padrão geral de arquitetura de serviço), cada ENS aqui é um mergulho profundo em um tipo específico de componente ou processo.

## Conteúdo

- [AGGREGATE_IMPLEMENTATION_STANDARD.md](AGGREGATE_IMPLEMENTATION_STANDARD.md) — padrão obrigatório de implementação de Aggregates (Missão ENS-0001). ⚠️ **Nota (ENG-0038)**: existe um documento de **mesmo nome** em [`knowledge/architecture/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md`](../../architecture/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) — não é um duplicado nem um substituto, é uma extensão para Business Domains (`services/domains/`), que não altera nenhuma regra deste documento. Este arquivo (ENS-0001) permanece a única fonte das regras centrais.
- [ARCHITECTURE_REVIEW_GATE_STANDARD.md](ARCHITECTURE_REVIEW_GATE_STANDARD.md) — gate binário PASS/FAIL obrigatório ao final de toda missão de implementação (`ENG-`), antes do Relatório Final e da aprovação do CTO (Missão ENS-0002).
- [DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md](DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) — padrão obrigatório de implementação de Domain Services, inteiramente genérico, reutilizável por qualquer domínio (Missão ENS-0003).

## Relação com Outros Módulos

- [ENGINEERING_PLAYBOOK.md](../ENGINEERING_PLAYBOOK.md) — base arquitetural que todo ENS detalha, nunca contradiz
- [architecture/ADM/](../../../architecture/ADM/README.md) — índice executivo de decisões, referencia os ENS vigentes
- [.command-center/EXECUTION_PROTOCOL.md § Fase 11](../../../.command-center/EXECUTION_PROTOCOL.md) — onde os relatórios obrigatórios de cada ENS entram no fluxo de encerramento de missão
- [services/kernel/identity/DOMAIN_SERVICE_IDENTIFICATION.md](../../../services/kernel/identity/DOMAIN_SERVICE_IDENTIFICATION.md) — domínio de referência que originou os critérios de existência usados no `DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md`

## Status

🟢 3 Standards — Aggregates (ENS-0001), Architecture Review Gate (ENS-0002), Domain Service Implementation (ENS-0003).
