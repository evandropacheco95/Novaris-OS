# ADR-0052: `SalesChannel` como Aggregate Root de configuração do Sales Domain

## Status

Aceita.

## Contexto

Análise de um projeto real de cliente da Elite Negócios (Winnet, indústria+e-commerce com canal de venda direto, `ENG-0166`) identificou que "canal de venda" muda o modelo de dados de forma estrutural — preço, custo e regra própria por canal — e que a ausência dessa modelagem levou a Winnet a construir 2 sistemas totalmente separados (CRM de venda direta + Dashboard Marketplace) só para representar canais diferentes. `NOVARIS_OS.md § 9` já lista "Distribuidores" como público-alvo oficial, e o `Opportunity`/`Quotation` atuais não têm nenhum conceito de canal — toda venda é implicitamente "direta".

O CTO confirmou 4 canais a modelar (todos os apresentados, nenhum descartado): Direto, Distribuidor/Revenda, Marketplace, Loja própria online.

## Decision Drivers

- Mesmo padrão já usado para `Pipeline` (`ADR-0021`) e `Product` (`ADR-0043`): um catálogo nomeado, referenciado por id por `Opportunity`, gerenciável pela própria Organização — nenhum canal é fixo/global do sistema.
- Precificação por canal (o que a Winnet de fato tem via `pricing_rules`/`competitor_cache` por SKU+canal) é uma extensão real, mas maior — decisão explícita de não incluir agora, mesmo critério de não inventar mecanismo sem fonte/decisão do CTO.
- `Opportunity` já referencia `Pipeline`/`Party` só por id, nunca embute — mesmo padrão se aplica a `SalesChannel`.

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| **A. `SalesChannel` como Aggregate Root próprio, `Opportunity.salesChannelId` opcional** | Canal como conceito de primeira classe, reaproveitável por qualquer objeto futuro (Product, Quotation) sem redesenho | Escolhida |
| B. `type` como enum simples direto em `Opportunity`, sem Aggregate próprio | Mais simples, mas cada Organização fica presa aos 4 tipos fixos, sem nome/gestão própria (ex.: "Distribuidor - Zona Sul" vs. "Distribuidor - Zona Norte") | Rejeitada — Winnet mostrou que canais têm identidade própria, não só um tipo |
| C. Incluir precificação por canal já nesta missão | Resolveria o caso de uso completo da Winnet de uma vez | Rejeitada agora — maior escopo, sem decisão do CTO sobre o mecanismo de preço/custo por canal; fica para decisão futura |

## Decision

**Opção A.**

- `SalesChannel` — novo Aggregate Root do Sales Domain, mesma forma estrutural de `Pipeline`: `organizationId`, `name` (obrigatório), `type` (enum fechado: `direct`/`distributor`/`marketplace`/`online_store`, os 4 confirmados pelo CTO — nenhum tipo adicional inventado), `active` (`true` por padrão, mesmo padrão de `Product`). Sem Domain Event (mesmo critério de `Pipeline`/`Product` — nenhuma fonte nomeia evento de canal).
- `create()`, `rename()`, `activate()`/`deactivate()` — mesmo conjunto mínimo de `Product`, sem invariante adicional além de `name` não vazio.
- `Opportunity` ganha `salesChannelId?: UniqueEntityId` opcional — referência por id, nunca embute, mesmo padrão de `pipelineId`/`partyId`. `undefined` = comportamento de toda Opportunity anterior a esta missão (canal direto implícito, preservado).
- `Application`/`API`: mesmo padrão de `Pipeline`/`Product` — Commands congelados, Handlers find→mutate→save, `SalesChannelController` com `@RequirePermission("sales.sales-channels.manage")` e `@RequireDomain("Sales")` (`PlanGuard`, `ENG-0165`).
- `Frontend`: seletor de canal (opcional) no formulário de `Opportunity`, nova tela mínima de gestão de canais (`/sales-channels` ou seção dentro de `/opportunities` — decidido na implementação, sem impacto arquitetural).
- **Fora de escopo, decisão futura**: precificação/custo por canal (`ProductChannelPrice` ou similar), regras de comissão por canal, canal em `Quotation`/`Product` diretamente (só `Opportunity` por enquanto).

## Consequences

- Migration Prisma nova: tabela `sales_channels` (`organization_id`, `name`, `type` com `CHECK` fechado nos 4 valores, `active`), e `opportunities.sales_channel_id` (nullable, sem FK — mesmo padrão de referência por id sem FK já usado no resto do domínio).
- Nova Permission no catálogo (`ADR-0036`): `sales.sales-channels.manage`.
- `PrismaSalesChannelMapper`/`PrismaSalesChannelRepository` novos, mesmo padrão de `PrismaPipelineRepository`.
- Não resolve a fronteira "preço por canal" que a Winnet de fato tem implementada — `SalesChannel` aqui é só identidade/gestão do canal, não precificação. Registrado como próximo passo natural, não implementado por falta de decisão de mecanismo.
