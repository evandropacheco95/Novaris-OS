# CreateOpportunity — Response Specification

Versão: 1.0.0

Status: 🟢 Especificação arquitetural congelada — nenhum código criado

Missão: ENG-0080 (Create Opportunity Response Specification)

Escopo: congelar o payload público de `CreateOpportunityResponse` antes de sua primeira implementação — o passo que faltava entre `CreateOpportunityRequest` (`ENG-0079`) e a implementação real do Response (`ENG-0081`, recomendada ao final deste documento). Esta missão **não implementa código, interface, classe, DTO, Contract, Handler, Controller, API, Aggregate, Entity, Repository, Mapper, Record ou teste**. Toda decisão de campo cita exclusivamente `opportunity.ts` (código real, já congelado), `SALES_CONTRACTS_LAYER_ARCHITECTURE.md` (`ENG-0078`) ou `SALES_DOMAIN_COMPLETION_AUDIT.md` (`ENG-0057`) — nenhum campo é inferido sem essa citação.

**Verify Before Reimplementing**: busca executada por "CreateOpportunityResponse", "Response Specification", "Response Contract", "Public Payload", "Output DTO", "Opportunity Response", "Response Architecture", "Payload Specification" em todo `knowledge/` — única ocorrência é a própria `SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 10`, que descreve o **padrão estrutural genérico** de todo Response futuro ("expor apenas os campos públicos já confirmados... ex.: `id`, `status`, `organizationId`"), nunca uma especificação de campos concreta para `CreateOpportunityResponse` — confirmado por leitura direta da seção antes de escrever este documento (ver resposta já dada ao CTO sobre essa mesma pergunta, nesta conversa). Nenhuma duplicação — este documento é a primeira especificação concreta de campos de um Response do Sales Domain.

---

## 1. Objetivo do Response

`CreateOpportunityResponse` é o payload público devolvido ao Cliente após a execução bem-sucedida do caso de uso `CreateOpportunity` — a tradução, na fronteira externa da Contracts Layer, do valor de sucesso de `Result<Opportunity, DomainError>` já devolvido por `CreateOpportunityHandler.execute()` (`ENG-0060`). Seu único propósito é comunicar ao Cliente qual `Opportunity` foi criada e em que estado ela se encontra — o suficiente para que operações futuras (`AdvanceOpportunityStage`, `SubmitProposal`, etc.) possam referenciá-la por `id`, sem expor nenhum detalhe interno do Aggregate.

## 2. Quem Consome Esse Response

O consumidor é qualquer Cliente externo da Contracts Layer (`SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 2`: "Cliente" — navegador, outro serviço, outro domínio) que tenha originado um `CreateOpportunityRequest` (`ENG-0079`). Não é consumido por nenhuma camada interna do Sales Domain — `Application`/`Domain`/`Infrastructure` já têm acesso à instância real de `Opportunity`, sem necessidade de um DTO serializado.

## 3. Informações Públicas que Pertencem ao Response

Exclusivamente os campos já expostos como getter público em `opportunity.ts` (linhas 273-299, mais `id`, herdado de `Entity`) — nenhum campo além destes existe hoje no Aggregate, e nenhum é inventado por este documento:

`id`, `organizationId`, `partyId`, `pipelineId`, `currentStageId`, `status`, `createdAt`, `updatedAt`.

## 4. Informações que NÃO Pertencem ao Response

- **Domain Events** (`OpportunityCreated`) — representam um fato já ocorrido, não estado; `SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 5` já proíbe expor Domain Event diretamente na Contracts Layer.
- **`Proposal`s da Opportunity** (`getProposals()`) — deliberadamente fora deste Response (ver § 7, item específico).
- **Dado de Repository/Infrastructure** (`OpportunityRecord`, chave de armazenamento interna) — a Contracts Layer nunca conhece a forma de persistência (`SALES_CONTRACTS_LAYER_ARCHITECTURE.md §§ 3, 5`).
- **A instância do Aggregate em si** — nunca serializada diretamente (§ 9).
- **Qualquer campo de `User`/`Task`/`Activity`/`Quotation`/`Contract`/`Revenue`** — nenhum existe em `OpportunityProps` hoje (`SALES_DOMAIN_COMPLETION_AUDIT.md § 10`); expô-los seria inventar um campo que o próprio Aggregate não possui.

## 5. Campos Obrigatórios

Todo campo abaixo é obrigatório em `OpportunityProps` (nunca `undefined` após `Opportunity.create()`, confirmado em `opportunity.ts` linhas 63-71, 95-109) — por isso sempre presentes no Response:

| Campo | Justificativa |
|---|---|
| `id` | Identidade da `Opportunity` recém-criada — sem ele, o Cliente não pode referenciar a `Opportunity` em nenhuma operação futura (`AdvanceOpportunityStage`/`SubmitProposal`/etc., todas exigem `opportunityId`) |
| `organizationId` | Campo obrigatório em `CreateOpportunityInput` (`opportunity.ts` linha 74) — nunca opcional na criação |
| `partyId` | Campo obrigatório em `CreateOpportunityInput` (`opportunity.ts` linha 75) — "negociação em andamento **com um Party**" (`UBIQUITOUS_LANGUAGE.md`, citado no próprio código) |
| `status` | Sempre `"open"` na criação (`opportunity.ts` linha 102) — nunca fornecido pelo chamador, sempre presente |
| `createdAt` | Gerado internamente em `create()` (`opportunity.ts` linha 96, 103) — sempre presente |
| `updatedAt` | Gerado internamente em `create()`, igual a `createdAt` no momento da criação — sempre presente |

## 6. Campos Opcionais

| Campo | Justificativa |
|---|---|
| `pipelineId` | Opcional em `CreateOpportunityInput` (`opportunity.ts` linha 76) — "nenhuma fonte confirma se são obrigatórios na criação" (comentário do próprio código, linha 92-93); pode estar ausente no Response exatamente quando ausente no Aggregate |
| `currentStageId` | Mesma justificativa de `pipelineId` — opcional em `opportunity.ts` linha 77 |

Ambos devem ser representados como opcionais no Response (`pipelineId?`, `currentStageId?`), nunca como `null` forçado nem como string vazia — mesma semântica de ausência já usada no `Request` (`ENG-0079`) e no `Command` (`ENG-0059`).

## 7. Campos Proibidos

| Campo/Dado | Por que nunca pode ser exposto |
|---|---|
| `domainEvents` / payload de `OpportunityCreated` | É um registro de fato ocorrido (`AggregateRoot._domainEvents`), não um campo de estado; nunca é uma coluna/campo persistido (`SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 8`), e pela mesma razão nunca é um campo de Response |
| `getProposals()` / lista de `Proposal` | No momento da criação, `Opportunity.create()` sempre inicia com `proposals: []` (`opportunity.ts` linha 106) — incluir uma lista sempre vazia não comunica informação real, e decidir **como** uma `Proposal` apareceria em um payload público é uma decisão de design ainda não tomada (pertence a um futuro `SubmitProposalResponse`, não a este documento) — antecipá-la aqui violaria "nunca antecipar regra/decisão" |
| Objetos internos (`props`, `OpportunityProps` inteiro) | `props` é estado interno protegido do Aggregate (`Entity<T>`, Shared Kernel) — nunca acessado fora da própria classe |
| Dado de Repository/Infrastructure (`OpportunityRecord`, chave de `Map`) | A Contracts Layer não conhece a forma de persistência (`SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 3`) |
| Qualquer referência a `User`/`Task`/`Activity`/`Quotation`/`Contract`/`Revenue` | Nenhum desses campos existe em `OpportunityProps` hoje — bloqueados por ausência de decisão de domínio (`SALES_DOMAIN_COMPLETION_AUDIT.md § 10`), não por escolha desta especificação |
| A instância de `Opportunity` (`this`) | Nunca serializada diretamente — violaria `SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 10` ("nunca a partir de acesso direto ao Aggregate") |

## 8. Relação com Opportunity

`CreateOpportunityResponse` **não é** a Entity `Opportunity`, nem uma view parcial dela em sentido de herança/composição — é um DTO estruturalmente independente que **espelha**, por valor, os campos públicos já expostos pelos getters de `Opportunity` no momento em que o Response é construído (§ 3). Alterar `Opportunity` no futuro (adicionar um getter novo) nunca altera `CreateOpportunityResponse` automaticamente — cada adição exige uma decisão própria de exposição pública (§ 11).

## 9. Relação com Aggregate

O Aggregate `Opportunity` **nunca é serializado diretamente** — nenhum framework de serialização automática (`JSON.stringify(opportunity)`, decorators de serialização) pode ser usado sobre a instância. A construção de `CreateOpportunityResponse` é sempre um mapeamento explícito, campo a campo, a partir dos getters públicos já congelados — mesmo princípio já aplicado à conversão inversa (`Command → Domain`, via `new UniqueEntityId(command.organizationId)` em `create-opportunity.handler.ts`, `ENG-0060`), agora na direção oposta (`Domain → Response`).

## 10. Relação com Command

| Artefato | Direção | Camada | Tipos de campo |
|---|---|---|---|
| `CreateOpportunityRequest` | Cliente → Contracts | Contracts | `string` primitivos, mapeia 1:1 para `CreateOpportunityCommandInput` (`ENG-0079`) |
| `CreateOpportunityCommand` | Contracts/Application interno | Application | `string` primitivos (`ENG-0059`) — hoje campos idênticos ao Request, mas conceitualmente uma camada distinta |
| `Opportunity` (via `Handler.execute()`) | Application → Domain → Application | Domain | `UniqueEntityId`/`OpportunityStatus`/`Date` — tipos de domínio |
| `CreateOpportunityResponse` | Application/Contracts → Cliente | Contracts | `string`/`Date` (ou `string` ISO, decisão de serialização de `Date` fica para a implementação, § 12) — espelha os getters públicos de `Opportunity`, nunca o inverso |

Diferença central: `Request` e `Command` representam **intenção** (dados de entrada, antes de qualquer regra ser aplicada); `Response` representa **resultado** (estado do Aggregate após a regra já ter sido aplicada com sucesso). Nenhum dos três é o mesmo artefato, apesar de hoje terem forma parcialmente semelhante — essa semelhança é coincidência do estado atual do domínio, não uma garantia estrutural (`SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 8`: "DTO não conhece domínio" — cada camada define seu próprio DTO independentemente).

## 11. Versionamento Futuro

Novos campos podem ser adicionados a `CreateOpportunityResponse` no futuro **somente como opcionais** (`campo?: tipo`), nunca quebrando a forma já congelada aqui — mesma disciplina de compatibilidade retroativa já aplicada a `CreateOpportunityCommandInput` (`pipelineId?`/`currentStageId?` opcionais desde a origem). Toda adição futura deve:
- Corresponder a um getter público já existente em `Opportunity` no momento da adição (nunca antecipar um campo que o Aggregate ainda não expõe).
- Ser justificada por uma nova ADR ou Ordem de Missão explícita que cite este documento.
- Nunca remover ou tornar obrigatório um campo já listado em §§ 5-6.

## 12. Checklist de Implementação (obrigatório para ENG-0081)

- [ ] Criar exclusivamente `interface CreateOpportunityResponse` (mesmo padrão de `CreateOpportunityRequest`, `ENG-0079`) — sem classe, sem construtor, sem método.
- [ ] Campos exatamente: `id`, `organizationId`, `partyId`, `status`, `createdAt`, `updatedAt` (obrigatórios, § 5); `pipelineId?`, `currentStageId?` (opcionais, § 6).
- [ ] Nenhum campo de § 7 presente.
- [ ] Tipos primitivos apenas — `string` para todo id e para `status` (união literal espelhando `OpportunityStatus`, nunca `UniqueEntityId`); decisão de `createdAt`/`updatedAt` como `Date` ou `string` (ISO 8601) **não resolvida por este documento** — fica para a missão de implementação decidir e registrar, citando este documento.
- [ ] Zero import de `@novaris/shared-kernel`, `domain/`, `application/`, `infrastructure/`.
- [ ] Zero lógica, zero validação, zero decorator.
- [ ] `Verify Before Reimplementing` executado antes de escrever qualquer linha.

## 13. Critérios de Aprovação

Um `CreateOpportunityResponse` implementado é considerado válido quando:
- Contém exatamente os 6 campos obrigatórios (§ 5) e os 2 opcionais (§ 6) — nenhum a mais, nenhum a menos.
- Nenhum campo de § 7 está presente.
- É uma `interface` TypeScript pura, sem lógica.
- Compila, linta, e (quando testes de Contracts existirem, item 8 do roadmap de `ENG-0078 § 14`) passa em teste de mapeamento campo-a-campo contra uma `Opportunity` real.

## 14. Critérios de Freeze

Este documento em si já está congelado a partir de sua aprovação — qualquer alteração em §§ 3-7 (quais campos pertencem/não pertencem ao Response) exige nova ADR ou nova Ordem de Missão explícita. O `CreateOpportunityResponse` implementado (futuro, `ENG-0081`) só poderá ser incluído no Contracts Freeze geral (`SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 17`) quando corresponder exatamente a este documento, confirmado por auditoria.

---

## Domain Model Validation

- Entity criada? **NÃO.**
- Aggregate criado? **NÃO.**
- Value Object criado? **NÃO.**
- Domain Event criado? **NÃO.**
- Nova regra criada? **NÃO.**
- Código/interface/classe/DTO implementado? **NÃO** — apenas especificação de campos, nenhum arquivo `.ts` criado.

## Relação com Outros Módulos

- [SALES_CONTRACTS_LAYER_ARCHITECTURE.md § 10](SALES_CONTRACTS_LAYER_ARCHITECTURE.md) (ENG-0078) — padrão estrutural genérico de Response, do qual este documento é a primeira especialização concreta
- [services/domains/sales/contracts/create-opportunity/create-opportunity.request.ts](../../../services/domains/sales/contracts/create-opportunity/create-opportunity.request.ts) (ENG-0079) — Request correspondente, mesmo par de Contract
- [services/domains/sales/domain/aggregates/opportunity/opportunity.ts](../../../services/domains/sales/domain/aggregates/opportunity/opportunity.ts) (ENG-0039–ENG-0049) — fonte exclusiva de todo campo listado em §§ 3-7
- [SALES_DOMAIN_COMPLETION_AUDIT.md § 10](SALES_DOMAIN_COMPLETION_AUDIT.md) (ENG-0057) — origem das 11 decisões de domínio pendentes citadas em § 7

## Status

🟢 Especificação congelada (Missão ENG-0080). Nenhum código, interface, classe, DTO, Contract, Handler, Controller, API, Aggregate, Entity, Repository, Mapper, Record ou teste criado. Referência única e vinculante para a implementação futura de `CreateOpportunityResponse`. Aguardando aprovação formal do CTO.
