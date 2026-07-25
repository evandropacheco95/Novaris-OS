# Sales — Persistence Mapping Blueprint

Versão: 1.0.0

Status: 🟢 Oficial — contrato de persistência, sem tecnologia definida, sem implementação

Missão: ENG-0046 (Sales Persistence & Mapper Blueprint) — Fase 3 de `KERNEL_DOMAIN_LIFECYCLE_V2.md`

Escopo: consolidar, para os dois Aggregates já implementados (`Opportunity`, `opportunity.ts`, ENG-0039; `Pipeline`, `pipeline.ts`, ENG-0041) e suas Internal Entities (`Proposal`, `proposal.ts`, ENG-0040; `Stage`, `stage.ts`, ENG-0042), o contrato de **como** serão persistidos — nunca **com o quê**. Nenhum código, schema, migration, Mapper ou Repository concreto foi criado nesta missão. Nenhuma missão anterior (`ENG-0032`–`ENG-0045`) foi alterada ou reaberta. Padrão estrutural de rigor seguido de [ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md](../../../services/kernel/organizations/ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md) (ENG-0003.10.5) — usado só como padrão de forma, nunca como fonte de conteúdo de `Sales`.

**Regra de método**: todo campo, restrição ou estratégia abaixo deriva exclusivamente do código real já implementado (`opportunity.ts`, `pipeline.ts`, `proposal.ts`, `stage.ts`), de `SALES_AGGREGATE_DESIGN.md`, `SALES_TECHNICAL_BLUEPRINT.md`, `ADR-0020`, `ADR-0021`. Onde nenhuma dessas fontes decide algo, a seção correspondente é marcada **BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO** — nunca preenchida por inferência.

---

## 1. Purpose

Definir o contrato de persistência dos Aggregates `Opportunity` e `Pipeline` — o mapeamento entre seu estado em memória (`OpportunityProps`/`PipelineProps` + coleções internas de Entity) e uma futura camada de persistência — sem escolher banco de dados, ORM ou tecnologia. Este documento passa a ser **obrigatório** para toda implementação futura de Schema, Mapper, Repository concreto, Migrations e Queries do Sales Domain.

## 2. Aggregate Persistence Strategy

### Opportunity

- **Aggregate Root**: `Opportunity` — única raiz transacional coberta junto de `Pipeline`. Campos de `OpportunityProps`: `organizationId`, `partyId`, `pipelineId?`, `currentStageId?`, `status` (`"open"|"won"|"lost"`), `createdAt`, `updatedAt` (todos já implementados, `opportunity.ts`).
- **Internal Entities**: `Proposal` — coleção `proposals: Proposal[]`, campo de classe dedicado, **fora** de `OpportunityProps` (`Proposal` é instância de Entity, não dado plano). Cada `Proposal` persiste seus próprios campos (`ProposalProps`: `status`, `createdAt`, `updatedAt`) como parte do mesmo registro/agregação de `Opportunity` (§ 3).
- **Value Objects**: nenhum implementado ainda — `Revenue` permanece candidato, sem forma de campos definida (`SALES_AGGREGATE_DESIGN.md § 5`, `Needs Evidence`). Nada a mapear.
- **External References**: `organizationId` → `Organization`; `partyId` → `Customer`/`Relationship`; `pipelineId` → `Pipeline` (Aggregate irmão, referência por id, nunca embutido); `currentStageId` → `Stage` (Entity interna de `Pipeline`, referência por id). Todas por id — nenhuma persiste o Aggregate/Entity estrangeiro.

### Pipeline

- **Aggregate Root**: `Pipeline` — Configuration Aggregate (`ADR-0021`). Campos de `PipelineProps`: `organizationId`, `createdAt`, `updatedAt` (já implementados, `pipeline.ts`).
- **Internal Entities**: `Stage` — coleção `stages: Stage[]`, campo de classe dedicado, fora de `PipelineProps`. Cada `Stage` persiste seu único campo confirmado (`StageProps`: `name`) como parte do mesmo registro/agregação de `Pipeline` (§ 3).
- **Configuration Nature**: `Pipeline` não é transacional — mutação rara (criação/edição administrativa), nunca por negociação individual (`ADR-0021`). Isso não muda a estratégia de persistência estrutural (ainda é um Aggregate Root com sua própria fronteira transacional), mas implica que sua taxa de escrita esperada é muito menor que a de `Opportunity` — observação para uma futura decisão de índice/cache, não uma regra imposta aqui.

## 3. Persistence Boundaries

**Pertence ao Aggregate** (persistido junto, na mesma fronteira transacional):
- `Opportunity`: seus próprios campos (§ 2) + a coleção completa de `Proposal`s que possui.
- `Pipeline`: seus próprios campos (§ 2) + a coleção completa de `Stage`s que possui.

**NÃO pertence ao Aggregate** — `Opportunity` **não persiste**:
- `Customer`/`Party` completo — apenas `partyId` (referência).
- `Organization` completa — apenas `organizationId` (referência).
- `User` completo — nenhum campo de `User` existe em `OpportunityProps` hoje (`SALES_AGGREGATE_DESIGN.md § 8`: referência candidata, nunca confirmada como campo).
- `Pipeline`/`Stage` completos — apenas `pipelineId`/`currentStageId` (referências); `Stage` só é persistido como parte de `Pipeline`, nunca duplicado dentro de `Opportunity`.
- `Task`/`Activity` completos — relação candidata (`BOM.md § Opportunity`), sem forma de referência definida ainda (`SALES_AGGREGATE_DESIGN.md § 8`) — nada a persistir até essa forma existir.

`Pipeline` **não persiste**:
- `Organization` completa — apenas `organizationId` (referência, candidata — `ADR-0021` não confirma essa relação explicitamente, ver § 8 abaixo).
- Nenhuma `Opportunity` — a relação é unidirecional (`Opportunity → Pipeline`); `Pipeline` nunca referencia de volta.

## 4. Campos Persistidos — Opportunity

| Campo | Tipo de domínio | Tipo esperado em persistência | Obrigatório? | Nulo? | Observações |
|---|---|---|---|---|---|
| `id` | `UniqueEntityId` | string (UUID) | Sim | Não | Chave primária, herdada de `Entity`/`AggregateRoot`. |
| `organizationId` | `UniqueEntityId` | string (UUID) | Sim | Não | Referência (§ 3); obrigatório em `create()` (`opportunity.ts`). |
| `partyId` | `UniqueEntityId` | string (UUID) | Sim | Não | Referência (§ 3); obrigatório em `create()` — "negociação em andamento com um Party". |
| `pipelineId` | `UniqueEntityId \| undefined` | string (UUID) | Não | Sim | Referência (§ 3); opcional em `create()` (`SALES_AGGREGATE_DESIGN.md § 8`, `Needs Evidence` se deveria ser obrigatório). |
| `currentStageId` | `UniqueEntityId \| undefined` | string (UUID) | Não | Sim | Referência (§ 3); opcional, atualizado por `advanceStage()`. |
| `status` | `"open" \| "won" \| "lost"` | string (3 valores fechados) | Sim | Não | Default `"open"` em `create()` — nunca fornecido pelo chamador (diferente de `OrganizationStatus`, que exige input). |
| `createdAt` | `Date` | timestamp | Sim | Não | Gerado internamente em `create()`. |
| `updatedAt` | `Date` | timestamp | Sim | Não | Atualizado em toda mutação (`markWon`/`markLost`/`advanceStage`/`addProposal`/`approveProposal`). |

## 5. Campos Persistidos — Proposal (dentro da agregação de Opportunity)

| Campo | Tipo de domínio | Tipo esperado em persistência | Obrigatório? | Nulo? | Observações |
|---|---|---|---|---|---|
| `id` | `UniqueEntityId` | string (UUID) | Sim | Não | Identidade própria da Entity interna. |
| `status` | `"pending" \| "approved"` | string (2 valores fechados) | Sim | Não | Default `"pending"` em `Proposal.create()`. |
| `createdAt` | `Date` | timestamp | Sim | Não | Gerado internamente em `create()`. |
| `updatedAt` | `Date` | timestamp | Sim | Não | Atualizado só por `approve()`. |

Nenhuma referência a `opportunityId` dentro de `ProposalProps` — `Proposal` é persistida sempre como parte da agregação de sua `Opportunity` possuidora (§ 3), nunca como registro independente com FK própria (decisão de tecnologia de *como* representar isso — embutido/serializado ou tabela filha com FK implícita de agregação — fora de escopo, § 9).

## 6. Campos Persistidos — Pipeline

| Campo | Tipo de domínio | Tipo esperado em persistência | Obrigatório? | Nulo? | Observações |
|---|---|---|---|---|---|
| `id` | `UniqueEntityId` | string (UUID) | Sim | Não | Chave primária. |
| `organizationId` | `UniqueEntityId` | string (UUID) | Sim | Não | Incluído por regra transversal (ENS-0001 § 7) — `ADR-0021` trata a relação como candidata, não confirmada por fonte explícita de `Sales` (registrado em `pipeline.ts`). |
| `createdAt` | `Date` | timestamp | Sim | Não | Gerado internamente em `create()`. |
| `updatedAt` | `Date` | timestamp | Sim | Não | Atualizado por `addStage()`. |

## 7. Campos Persistidos — Stage (dentro da agregação de Pipeline)

| Campo | Tipo de domínio | Tipo esperado em persistência | Obrigatório? | Nulo? | Observações |
|---|---|---|---|---|---|
| `id` | `UniqueEntityId` | string (UUID) | Sim | Não | Identidade própria da Entity interna. |
| `name` | `string` | string | Sim | Não | Validado como não-vazio em `Stage.create()`. Único campo confirmado por fonte textual ("etapa nomeada"). |

Nenhuma referência a `pipelineId` dentro de `StageProps` — mesma justificativa de `Proposal`/`Opportunity` (§ 5): `Stage` é persistida sempre como parte da agregação de seu `Pipeline` possuidor.

**BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO**: ordem/posição de `Stage` dentro de `Pipeline` — nenhum campo `order`/`position` existe em `StageProps` hoje (`stage.ts`); se a ordem é a posição no array em memória ou um campo persistido próprio não está definido (`SALES_AGGREGATE_DESIGN.md § 13`).

## 8. Campos NÃO Persistidos

- **Domain Events** (`OpportunityCreated`, `OpportunityWon`, `OpportunityLost`, `ProposalApproved`) — coleção interna `domainEvents` de `AggregateRoot<T>` nunca é uma coluna/campo persistido; representa algo que aconteceu, não estado.
- **`Result<T, DomainError>`** — existe só durante a execução de um método, nunca persistido.
- **Getters computados** — todos os getters de `opportunity.ts`/`pipeline.ts`/`proposal.ts`/`stage.ts` refletem 1:1 um campo já listado em §§ 4-7; nenhum é derivado/calculado hoje.
- **`organizationId` de `Pipeline` como relação confirmada** — persistido como campo (§ 6), mas sua obrigatoriedade *de negócio* (não apenas estrutural) permanece candidata (`ADR-0021`).

## 9. Mapeamento Aggregate ↔ Persistência

Conceitualmente, para cada Aggregate Root:

```
Aggregate (Opportunity | Pipeline — instância em memória, encapsulando invariantes e sua coleção de Entities internas)
  ↓
Mapper (função/classe pura de tradução, sem I/O)
  ↓
Persistência (registro real — tecnologia não definida por este documento)
```

Acesso direto ao Aggregate pela camada de persistência é **proibido** — nenhum código de acesso a banco pode instanciar `Opportunity`/`Pipeline` diretamente; só o `Mapper` traduz nas duas direções, só o `Repository` (já definido, `ENG-0045`) orquestra a chamada ao `Mapper` e ao mecanismo de persistência. Reforça `ENGINEERING_PLAYBOOK.md § 2`: "`domain/` nunca importa de `infrastructure/`".

## 10. OpportunityMapper (conceito, sem código)

**Responsabilidades**:
- `toPersistence()` — converte uma instância de `Opportunity` (incluindo sua coleção de `Proposal`s) num registro plano conceitual (`OpportunityRecord`, § 12), usando exclusivamente os campos de §§ 4-5.
- `toDomain()` — converte um `OpportunityRecord` de volta numa instância de `Opportunity`, via `Opportunity.reconstitute()` (já implementado com parâmetro `proposals`, `ENG-0044`) — sem validação, sem eventos, mesma regra já vigente no Aggregate.

**Nunca poderá**: validar regra de negócio (exclusiva de `Opportunity.create()`/métodos de mutação); disparar Domain Events; decidir um valor não fornecido pelos dados de origem; persistir ou consultar diretamente (isso é `Repository`, já definido em `ENG-0045`); expor, em sua assinatura pública, qualquer tipo específico de tecnologia. Sem assinatura final de método — apenas as duas responsabilidades acima, nomeadas.

## 11. PipelineMapper (conceito, sem código)

**Responsabilidades**:
- `toPersistence()` — converte uma instância de `Pipeline` (incluindo sua coleção de `Stage`s) num registro plano conceitual (`PipelineRecord`, § 12).
- `toDomain()` — converte um `PipelineRecord` de volta numa instância de `Pipeline`, via `Pipeline.reconstitute()` (já implementado com parâmetro `stages`, `ENG-0043`).

**Nunca poderá**: mesma lista de restrições de `OpportunityMapper` (§ 10). Sem assinatura final de método.

## 12. Modelo de Persistência — Conceitos

Apenas conceitos — nenhuma tabela SQL, coluna final, índice ou migration é definida:

- **`OpportunityRecord`** — forma conceitual do registro persistido de `Opportunity`, campos de § 4 + uma representação (embutida ou relacionada) de `ProposalRecord[]`.
- **`PipelineRecord`** — forma conceitual do registro persistido de `Pipeline`, campos de § 6 + uma representação (embutida ou relacionada) de `StageRecord[]`.
- **`ProposalRecord`** — forma conceitual do registro persistido de `Proposal` (§ 5) — se é linha própria com FK de agregação implícita, ou objeto embutido/serializado dentro de `OpportunityRecord`, é decisão de tecnologia, fora de escopo (§ 14).
- **`StageRecord`** — forma conceitual do registro persistido de `Stage` (§ 7) — mesma observação de `ProposalRecord`.

## 13. Regras DDD Garantidas

- **Aggregate Root controla persistência** — `Opportunity`/`Pipeline` são os únicos pontos de entrada para carregar/salvar suas Entities internas; nenhum `Mapper`/`Repository` acessa `Proposal`/`Stage` isoladamente.
- **Internal Entity não possui persistência independente** — não existe, e não deve existir, `ProposalRepository`/`StageRepository` (já confirmado por `ENG-0045`); `ProposalRecord`/`StageRecord` só existem como parte de `OpportunityRecord`/`PipelineRecord`.
- **Mapper não contém regra de negócio** — reafirmado em §§ 10-11.
- **Repository permanece abstração** — `OpportunityRepository`/`PipelineRepository` (`ENG-0045`) não são alterados por este documento; continuam interfaces puras, sem implementação concreta.

## 14. Fora do Escopo

- Escolha de banco de dados, ORM ou ferramenta de migration.
- `Revenue` (Value Object candidato, sem forma de campos) — `SALES_AGGREGATE_DESIGN.md § 5`.
- `Quotation`/`Contract` — forma estrutural não definida (`ADR-0020`, `SALES_AGGREGATE_DESIGN.md § 3`, `Needs Evidence`) — nada a mapear.
- Referência de `User` (dono da oportunidade), `Task`, `Activity` em `Opportunity` — candidatas, sem forma confirmada (§ 8, `SALES_AGGREGATE_DESIGN.md § 8`).
- Ordem/posição de `Stage` dentro de `Pipeline` (§ 7).
- Se `ProposalRecord`/`StageRecord` são linhas próprias ou objetos embutidos (§ 12) — decisão de tecnologia.
- Índices, restrições de unicidade, ou qualquer schema real.

## 15. Critérios para Futura Implementação

Checklist obrigatório para a próxima missão de Infrastructure real do Sales Domain:

- [ ] Seguir este documento literalmente — nenhum campo além dos listados em §§ 4-7 pode ser persistido sem nova decisão/ADR.
- [ ] Nenhuma regra de negócio nova inventada durante a implementação (ENS-0001 § 4).
- [ ] `Mapper` implementado como função/classe pura, sem I/O, seguindo §§ 10-11.
- [ ] `Repository` concreto implementa exclusivamente o contrato já congelado (`OpportunityRepository`/`PipelineRepository`, `ENG-0045`) — nenhum método novo sem nova ordem de missão.
- [ ] Nenhum item de § 14 (Fora de Escopo) implementado ou presumido.
- [ ] `Proposal`/`Stage` nunca ganham Repository próprio.
- [ ] Self Review + DMV + ACR + ARG produzidos (ENS-0002) — mesmo padrão de toda missão `ENG-` de implementação.
- [ ] Qualquer divergência deste documento exige ADR.

## 16. Declaração Formal

A partir desta missão, este documento é **vinculante** para toda implementação futura de persistência de `Opportunity`/`Pipeline`: Schema, Mapper, Repository concreto, Migrations, Queries. Nenhuma implementação pode divergir dos campos de §§ 4-7, das restrições de §§ 3, 8, 13, ou introduzir qualquer item de § 14, sem uma ADR explícita. Mudar este documento em si também exige ADR — mesmo padrão já vigente para `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md § 20`.

---

## Relação com Outros Módulos

- [SALES_TECHNICAL_BLUEPRINT.md](SALES_TECHNICAL_BLUEPRINT.md) (ENG-0036) — Aggregate Structure, base de §§ 2, 4-7
- [knowledge/architecture/analysis/SALES_AGGREGATE_DESIGN.md](../analysis/SALES_AGGREGATE_DESIGN.md) (ENG-0034) — origem das invariantes e lacunas citadas
- [adr/ADR-0020-sales-quotation-position.md](../../../adr/ADR-0020-sales-quotation-position.md), [ADR-0021-pipeline-nature.md](../../../adr/ADR-0021-pipeline-nature.md) — base de §§ 2, 6, 14
- [services/domains/sales/domain/aggregates/opportunity/opportunity.ts](../../../services/domains/sales/domain/aggregates/opportunity/opportunity.ts) (ENG-0039, ENG-0044) — implementação real da qual todo campo de §§ 4-5 foi extraído
- [services/domains/sales/domain/aggregates/pipeline/pipeline.ts](../../../services/domains/sales/domain/aggregates/pipeline/pipeline.ts) (ENG-0041, ENG-0043) — implementação real da qual todo campo de §§ 6-7 foi extraído
- [services/domains/sales/domain/repositories/](../../../services/domains/sales/domain/repositories/README.md) (ENG-0045) — contratos de Repository referenciados em § 13
- [services/kernel/organizations/ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md](../../../services/kernel/organizations/ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md) — padrão estrutural de forma seguido
- [knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md](../../engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) — `reconstitute()` (§ 10-11), base estrutural

## Status

🟢 Blueprint de persistência concluído (Missão ENG-0046). Nenhum código, schema, migration, Mapper ou Repository concreto implementado. Nenhum arquivo de código existente alterado. Aguardando aprovação formal do CTO antes de qualquer missão de Infrastructure real do Sales Domain.
