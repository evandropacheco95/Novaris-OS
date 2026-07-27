# ADR-0051: `Pipeline` ganha `name`, `Stage` ganha `order`, multi-pipeline por Organização

## Status

Aceita.

## Contexto

`ADR-0021` classificou `Pipeline`/`Stage` como "Configuration Aggregate" numa forma deliberadamente mínima: `Pipeline` sem `name`, `Stage` sem ordem/posição, e "mecanismo exato de criação/edição" registrado como `Needs Evidence` — não inventado por falta de fonte. Consequência prática, confirmada por auditoria nesta sessão: `Infrastructure` (`PrismaPipelineRepository`/`PrismaPipelineMapper`) já foi implementada de ponta a ponta (`ENG-0043`/missões seguintes), mas nunca ganhou `Application`/`API`/`Frontend` — não existe forma de um usuário criar, nomear ou reordenar um `Pipeline` através do sistema. `pipelineId`/`currentStageId` em `Opportunity` seguem como campos passivos, aceitos mas nunca populados por um Pipeline gerenciável.

O CTO pediu para fechar esse gap (achado de auditoria de escopo completo desta sessão) e tomou as 2 decisões de produto que faltavam:
1. **Múltiplos `Pipeline`s nomeados por Organização** (não um único default implícito).
2. **Reorder de `Stage` via drag-and-drop** na UI.

Ambas contrariam a forma congelada por `ADR-0021` — esta ADR documenta a mudança de escopo, sem reabrir o que já está resolvido (`Pipeline` continua Aggregate Root próprio; `Stage` continua Entity interna; `organizationId` como raiz de referência não muda).

## Decision Drivers

- Sem `name`, é impossível para um usuário distinguir entre múltiplos Pipelines — pré-requisito estrutural direto da decisão "multi-pipeline nomeado".
- Sem `order` em `Stage`, a única "ordem" possível seria a ordem de leitura do array retornado pelo Prisma — não confiável para persistir um reorder feito via drag-and-drop.
- Confirmado via query real no Postgres de produção (Supabase): 0 linhas em `pipelines`/`stages` hoje — nenhum dado real existe para migrar/quebrar, porque nenhum Controller jamais existiu para criar uma.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. Adicionar `name`/`order`, Application+API+Frontend completos, DnD real via nova dependência** | Fecha o gap de ponta a ponta, como as decisões do CTO exigem | Escolhida |
| B. Manter forma mínima de `ADR-0021`, só reordenar visualmente sem persistir | Não atende a decisão do CTO (reorder precisa sobreviver a reload) | Rejeitada |
| C. Único Pipeline default por Organização, sem `name` | Mais simples, mas contraria diretamente a decisão "multi-pipeline nomeado" do CTO | Rejeitada |

## Decision

**Opção A.**

- `PipelineProps`/`CreatePipelineInput` ganham `name: string`; `Pipeline` ganha método `rename(name)`.
- `StageProps`/`CreateStageInput` ganham `order: number`; `Stage` ganha método `rename(name)`. `Pipeline.addStage()` atribui `order` automaticamente (próximo índice livre); novo método `Pipeline.reorderStages(orderedStageIds)` valida que o conjunto de ids bate exatamente com os Stages existentes e reatribui `order` sequencialmente.
- Nenhum Domain Event novo — mantém a restrição original de `ADR-0021`/`ENG-0043` (nenhuma fonte nomeia evento de `Pipeline`/`Stage`); mudança de escopo é só estrutural (campos + mutação), não comportamental.
- `Application`/`API` novos, seguindo exatamente o padrão de `Lead`/`Quotation` (`ADR-0042`/`0043`): Commands congelados, Handlers find→mutate→save, `PipelineController` com `@RequirePermission("sales.pipelines.manage")`.
- `Frontend`: nova tela `/pipelines`, usando `@dnd-kit/core`+`@dnd-kit/sortable` (nova dependência — primeira lib de UI "pesada" desde o Recharts em `ENG-0149`, justificada porque reorder real via drag-and-drop não é reimplementável com `IntersectionObserver` como os efeitos anteriores de `ENG-0158`).
- **Fora de escopo**: religar `Opportunity.pipelineId`/`currentStageId` ao board de `/opportunities` para filtrar por Stage real — não foi pedido pelo CTO agora, fica para decisão futura.

## Consequences

- Migration Prisma nova: `pipelines.name` (`String`, `NOT NULL`), `stages.order` (`Int`, `NOT NULL`) — segura porque não há linha existente a quebrar (confirmado acima).
- `PrismaPipelineMapper`/`PrismaPipelineRepository` passam a persistir `name`/`order` reais (antes: `update: {}` vazio no upsert do Pipeline, porque não havia nada para atualizar).
- Nova permissão `sales.pipelines.manage` no catálogo (`ADR-0036`).
- Nova dependência de runtime em `apps/web`: `@dnd-kit/core`, `@dnd-kit/sortable`.
- `ADR-0021` não é invalidada — continua a fonte da classificação estrutural de `Pipeline`/`Stage` (Aggregate Root de configuração + Entity interna); esta ADR só resolve o subconjunto de pendências que o CTO decidiu agora (nome + ordem), mantendo registradas como ainda abertas as demais (mecanismo fino de quem pode criar/editar, além do gate de permissão já padrão).
