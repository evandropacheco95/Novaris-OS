# ADR-0021 — Pipeline Nature: Sales Configuration Object (Small Aggregate Root)

## Problema

`SALES_AGGREGATE_DESIGN.md` (ENG-0034) identificou `Pipeline` como a principal dependência estrutural não resolvida antes de qualquer Technical Blueprint de `Sales` — não coberto como Aggregate Root pelo mesmo documento, com nota explícita: "possivelmente pertencente a `Organization`... não determinado". A forma de `Stage` também ficou pendente, condicionada à resolução de `Pipeline` ("`Stage` é Entity interna de `Opportunity` ou referência externa a `Pipeline`? Não decidido"). Esta ADR resolve ambas as perguntas.

## Contexto

`BOM.md § 5 BUSINESS OBJECTS` define `Pipeline` como "Fluxo de trabalho configurável", na **mesma categoria** de `Opportunity`/`Stage`/`Proposal`/`Contract`/`Revenue` — não na categoria `4. CORE OBJECTS` (onde vive `Organization`) nem em qualquer categoria associada a configuração de plataforma. `UBIQUITOUS_LANGUAGE.md § Domínio: Sales` reforça: "Não usar como sinônimo de `Workflow` (Automation Domain) — `Pipeline` é específico de Sales" — distinção explícita de domínio, não apenas de vocabulário. `DOMAIN_OWNERSHIP.md § 3, seção Sales` já atribuía `Pipeline` a `Sales`, nunca contestado por nenhuma fonte.

Ao mesmo tempo, `Pipeline` nunca teve nenhum evento de domínio nomeado em nenhuma fonte (`BOM.md`, `UBIQUITOUS_LANGUAGE.md`, `DOMAIN_MODEL.md § EVENT BUS`) — diferente de `Opportunity` (3 eventos) e `Proposal` (1 evento) — e sua definição ("configurável") sugere um objeto de configuração/template reutilizável, não um registro transacional de negociação.

`Stage` é definido como "Etapa de um `Pipeline`" (`BOM.md`), com a advertência "Não usar isolado de um Pipeline" (`UBIQUITOUS_LANGUAGE.md`) — sua existência é sempre relativa a um `Pipeline`, nunca mencionada em relação direta a uma `Opportunity` específica em nenhuma definição própria (`Opportunity` apenas lista `Stage` entre seus "Relacionamentos", o que é compatível tanto com posse quanto com referência).

**Precedente estrutural direto**: o Identity Domain já resolveu um caso estruturalmente idêntico — `Role` é um Aggregate Root próprio, com identidade e persistência independentes, mas funciona como dado de configuração (conjunto de `Permission`s) referenciado por `User` por id, nunca embutido. `Role` nunca foi tratado como Entity interna de `User`, apesar de ambos pertencerem ao mesmo domínio (`Identity`) — precisamente porque um `Role` é compartilhado por múltiplos `User`s, violando a regra de que uma Entity interna pertence a exatamente uma instância de Aggregate.

## Alternativas

### Option A — Pipeline is an Aggregate (transacional, no sentido de `Opportunity`)

**Parcialmente correta, mas insuficiente sem qualificação.** `Pipeline` de fato precisa de identidade e persistência próprias (ver Estrutural, abaixo) — mas classificá-lo simplesmente como "um Aggregate" sem distinguir sua natureza de configuração do padrão transacional de `Opportunity` seria enganoso. Refinada em Option D.

### Option B — Pipeline is an Entity

**Rejeitada.** Um `Pipeline` é definido como "configurável" e é referenciado no plural por múltiplas negociações — a mesma definição de `Stage` ("etapa **de um** Pipeline") implica um relacionamento **compartilhado**: o mesmo `Pipeline` (com sua sequência de `Stage`s) é usado por várias `Opportunity`s ao longo do tempo. Uma Entity interna pertence a exatamente uma instância do seu Aggregate — se `Pipeline` fosse Entity interna de `Opportunity`, cada `Opportunity` teria sua própria cópia independente de `Pipeline`, contradizendo a própria noção de "fluxo configurável" reutilizável.

### Option C — Pipeline is Organization Configuration

**Rejeitada.** Nenhuma fonte, em nenhum momento, associa `Pipeline` a `Organization` — `BOM.md` o categoriza como objeto de negócio de `Sales` (`§ 5`, mesma seção de `Opportunity`), não como campo de configuração de `Organization` (`§ 4 CORE OBJECTS`, onde `featureFlags`/`settings`/`metadata` já vivem, `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 4`). `UBIQUITOUS_LANGUAGE.md` confirma explicitamente que `Pipeline` "é específico de Sales", não uma capacidade transversal de configuração de plataforma como `configuration`/`feature-flags` (Kernel, ainda "Discovery Required", `KERNEL_BOUNDARY_REVIEW.md § 5`) — não confundir os dois: `configuration`/`feature-flags` são candidatos a Domain Capability do Kernel, não relacionados a `Pipeline`.

### Option D — Pipeline is a Sales Configuration object

**Escolhida.** `Pipeline` é um objeto de configuração de negócio, propriedade do domínio `Sales` — não uma capacidade de plataforma (rejeita C) e não uma Entity interna de `Opportunity` (rejeita B). Estruturalmente, precisa de identidade e persistência próprias para ser reutilizado por múltiplas `Opportunity`s — o que, no vocabulário formal deste Kernel (`AggregateRoot`/`Entity`/`ValueObject`), só pode ser expresso como um **Aggregate Root pequeno, de natureza configuracional** (Option A, qualificada), no mesmo padrão estrutural já usado por `Role` dentro de `Identity`.

## Escolha

**`Pipeline` é um Aggregate Root de `Sales`, de natureza configuracional — um "Configuration Aggregate", não um Aggregate transacional como `Opportunity`.** Mesmo padrão estrutural de `Role` (`Identity`): identidade e persistência próprias, mutação rara (criado/editado por administradores da `Organization`, não por cada negociação), referenciado por id por múltiplas `Opportunity`s, nunca embutido.

**Owner**: `Sales` — confirmado, nunca esteve em disputa (`DOMAIN_OWNERSHIP.md`); esta ADR apenas resolve sua *forma estrutural*, não seu domínio de pertencimento.

**Lifecycle**: criação/edição administrativa (fora do fluxo de negociação de uma `Opportunity` individual) — mutação candidata, não confirmada por nenhuma regra de negócio explícita (`Needs Evidence` para o mecanismo exato, ver Consequências).

**Scope**: por `Organization` — cada `Organization` provavelmente define seu(s) próprio(s) `Pipeline`(s) configurável(is), consistente com a natureza multi-tenant já estabelecida para toda a plataforma (`organizationId` como raiz de referência universal, RN001). **Candidato, não confirmado** por nenhuma fonte explícita — nenhuma fonte declara literalmente "`Pipeline` pertence a uma `Organization`", mas é a leitura estruturalmente mais consistente com "configurável" em uma plataforma multi-tenant.

**External references**: `Pipeline` referencia `organizationId` (candidato, Open Host Service universal); é referenciado por `Opportunity` por id (nunca embutido).

**Relationship with Opportunity**: `Opportunity` referencia um `Pipeline` por id — não o possui, não o embute. `Opportunity` não pode mutar a estrutura de um `Pipeline` (adicionar/remover `Stage`s) através de si mesma.

**Relationship with Stage**: **`Stage` é Entity interna de `Pipeline`**, não de `Opportunity` — resolve a pendência deixada aberta por `SALES_AGGREGATE_DESIGN.md § 3/13`. `Stage` só existe no contexto de um `Pipeline` (`UBIQUITOUS_LANGUAGE.md`: "Não usar isolado de um Pipeline"), e a sequência ordenada de `Stage`s é exatamente o conteúdo estrutural do "fluxo de trabalho configurável" que define um `Pipeline`. `Opportunity` não possui `Stage` — mantém uma **referência** à sua etapa corrente (ex.: um `stageId`, ou equivalente, apontando para um `Stage` dentro do `Pipeline` referenciado), nunca um objeto `Stage` embutido.

## Consequências

**Positivas:**
- Resolve as duas principais pendências estruturais de `SALES_AGGREGATE_DESIGN.md` (`Pipeline` e `Stage`) numa única decisão coerente, sem inventar conteúdo novo — apenas aplicando o precedente estrutural já existente (`Role`/`Identity`).
- `Opportunity` como Aggregate Root fica mais simples e mais corretamente delimitado: referencia `Pipeline`/`Stage` por id, não os possui — reduz o risco de modelar `Opportunity` com uma fronteira transacional inflada.
- Introduz, com precedente citável, uma segunda instância do padrão "Configuration Aggregate" nesta engenharia (`Role` sendo a primeira) — reutilizável para casos futuros semelhantes.

**Negativas / pendências:**
- O mecanismo exato de criação/edição de `Pipeline` (quem pode, quando, se existe um `Pipeline` padrão por `Organization`) permanece `Needs Evidence` — não inventado aqui.
- Se `Pipeline` de fato referencia `organizationId`, isso não foi confirmado por nenhuma fonte de regra de negócio explícita — candidato estrutural, sujeito a revisão se evidência contrária surgir.
- `DOMAIN_MODEL.md`/`BOM.md`/`UBIQUITOUS_LANGUAGE.md` não são alterados por esta ADR — nenhum deles distingue hoje `Pipeline` como Aggregate Root separado de `Opportunity`; a divergência é registrada, não corrigida nos documentos-fonte (fora de escopo).
- `SALES_AGGREGATE_DESIGN.md` deve ser atualizado (ver Modified files do relatório desta missão) para refletir esta decisão — realizado como parte da mesma missão, dado que o documento é a base direta desta ADR.

## Responsável

Decisão de arquitetura: Engenheiro Principal, por delegação da Ordem de Missão `ENG-0035`, aplicando o precedente estrutural de `Role`/`Identity` a `Pipeline`/`Sales`. Execução: Engenheiro Principal.

## Data

2026-07-16

## Impactos

Criado: `adr/ADR-0021-pipeline-nature.md`. Atualizado: `knowledge/architecture/analysis/SALES_AGGREGATE_DESIGN.md` (ver relatório da missão). Nenhum código, Entity, Aggregate, contract, banco de dados ou service criado/alterado. `DOMAIN_MODEL.md` não alterado.

## Plano de Migração

Não aplicável — nenhum código ou dado real referenciava `Pipeline`/`Stage` antes desta decisão.

## Status

Aceito

---

## Relação com Outros Módulos

- [knowledge/architecture/analysis/SALES_AGGREGATE_DESIGN.md](../knowledge/architecture/analysis/SALES_AGGREGATE_DESIGN.md) (ENG-0034) — origem direta da pendência resolvida por esta ADR
- [knowledge/architecture/analysis/SALES_DOMAIN_DISCOVERY.md](../knowledge/architecture/analysis/SALES_DOMAIN_DISCOVERY.md) (ENG-0032) — Discovery original de `Sales`
- [services/kernel/organizations/ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 4](../services/kernel/organizations/ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md) — confirmação de que `Organization` não possui `Pipeline` entre seus campos (`featureFlags`/`settings`/`metadata` são os únicos candidatos de configuração ali)
- [services/kernel/identity/](../services/kernel/identity/) — precedente estrutural direto (`Role` como Configuration Aggregate referenciado por `User`)
- [knowledge/core/BOM.md § 5](../knowledge/core/BOM.md), [UBIQUITOUS_LANGUAGE.md § Domínio: Sales](../knowledge/core/UBIQUITOUS_LANGUAGE.md) — fonte de toda evidência textual usada nesta ADR
- [services/kernel/KERNEL_BOUNDARY_REVIEW.md § 5](../services/kernel/KERNEL_BOUNDARY_REVIEW.md) — distinção entre `Pipeline` (Sales) e `configuration`/`feature-flags` (Kernel, não relacionados)
