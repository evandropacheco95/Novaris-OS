# Sales — Contracts Layer Architecture

Versão: 1.0.0

Status: 🟢 Arquitetura definida — referência única para toda implementação futura da Contracts Layer; nenhum código criado

Missão: ENG-0078 (Sales Contracts Layer Architecture)

Escopo: projetar integralmente a arquitetura da Contracts Layer do Sales Domain, antes de qualquer implementação — mesmo padrão de rigor de `SALES_DOMAIN_COMPLETION_AUDIT.md` (ENG-0057), `SALES_APPLICATION_COMPLETION_AUDIT.md` (ENG-0075) e `SALES_APPLICATION_FREEZE.md` (ENG-0077). Esta missão **não implementa DTO, Request, Response, Contract, Interface, Controller, Endpoint, API, Query, Command, Handler, Aggregate, Entity, Repository, Mapper, Factory, Service ou teste** — nenhum arquivo de código é criado. `Opportunity`/`Pipeline`/`Proposal`/`Stage`, os 6 Commands e os 6 Handlers já congelados (`ENG-0058`, `ENG-0077`) não são alterados.

**Verify Before Reimplementing**: busca executada nesta missão, antes de escrever qualquer linha, por "Contracts Architecture", "Contracts Blueprint", "Contracts Guidelines", "Public API", "DTO Standards", "Application Contracts", "Interface Contracts", "Response Contracts", "Command Contracts", "Request DTO", "Response DTO", "Output DTO", "Input DTO" em todo `knowledge/`. Resultado: apenas 2 ocorrências textuais irrelevantes (`NOVARIS_ENGINEERING_HANDBOOK.md`, menção genérica de fluxo; `knowledge/engineering/templates/api-template.md`, um template de preenchimento vazio, não uma arquitetura de Contracts do Sales) — **nenhum documento equivalente existe**. Confirmado também que `services/domains/sales/contracts/` e `packages/contracts/` contêm apenas READMEs de skeleton (`ENG-0037`), sem nenhuma definição de arquitetura prévia. Nenhuma duplicação.

**Achado registrado, não bloqueante**: dois documentos citados na "Documentação Obrigatória" desta Ordem de Missão não existem no repositório — `DDD_GUIDELINES.md` (nenhuma ocorrência em todo o repositório) e "Shared Kernel Blueprint" (não existe um documento com esse nome exato; o mais próximo é [`packages/shared-kernel/README.md`](../../../packages/shared-kernel/README.md), usado como referência em seu lugar). Mesma disciplina já aplicada em missões anteriores diante de um caminho/documento citado que não existe — registrado aqui, não fabricado.

---

## 1. Objetivo

Definir, de forma vinculante para toda implementação futura, o que a Contracts Layer do Sales Domain é, o que ela expõe, o que ela nunca pode conter, e o padrão exato de Request/Response/Export/Naming que toda futura missão de implementação deve seguir literalmente — sem inventar uma convenção nova a cada Contract implementado. Este documento é o equivalente, para a Contracts Layer, do que `SALES_TECHNICAL_BLUEPRINT.md` foi para o Domain Layer antes de `ENG-0039`.

## 2. Posicionamento Arquitetural

```
Cliente
  ↓
API                (transporte — HTTP/REST ou equivalente; não implementado, fora do escopo desta missão)
  ↓
Contracts          (esta camada — tradução entre formato externo e Application Layer)
  ↓
Application        (Commands/Handlers, já congelados — ENG-0077)
  ↓
Domain              (Aggregates/Entities, já congelados — ENG-0058)
  ↓
Repository          (interfaces, já congeladas — ENG-0045)
  ↓
Infrastructure      (implementação concreta, interina — ENG-0050)
```

| Camada | Responsabilidade |
|---|---|
| **Cliente** | Qualquer consumidor externo (navegador, outro serviço, outro domínio) — não modelado aqui, fora do Sales Domain |
| **API** | Transporte (hoje inexistente) — traduz protocolo (HTTP/REST) para uma chamada a `Contracts`; nunca contém regra de negócio |
| **Contracts** | Tradução entre o formato público (JSON/objeto simples) e o `Command`/`Result` da Application Layer — único ponto autorizado a construir um `Command` a partir de dados externos e a traduzir um `Result` em uma resposta pública |
| **Application** | Orquestração (`Handler.execute()`) — já implementada e congelada, `ENG-0059`–`ENG-0077` |
| **Domain** | Regra de negócio (`Opportunity.create()`/`markWon()`/etc.) — já implementada e congelada, `ENG-0039`–`ENG-0058` |
| **Repository** | Contrato de persistência (`OpportunityRepository`/`PipelineRepository`) — já congelado, `ENG-0045` |
| **Infrastructure** | Implementação concreta de Repository (`InMemoryOpportunityRepository`, interina) — `ENG-0050` |

## 3. Responsabilidades da Contracts Layer

**Pertence à Contracts Layer**:
- Definir o formato de entrada público de cada caso de uso já congelado (Request DTO), mapeando 1:1 para um Command já existente.
- Definir o formato de saída público de cada caso de uso (Response DTO), mapeando a partir do `Result<T, DomainError>` devolvido pelo Handler.
- Definir o formato público de erro (Error DTO), traduzindo `DomainError`/subtipos em algo consumível externamente (código, mensagem), sem expor a classe de erro interna do Shared Kernel diretamente.
- Definir o payload público de cada Domain Event já nomeado (`OpportunityCreated`/`Won`/`Lost`/`ProposalApproved`), quando a pendência de plataforma de payload (`ADR-0019 § Evidence`) for resolvida — não antes.
- Organizar exports (barrels) que expõem exclusivamente os tipos acima.

**Não pertence à Contracts Layer**:
- Nenhuma regra de negócio, validação de domínio, cálculo ou decisão — isso é exclusivo do Aggregate (§ 7).
- Nenhum acesso a `Repository`, `Mapper`, `Infrastructure` ou banco — a Contracts Layer nunca pula a Application Layer.
- Nenhuma lógica de orquestração — isso é exclusivo do Handler.
- Nenhum framework HTTP/Controller/rota — isso é uma camada futura e distinta (API), não modelada por este documento.

## 4. Tipos de Artefatos Autorizados

| Artefato | Descrição |
|---|---|
| **Request DTO** | Formato de entrada público de um caso de uso — campos primitivos, imutável, mapeia 1:1 para um Command já congelado (ex.: `CreateOpportunityRequest` → `CreateOpportunityCommand`) |
| **Response DTO** | Formato de saída público de sucesso — campos primitivos/serializáveis extraídos do Aggregate/Entity devolvido pelo Handler, nunca a instância do Aggregate em si |
| **Contract** | Termo genérico para o par Request/Response de um caso de uso, mais o Error DTO associado — a "forma pública" completa de uma operação |
| **Public Types** | Tipos auxiliares expostos publicamente (ex.: união de strings para `status`), sempre espelhando um tipo já existente no Domain (`OpportunityStatus`), nunca inventando um novo vocabulário |
| **Error DTO** | Formato público de erro — código/categoria (`NOT_FOUND`/`CONFLICT`/`VALIDATION`) e mensagem, traduzido a partir da instância real de `DomainError` devolvida pelo Handler |
| **Exports** | Barrel (`index.ts`) por subpasta, reexportando exclusivamente os tipos acima — nunca comportamento |

## 5. Artefatos Proibidos

Nunca podem existir dentro de `contracts/`: regra de negócio, validação de domínio, `Repository`, `Mapper`, acesso a banco/ORM, framework (`NestJS`/`Express`), `Controller`, `Entity`, `Aggregate`, `Domain Event` (a definição em si — só o payload público, quando existir), `Infrastructure`, `Command Handler`, `Factory`, `Service`, `CommandBus`/`EventBus`/`Mediator`. Mesma lista de proibições já congelada para a Application Layer (`SALES_APPLICATION_FREEZE.md § 6`), estendida aqui.

## 6. Dependency Rule

```
Contracts
  ↓
Application
  ↓
Domain
  ↓
Shared Kernel
```

**Nunca o contrário** — `Application`/`Domain`/`Shared Kernel` nunca importam de `contracts/`. Um Request/Response DTO pode referenciar um tipo público do Domain apenas para espelhar um vocabulário já existente (ex.: `OpportunityStatus`), nunca para importar comportamento. Mesma direção de dependência já usada em toda a engenharia (Clean Architecture, `ENGINEERING_PLAYBOOK.md §§ 1-2`).

## 7. Rule Ownership

Toda regra de negócio permanece exclusivamente no Aggregate (`Opportunity`/`Proposal`) — reafirmação literal de `SALES_APPLICATION_FREEZE.md § 5` ("0% Application, 100% Aggregate"), estendida à Contracts Layer: **0% Contracts, 100% Aggregate**. A Contracts Layer nunca decide, nunca valida regra de negócio, nunca calcula (ex.: nunca deriva `Revenue` ou qualquer valor), nunca altera estado — apenas traduz forma (externo ↔ Command/Result).

## 8. DTO Philosophy

Um DTO (Request, Response ou Error) **não é** uma Entity, **não é** um Aggregate, **não conhece** o Domain além do vocabulário público mínimo necessário para nomear um campo. Um DTO existe exclusivamente para transportar dados através de uma fronteira de processo/formato — mesma filosofia já aplicada aos Commands da Application Layer (`ENGINEERING_PLAYBOOK.md § 4`: "DTOs — formato de entrada/saída... desacoplado do formato HTTP e do modelo de domínio"), estendida aqui à fronteira externa (Cliente ↔ Contracts).

## 9. Request Pattern (definição, sem implementação)

Cada Request DTO futuro deve:
- Mapear exatamente 1:1 para um Command já congelado — nenhum campo além do que o Command já aceita.
- Ser uma classe ou interface imutável, campos `readonly`, tipos primitivos (`string`/`number`/`boolean`), nunca `UniqueEntityId` ou qualquer tipo de domínio — mesma disciplina já aplicada aos Commands (`ENG-0059`–`ENG-0069`).
- Não conter nenhuma lógica de conversão — a conversão Request→Command (quando os campos não forem idênticos) é responsabilidade de uma futura camada de tradução explícita, ainda não definida (§ 14, item pendente).

Exemplo conceitual (sem código real): `CreateOpportunityRequest` teria os mesmos campos de `CreateOpportunityCommandInput` (`organizationId`, `partyId`, `pipelineId?`, `currentStageId?`).

## 10. Response Pattern (definição, sem implementação)

Cada Response DTO futuro deve:
- Ser construído a partir do valor de sucesso de `Result<T, DomainError>` devolvido pelo Handler correspondente — nunca a partir de acesso direto ao Aggregate.
- Expor apenas os campos públicos já confirmados do Aggregate/Entity (ex.: `id`, `status`, `organizationId`) — nunca `props` internos, nunca `domainEvents`.
- Em caso de falha, produzir um Error DTO (§ 4) a partir da instância real de `DomainError` — nunca inventar uma mensagem diferente da já produzida pelo Aggregate/Handler.

## 11. Export Strategy

- Cada subpasta de `contracts/` (ex.: `contracts/create-opportunity/`) exporta seus tipos via um único `index.ts` — mesmo padrão de barrel já usado em `src/index.ts` do pacote `@novaris/sales` (`ENG-0051`). **Correção registrada (`ENG-0085`)**: o exemplo original desta seção era `contracts/api/create-opportunity/` — corrigido para refletir a estrutura oficial decidida em `SALES_CONTRACTS_ALIGNMENT_DECISION.md`.
- O barrel de nível superior (`contracts/index.ts`, ainda não criado) reexportaria exclusivamente os barrels de subpasta — nunca tipos de `domain/`/`application/`/`infrastructure/` diretamente.
- Nenhuma implementação concreta (`InMemoryOpportunityRepository`, Mapper, Record) é jamais exportada por `contracts/` — mesma regra já vigente para `src/index.ts` (`ENG-0051`, "não exporta... implementações concretas de Repository").

## 12. Naming Convention

| Elemento | Convenção | Exemplo |
|---|---|---|
| Pasta | `kebab-case`, mesmo nome do Command correspondente | `contracts/create-opportunity/` (corrigido de `contracts/api/create-opportunity/`, `ENG-0085`, ver `SALES_CONTRACTS_ALIGNMENT_DECISION.md`) |
| Arquivo de Request | `<nome-do-command>.request.ts` | `create-opportunity.request.ts` |
| Arquivo de Response | `<nome-do-command>.response.ts` | `create-opportunity.response.ts` |
| Classe/Interface de Request | `PascalCase` + sufixo `Request` | `CreateOpportunityRequest` |
| Classe/Interface de Response | `PascalCase` + sufixo `Response` | `CreateOpportunityResponse` |
| Error DTO | `PascalCase` + sufixo `Error` (nunca reaproveitar o nome de uma classe do Shared Kernel) | `CreateOpportunityError` |
| Contract (par completo) | Documentado, nunca uma classe própria — é o conjunto Request+Response+Error de uma pasta | — |

Mesma disciplina de nomenclatura já congelada para Commands/Handlers (`ENG-0059`–`ENG-0070`) — nenhuma convenção nova inventada, apenas estendida ao novo tipo de artefato.

## 13. Shared Kernel Usage

| Tipo do Shared Kernel | Uso na Contracts Layer |
|---|---|
| `Result` | **Não usar diretamente** — a Contracts Layer nunca recebe nem devolve um `Result<T, DomainError>` cru; o Handler (Application Layer) já o consome e produz um valor de sucesso/falha que a Contracts Layer traduz para Response/Error DTO |
| `Option` | **Não usar** — `Option` é consumida inteiramente dentro do Handler (`ENG-0060`–`ENG-0070`); nunca atravessa a fronteira da Application Layer |
| `UniqueEntityId` | **Não usar** — todo id trafega como `string` na Contracts Layer, mesma decisão já aplicada aos Commands (`ENG-0059`) |
| Hierarquia de erros (`NotFoundError`/`ConflictError`/`DomainError`) | **Não reexportar diretamente** — a Contracts Layer traduz a instância real de erro (já produzida pelo Aggregate/Handler) para um Error DTO próprio (§ 4), nunca expõe a classe do Shared Kernel como parte do contrato público |

**Princípio geral**: a Contracts Layer é a fronteira onde os tipos do Shared Kernel **param** — nada do Shared Kernel atravessa para o lado do Cliente. Mesma disciplina de "DTO desacoplado do modelo de domínio" (`ENGINEERING_PLAYBOOK.md § 4`), aplicada de forma ainda mais estrita do que nos Commands (que ao menos vivem no mesmo processo TypeScript; a Contracts Layer assume potencial serialização JSON).

## 14. Future Roadmap

Sequência recomendada, uma missão por item, cada uma seguindo `KERNEL_DOMAIN_LIFECYCLE_V2.md` e citando este documento:

1. `CreateOpportunity` Contract (Request + Response + Error)
2. `AdvanceOpportunityStage` Contract
3. `SubmitProposal` Contract
4. `ApproveProposal` Contract
5. `MarkOpportunityWon` Contract
6. `MarkOpportunityLost` Contract
7. Contracts Tests (mesmo padrão de `ENG-0073` — Fake local, sem framework)
8. Contracts Audit (mesmo padrão de `ENG-0057`/`ENG-0075`)
9. Contracts ARG (mesmo padrão de `ENG-0058`/`ENG-0076`)
10. Contracts Freeze (mesmo padrão de `ENG-0077`)

**Pendência explicitamente registrada, não resolvida por este documento**: o mecanismo exato de tradução Request→Command quando os campos não forem idênticos (hoje são, para os 6 casos de uso existentes) — decisão de uma futura missão de implementação, não deste documento de arquitetura.

## 15. Checklist de Implementação

Checklist obrigatório para toda futura missão de implementação de um Contract:

- [ ] Request DTO mapeia 1:1 para um Command já congelado — nenhum campo novo.
- [ ] Response DTO construído a partir do valor de sucesso do `Result` do Handler — nunca do Aggregate diretamente.
- [ ] Error DTO traduz a instância real de `DomainError`/subtipo — nenhuma mensagem inventada.
- [ ] Todo campo `readonly` (imutabilidade em tempo de compilação). **Correção registrada (`ENG-0114`/`ENG-0115`/`ENG-0116`)**: `Object.freeze()` não se aplica a esta camada — todo Contract é sempre uma `interface` pura (§ 8), nunca uma `class`, portanto não existe instância em tempo de execução para congelar; o padrão de imutabilidade dos Commands (`Object.freeze(this)` em um construtor) não é replicável aqui e não deve ser buscado por nenhuma futura implementação.
- [ ] Zero import de `Result`/`Option`/`UniqueEntityId`/classes de erro do Shared Kernel diretamente no DTO público.
- [ ] Zero import de `Repository`/`Mapper`/`Infrastructure`.
- [ ] Zero regra de negócio, validação de domínio ou cálculo.
- [ ] Naming Convention (§ 12) seguida literalmente.
- [ ] Export via barrel próprio (§ 11) — nenhuma reexportação de implementação concreta.
- [ ] `Verify Before Reimplementing` executado antes de escrever qualquer linha.

## 16. Architecture Readiness

A Contracts Layer está **pronta para iniciar implementação** desde já, porque:
- O Domain Layer está congelado e com ARG PASS (`ENG-0058`).
- A Application Layer está congelada e com ARG PASS (`ENG-0077`).
- Os 6 Commands/Handlers que servem de base a todo Contract futuro já existem, testados (117/117) e estáveis.
- Este documento fixa a arquitetura, a convenção de nomenclatura e o checklist — nenhuma futura missão de implementação precisa decidir forma, apenas seguir.

**Não está pronta** para incluir qualquer Contract de `Quotation`/`Contract`/`Revenue` ou de qualquer campo bloqueado por `SALES_DOMAIN_COMPLETION_AUDIT.md § 10` — os mesmos 11 itens pendentes continuam bloqueando qualquer Contract que dependa deles.

## 17. Freeze Criteria (futuros, para quando a Contracts Layer for implementada)

Uma futura Contracts Freeze exigirá, no mínimo (mesmo padrão de `SALES_APPLICATION_FREEZE.md`):
- Todos os 6 Contracts do § 14 implementados e testados.
- Contracts Audit produzida e classificada (mesmo padrão de `ENG-0075`).
- Contracts ARG formal, 12 critérios, PASS (mesmo padrão de `ENG-0076`).
- Documentação (READMEs de `contracts/`) sincronizada com o código real.
- Zero dependência proibida (§ 5), confirmada por auditoria.
- Zero regra de negócio na Contracts Layer, confirmada por auditoria (§ 7).

---

## Domain Model Validation

- Entity criada? **NÃO.**
- Aggregate criado? **NÃO.**
- Value Object criado? **NÃO.**
- Domain Event criado? **NÃO.**
- Nova regra criada? **NÃO.**
- Repository alterado? **NÃO.**
- Infrastructure alterada? **NÃO.**
- DTO/Request/Response/Contract/Controller/API implementado? **NÃO** — apenas arquitetura definida, nenhum código.

## Relação com Outros Módulos

- [SALES_APPLICATION_FREEZE.md](SALES_APPLICATION_FREEZE.md) (ENG-0077) — base do padrão de Freeze citado em § 17
- [SALES_APPLICATION_COMPLETION_AUDIT.md](SALES_APPLICATION_COMPLETION_AUDIT.md) (ENG-0075, atualizado ENG-0076) — base do padrão de auditoria/ARG citado em §§ 14, 17
- [SALES_DOMAIN_COMPLETION_AUDIT.md](SALES_DOMAIN_COMPLETION_AUDIT.md) (ENG-0057) — origem das 11 decisões de domínio pendentes citadas em § 16
- [../blueprints/SALES_TECHNICAL_BLUEPRINT.md § 12](../blueprints/SALES_TECHNICAL_BLUEPRINT.md) — posiciona `Contracts` na ordem de implementação futura, base de § 2
- [packages/shared-kernel/README.md](../../../packages/shared-kernel/README.md) — usado no lugar de "Shared Kernel Blueprint" (não existe), base de § 13
- [services/domains/sales/contracts/](../../../services/domains/sales/contracts/README.md), [packages/contracts/](../../../packages/contracts/README.md) — estrutura de pastas já existente (`ENG-0037`), ainda vazia

## Status

🟢 Arquitetura definida (Missão ENG-0078). Nenhum código, DTO, Request, Response, Contract, Controller, API, Query, Command, Handler, Aggregate, Entity, Repository, Mapper, Factory, Service ou teste criado. Referência única e vinculante para toda implementação futura da Contracts Layer do Sales Domain. Aguardando aprovação formal do CTO.
