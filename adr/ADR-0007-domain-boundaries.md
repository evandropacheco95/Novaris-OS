# ADR-0007 - Domain Boundaries: Product Layer vs. Domain Layer

## Problema

`ENG-0000.1` criou `services/domains/growth/`, junto com `sales/`, `financial/` e `projects/`. `growth` não corresponde a nenhum dos 13 domínios de [DOMAIN_MODEL.md](../knowledge/core/DOMAIN_MODEL.md) — é um dos 9 produtos de [PRODUCTS.md](../knowledge/core/PRODUCTS.md). Misturar as duas camadas em `services/domains/` cria bounded contexts sem correspondência técnica real, e cedo ou tarde levaria a um "serviço Growth" sem responsabilidade de dados clara.

## Contexto

A plataforma tem duas camadas conceituais distintas, que este repositório documentava sem nomear formalmente a distinção:

- **Product Layer** ([PRODUCTS.md](../knowledge/core/PRODUCTS.md)) — o que a NOVARIS vende ao cliente: Growth, CRM, AI, Automation, Studio, Analytics, Projects, Marketplace, Financial. Um produto é uma proposta de valor comercial, não uma fronteira de dados.
- **Domain Layer** ([DOMAIN_MODEL.md](../knowledge/core/DOMAIN_MODEL.md)) — bounded contexts técnicos (DDD): Identity, Workspace, Relationship, Sales, Activity, Project, Marketing, Knowledge, AI, Automation, Financial, Analytics, System. Um domínio é uma fronteira de dados e responsabilidade, com objetos e eventos próprios.

Um produto é entregue por um ou mais domínios — nunca é, em si, um domínio. "NOVARIS Growth" (diagnóstico, planejamento, OKRs, consultoria) não tem objetos de dados próprios no BOM; é entregue combinando os domínios `Sales`, `Analytics`, `Marketing` e `Customer` (antigo `Relationship`), entre outros.

## Alternativas

1. **Manter `growth` como domínio técnico** — rejeitada; não tem bounded context real (nenhum objeto do BOM pertence a ele), e mantê-lo formalizaria a confusão entre as duas camadas.
2. **Renomear `growth` para um domínio existente** (ex.: fundir em `sales`) — rejeitada; perderia a possibilidade de eventualmente modelar Growth como composição de múltiplos domínios, que é o que ele realmente é.
3. **Remover `growth`, formalizar a distinção Product/Domain Layer, adicionar os bounded contexts que realmente faltavam** (`customer`, `marketing`, `analytics`) — escolhida.

## Escolha

- Remover `services/domains/growth/`.
- Adicionar `services/domains/{customer,marketing,analytics}/`, correspondendo a `Relationship` (renomeado, como bounded context, para `customer`), `Marketing` e `Analytics` de `DOMAIN_MODEL.md`.
- `PRODUCTS.md` permanece a fonte da Product Layer; `DOMAIN_MODEL.md` permanece a fonte da Domain Layer. Nenhum dos dois documentos teve seu conteúdo original reescrito — só as seções de referência cruzada.

## Consequências

Positivas: `services/domains/` passa a conter só bounded contexts com objetos de dados reais no BOM, coerente com o próprio objetivo de `DOMAIN_MODEL.md` ("todo objeto pertence a exatamente um domínio"). A distinção Product/Domain Layer fica documentada para não se repetir com outros produtos (ex.: "Studio", "AI" também não devem virar pasta em `services/domains/` sob esse nome, a menos que também sejam domínios — `AI` de fato é, em `DOMAIN_MODEL.md`; `Studio` não é).

Negativas: qualquer trabalho futuro que precise nomear "o serviço de Growth" precisa compor múltiplos domínios (`sales`, `customer`, `marketing`, `analytics`) em vez de apontar para um único bounded context — mais complexo de orquestrar, mas reflete a realidade do domínio, não uma simplificação artificial.

## Impacto Futuro no SaaS

`NOVARIS_OS.md § 7` e `PRODUCTS.md` ambos incluem um produto agregador (`NOVARIS SaaS` ou o conjunto Marketplace/API Pública/White-Label) que, como `Growth`, provavelmente não corresponde a um único domínio técnico — é composição de vários (`System`, `Workspace`, possivelmente um futuro domínio de `Marketplace` ainda não criado). Este ADR estabelece o precedente: antes de criar `services/domains/<produto>/` para qualquer novo produto, verificar primeiro se ele tem objetos de dados próprios no BOM (é um domínio) ou se é composição de domínios já existentes (é Product Layer, não ganha pasta em `services/domains/`).

## Responsável

Decisão de arquitetura: usuário (Ordem de Missão ENG-0000.2 — "Domain Boundary Correction Mission"). Execução: Engenheiro Principal.

## Data

2026-07-14

## Impactos

`services/domains/growth/` removido. `services/domains/{customer,marketing,analytics}/` criados. Referências cruzadas atualizadas em `DOMAIN_MODEL.md`, `CANONICAL_DATA_MODEL.md`, `UBIQUITOUS_LANGUAGE.md`, `PRODUCTS.md`, `services/README.md`, `services/domains/README.md`, `PROJECT_RULES.md`, `ADR-0006`, `README.md`, `CHANGELOG.md`. Nenhum código de serviço implementado.

## Plano de Migração

Não aplicável — `growth/` continha só `README.md` de estrutura, nenhum código a migrar.

## Status

Aceito
