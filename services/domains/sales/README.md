# sales

## Purpose

Bounded Context de negócio `Sales` — administra a negociação comercial da NOVARIS desde a criação de uma oportunidade até seu fechamento (ganho, perdido, ou convertido em contrato), através de um fluxo configurável de etapas.

## Responsibilities

Oportunidades, Pipelines, Etapas, Negociação, Propostas, Contratos, Receitas — reproduzido de [`DOMAIN_MODEL.md § SALES DOMAIN`](../../../knowledge/core/DOMAIN_MODEL.md), "Responsável por". Objetos: `Opportunity`, `Pipeline`, `Stage`, `Proposal`, `Quotation`, `Contract`, `Revenue`.

**`Lead` (`ADR-0042`, `ENG-0143`)**: adaptado do Lead-to-Convert do Salesforce, por autorização direta do CTO ("adapte tudo do salesforce para o Novaris"). Captura mínima de um contato antes de virar `Party` — `ConvertLeadHandler` cria um `Party` real (Customer Domain) e, opcionalmente, uma `Opportunity`, numa única operação.

**`Product` + `Quotation` (`ADR-0043`, `ENG-0144`)**: adaptados do Salesforce Product2/Quote. `Product` é o catálogo interno (nome/sku/preço). `Quotation` preenche a lacuna estrutural que este mesmo campo já tinha reservada desde `ADR-0020` ("distinto de Proposal, não sinônimo", forma nunca definida) — Aggregate Root próprio (não Internal Entity de `Opportunity`, permite múltiplas revisões de preço por Opportunity), com `QuotationLineItem` (Internal Entity, preço snapshot no momento da adição) e ciclo `draft → sent → accepted/rejected`. **`Product.deactivate()`/`activate()` (`ENG-0155`)**: os dois métodos já existiam no Domain e eram testados na Infrastructure desde `ENG-0144`, mas nunca tinham Command/Handler/rota — achado real, fechado com `DeactivateProductHandler`/`ActivateProductHandler` (Application) e `POST /products/:id/deactivate`/`activate`. Na mesma missão, corrigida uma falha de segurança real em `ProductController.updatePrice` (única rota do domínio sem checagem de `organizationId` — permitia alterar preço de Product de outra Organization) aplicando o mesmo `loadAndAssertOwnership` já usado por `Contract`/`Quotation`/`Campaign`/`Dashboard`.

**`Contract` (`ADR-0044`, `ENG-0145`)**: gerado exclusivamente a partir de uma `Quotation` `accepted` (`GenerateContractFromQuotationHandler`, composição intra-domínio Sales→Sales, nunca automático via `Quotation.accept()`). Ciclo `draft → active → terminated`, sem reversão.

**`Revenue` (`ADR-0047`, `ENG-0152`)**: gerado exclusivamente a partir de um `Contract` `active` (`GenerateRevenueFromContractHandler`, mesmo padrão de composição). Registro pontual e imutável (`contractId`/`amount`/`currency`/`recognizedAt`), sem `status` e sem verificação de unicidade — múltiplos Revenue podem existir para o mesmo Contract (reconhecimento incremental). Fecha o último objeto oficial do Sales Domain sem posição resolvida.

## Allowed Dependencies

Referência por id apenas — nunca por objeto embutido: `Identity` (`UserId`), `Organization` (`organizationId`), `Customer`/`Relationship` (`Party`), `Projects` (`Task`, [`ADR-0016`](../../../adr/ADR-0016-task-ownership.md)), `Activity` (`Activity`, candidata). Todo acesso ao Kernel ocorre via [`packages/contracts/`](../../../packages/contracts/README.md), nunca diretamente.

**Exceção registrada (`ADR-0042`)**: `ConvertLeadHandler` (Application Layer) depende de `@novaris/customer`'s `CreatePartyHandler` — primeira vez que este domínio **cria** (não só referencia por id) um Aggregate de outro Business Domain. Permitido porque `DOMAIN_MODEL.md § DEPENDÊNCIAS` já autoriza Sales a depender de Customer (que vem antes na cadeia); mesmo mecanismo de Dependency Injection já usado por `ADR-0035` (Audit).

## Forbidden Dependencies

`Payment`/`Invoice`/`Billing` (pertencem a `Financial`); Customer lifecycle (`Party`/`Person`/`External Organization`, pertencem a `Customer`); Autenticação/Autorização (pertencem a `Identity`); qualquer acesso direto a tabela de outro domínio (`DOMAIN_MODEL.md § REGRAS`).

## Implementation Status

🟡 Domain Layer completo: `Opportunity`/`Pipeline` (Aggregate Roots), `Proposal`/`Stage` (Internal Entities), 4 Domain Events, `submitProposal()`/`approveProposal()` (`ENG-0039`–`ENG-0049`). Infrastructure Layer inicial implementada (Missão ENG-0050): `infrastructure/{persistence,mappers,repositories}/` — `InMemoryOpportunityRepository`/`InMemoryPipelineRepository` (armazenamento em memória, sem banco/ORM/schema real). Nenhum `service`/`contract`/`Command`/`Handler`/API/teste ou build config (`package.json`/`tsconfig.json`) criado ainda — este módulo não é buildável dentro do monorepo até uma missão dedicada de scaffolding de pacote existir (achado registrado em `ENG-0039 FINAL REPORT`, ainda não resolvido).

## Relation with SALES_TECHNICAL_BLUEPRINT.md

Esta estrutura de pastas materializa exatamente a árvore definida em [`SALES_TECHNICAL_BLUEPRINT.md § 4 (Folder Structure)`](../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md) — nenhuma pasta além das ali especificadas foi criada. Ver [`CONTRACT.md`](CONTRACT.md) para a fronteira pública deste domínio.

## Status

🟡 Domain Layer completo e testado (89 testes, `ENG-0039`–`ENG-0056`); Infrastructure Layer inicial (`ENG-0050`, em memória); pacote buildável, lintável e testável (`ENG-0051`) — corrigido em `ENG-0058`, achado registrado em `SALES_DOMAIN_COMPLETION_AUDIT.md § 8` (a afirmação anterior de que o módulo "não é buildável" estava desatualizada desde `ENG-0051`). `application/`/`contracts/` permanecem vazios.
