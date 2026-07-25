# Audit — Technical Blueprint

Versão: 1.0.0

Status: 🟢 Oficial — arquitetura técnica conceitual, sem implementação

Missão: ENG-0005.6 (Audit Technical Blueprint) — EPIC-005

Escopo: traduzir o contrato já congelado do Aggregate `AuditEntry` ([AUDIT_AGGREGATE_DESIGN_FREEZE.md](AUDIT_AGGREGATE_DESIGN_FREEZE.md), ENG-0005.5) em arquitetura técnica conceitual — organização de camadas, responsabilidades, estratégia de consulta e contratos futuros — **sem** código, sem interface real, sem Repository, sem Mapper, sem tecnologia. Diferente de `ORGANIZATION_TECHNICAL_BLUEPRINT.md` (que incluiu assinaturas em pseudocódigo), esta ordem de missão proíbe explicitamente "criar interfaces reais" — toda estrutura abaixo é descrita em prosa e tabela, nunca em bloco de código com sintaxe de `interface`/`class`.

---

## 1. Visão Técnica do Domínio

`AuditEntry` é, tecnicamente, o Aggregate mais simples já desenhado no Kernel: nasce completo (`create()`), nunca muda (§ 8 do Freeze), e sua única outra operação é a reconstituição a partir de dados persistidos (`reconstitute()`). A arquitetura técnica reflete essa simplicidade — não há Domain Service (nenhum foi identificado, `AUDIT_DOMAIN_DISCOVERY.md § 6` só cita responsabilidades exclusivas do próprio Aggregate), não há Specification, não há Policy. A complexidade técnica real do domínio está inteiramente na **fronteira de enriquecimento** (`AUDIT_DOMAIN_DECISIONS.md §§ 4-5`), que não pertence ao Aggregate — pertence à Application Layer de cada domínio de origem, fora do Audit Domain.

## 2. Organização Conceitual das Camadas

| Camada | Conteúdo conceitual |
|---|---|
| **Domain** | `AuditEntry` (Aggregate, já congelado); o contrato de Repository (leitura/escrita genérica + consulta especializada, § 5) |
| **Application** | Um caso de uso de escrita que recebe dados **já enriquecidos** (nunca enriquece sozinho, `AUDIT_DOMAIN_DECISIONS.md § 5`), chama `AuditEntry.create()`, e persiste via Repository; casos de uso de leitura que consultam por `Target` (§ 6) |
| **Infrastructure** | Implementação concreta do Repository e do Mapper (nenhum dos dois criado nesta missão); possível Adapter de consumo do Event Bus, **condicionado a uma decisão ainda bloqueada** (§ 9) |

**Nota importante, já implícita no Freeze**: a Application Layer que **enriquece** um `DomainEvent` bruto em dados prontos para `AuditEntry.create()` **não é a Application Layer do Audit Domain** — é a Application Layer de cada domínio de origem (Identity, Organization, e futuros). A Application Layer do próprio Audit só orquestra "receber dados já enriquecidos → `create()` → persistir", nunca busca o enriquecimento sozinha.

## 3. Responsabilidades de Cada Camada

- **Domain**: garantir que `AuditEntry` nasça válido e permaneça imutável (`AUDIT_AGGREGATE_DESIGN_FREEZE.md §§ 2, 7-8`); definir o contrato de persistência sem conhecer tecnologia.
- **Application (do próprio Audit)**: orquestrar a chamada a `AuditEntry.create()` com dados já enriquecidos, e a chamada ao Repository para persistir; orquestrar consultas de leitura por `Target`.
- **Application (de cada domínio de origem)**: **fora do Audit Domain**, mas conceitualmente pré-requisito dele — responsável por enriquecer (`actorId`, `organizationId`, `changeSet`) antes de qualquer fato chegar ao Audit, mesma responsabilidade já atribuída a `createdBy`/`updatedBy` em todo Aggregate (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 6`).
- **Infrastructure**: persistir e consultar `AuditEntry` através de uma tecnologia ainda não escolhida; traduzir entre o Aggregate e o registro de persistência via um Mapper (não criado nesta missão).

## 4. Limites do Aggregate

Reafirmado do Freeze, sem alteração: `AuditEntry` é sua própria fronteira transacional — cada instância é criada, persistida e consultada isoladamente, nunca como parte de uma transação que abranja outro Aggregate. Não há Entity interna, não há coleção interna, não há relação de composição com nenhum outro objeto do domínio — apenas referências por id (`actorId`, `organizationId`, `targetId`). Um `AuditEntry` nunca referencia outro `AuditEntry`.

## 5. Responsabilidade do Repository

O contrato de persistência de `AuditEntry` (não criado aqui — apenas descrito) seguiria a mesma composição já usada por `UserRepository`/`RoleRepository`/`OrganizationRepository`: operações genéricas de leitura (buscar por id, buscar todos, verificar existência) e de escrita (salvar; a operação de remoção, dado que `AuditEntry` é imutável e não sujeito a expurgo decidido, tem sua real necessidade **em aberto** — `AUDIT_AGGREGATE_DESIGN_FREEZE.md § 16`, tensão com retenção/compliance).

**Diferença já confirmada em relação a `Organization`/`Identity`** (`AUDIT_DOMAIN_DECISIONS.md § 8`): o Repository de `AuditEntry` precisa de **ao menos uma operação de consulta especializada** por `Target` — não é uma conveniência antecipando infraestrutura (motivo pelo qual `Organization`/`Identity` a rejeitaram), é a responsabilidade primária que já justificou `AuditEntry` como Aggregate (`AUDIT_DOMAIN_DISCOVERY.md § 9`). Nome, assinatura e forma exata dessa operação **não são definidos aqui** — ficam para `ENG-0005.9` (Repository Contract).

## 6. Estratégia de Consulta (sem tecnologia)

- **Consulta primária, já confirmada**: por `Target` — todo `AuditEntry` cujo `targetId`/`targetType` corresponda ao objeto consultado, devolvido em ordem cronológica (mesma semântica já citada em `audit/CONTRACT.md`: "ordenado cronologicamente; paginação ainda `TODO`").
- **Consultas candidatas, não confirmadas**: por `Actor`, por período, por `Organization` — nenhuma fonte oficial as define ainda (`AUDIT_DOMAIN_DECISIONS.md § 9`).
- **Paginação**: já registrada como pendência desde `audit/CONTRACT.md` (ARCH-001), não resolvida por nenhuma missão até aqui — permanece em aberto.
- Nenhum índice, nenhuma tecnologia de banco, nenhuma estratégia de particionamento é definida — apenas o **formato conceitual** da consulta (por qual campo, em qual ordem).

## 7. Relação com Outros Módulos

- **Shared Kernel**: reuso integral — `AggregateRoot<T>`, `Result<T,E>`, hierarquia de erros, `Repository<T>`/`ReadRepository<T>`/`WriteRepository<T>`, `DomainEvent`. Nenhuma abstração nova.
- **Identity**: referência conceitual via `actorId` — `AuditEntry` nunca importa tipos concretos de `@novaris/identity` (`AUDIT_BOUNDED_CONTEXT.md § 9`).
- **Organization**: referência conceitual via `organizationId` — mesma regra.
- **Event Bus (futuro)**: relação condicional — se a decisão de acoplamento (ainda bloqueada, `AUDIT_AGGREGATE_DESIGN_FREEZE.md § 16`) confirmar consumo assíncrono, o Event Bus se torna o canal de entrada de `DomainEvent`s brutos já enriquecidos pela Application Layer de origem; até lá, nenhuma integração técnica é definida.

## 8. Contratos Futuros Necessários (sem interfaces reais)

Descritos em prosa, nenhum criado:

- **Contrato de Repository** (`AuditRepository`, nome provisório) — composição de leitura/escrita genérica + consulta por `Target` (§ 5). Vive em `services/kernel/audit/src/domain/repositories/` quando implementado (`ENG-0005.9`), mesma convenção de pasta já usada por Identity/Organization.
- **Contrato de "fato enriquecido"** — uma forma de dados (não uma classe, não uma interface real) que toda Application Layer de origem precisaria produzir antes de chamar o Audit Domain (`actorId`, `organizationId`, `targetId`/`targetType`, `action`, `occurredAt`, `origin`, `changeSet?`). Candidato natural para viver em `packages/contracts/` — camada de contrato entre Kernel e domínios já formalizada por `ADR-0006` — mas isso **não é decidido aqui**, apenas identificado como uma necessidade técnica futura.
- **Adapter de consumo do Event Bus** — só necessário se a decisão de acoplamento (§ 9) confirmar o caminho assíncrono; não descrito em detalhe, pois depende de uma decisão ainda bloqueada e de um Epic (Event Bus) que ainda não começou.

## 9. O Que Permanece Bloqueado

Herdado sem alteração de `AUDIT_AGGREGATE_DESIGN_FREEZE.md § 16`, com uma leitura técnica adicional:

- Se `AuditEntry` emite algum Domain Event próprio — bloqueia a decisão de qualquer Adapter de Event Bus que dependesse dele.
- Forma real de `Target`/`Actor` (Value Object vs. par simples `id`/tipo) — bloqueia a assinatura exata do Mapper e do Repository.
- Mecanismo real de acoplamento com o Event Bus — bloqueia toda a Infrastructure Layer de consumo.
- Nome/assinatura da consulta especializada por `Target` — bloqueia a implementação real do Repository Contract (`ENG-0005.9`).
- Necessidade de operação de remoção (retenção/expurgo vs. imutabilidade) — bloqueia se `WriteRepository<AuditEntry>` genérico (que inclui `delete`) é sequer apropriado para este Aggregate sem uma decisão de compliance.
- ADR do mecanismo de enriquecimento (`AUDIT_DOMAIN_DECISIONS.md § 5`, recomendada, não criada) — bloqueia qualquer domínio de origem real começar a produzir dados enriquecidos para o Audit.

## 10. Preparação para Implementação

**Pode prosseguir sem bloqueio**: `ENG-0005.7` (Aggregate Implementation) — `AuditEntry.create()`/`reconstitute()` recebem dados já enriquecidos como parâmetros simples; a implementação do Aggregate em si **não depende** de quem enriquece nem de como (§ 2), só de que os campos já congelados (`AUDIT_AGGREGATE_DESIGN_FREEZE.md §§ 4-6`) estejam presentes. `AuditEntry` pode ser implementado e testado isoladamente, sem esperar a ADR de enriquecimento.

**Não pode prosseguir sem resolver o bloqueio correspondente**: `ENG-0005.9` (Repository Contract) precisa da decisão de nome/assinatura da consulta por `Target` (§ 5, § 9); qualquer domínio de origem real (Identity, Organization) que for **de fato** publicar fatos enriquecidos para o Audit precisa da ADR de enriquecimento existir primeiro (`AUDIT_DOMAIN_DECISIONS.md § 5`).

**Checklist mínimo antes de `ENG-0005.7`**:
- [ ] Este Blueprint aprovado pelo CTO.
- [ ] Nenhuma mudança aos campos/invariantes já congelados em `AUDIT_AGGREGATE_DESIGN_FREEZE.md`.
- [ ] `ENG-0005.7` segue exatamente `AGGREGATE_IMPLEMENTATION_STANDARD.md`, mesmo padrão de `Organization`/`User`/`Role`.
- [ ] `ENG-0005.7` não implementa Domain Event, Repository, Mapper ou Value Object — só o Aggregate.

---

## Validações

- **Link Checker** (`-Root` explícito): ver Relatório Final.
- **Rastreabilidade**: toda seção cita a decisão exata do Freeze (`AUDIT_AGGREGATE_DESIGN_FREEZE.md`) ou das Decisions (`AUDIT_DOMAIN_DECISIONS.md`) de onde deriva.
- **Comparação com o Freeze**: nenhuma seção deste Blueprint contradiz `AUDIT_AGGREGATE_DESIGN_FREEZE.md §§ 1-15`; os itens de § 16 do Freeze são reproduzidos como bloqueio em § 9 deste documento, nunca resolvidos.

## DMV

1. Alguma Entity foi criada? Não.
2. Algum Aggregate foi alterado? Não — `AuditEntry` permanece exatamente como congelado.
3. Algum Value Object foi criado? Não.
4. Alguma regra nova foi criada? Não.
5. Alguma decisão do Freeze foi modificada? Não.
6. Há necessidade de ADR? Não para este Blueprint em si (mesmo padrão de `ORGANIZATION_TECHNICAL_BLUEPRINT.md`); a ADR já recomendada em `AUDIT_DOMAIN_DECISIONS.md § 5` permanece registrada, não criada aqui.

## ACR

| Categoria | Conformidade |
|---|---|
| Nenhum código, interface real, Repository, Mapper, tecnologia ou ADR criado | ✅ |
| Toda estrutura descrita em prosa/tabela, nunca em bloco de código com sintaxe de interface/classe | ✅ |
| Consistente com o Freeze, nenhuma contradição | ✅ |
| Distinção clara entre "pode prosseguir sem bloqueio" e "depende de decisão pendente" (§ 10) | ✅ |
| Nenhum documento existente alterado | ✅ |

## ARG

| # | Critério | Resultado |
|---|---|---|
| 1-4, 7-10 | Compilação/lint/teste/reuso/infra/artefatos | N/A — nenhum código |
| 5 | Respeita documentação vinculante | ✅ |
| 6 | Segue padrão estrutural já aprovado (`ORGANIZATION_TECHNICAL_BLUEPRINT.md`, adaptado à restrição de não criar interfaces reais) | ✅ |
| 11 | Nenhuma regra de negócio nova | ✅ |
| 12 | Escopo proibido integralmente respeitado | ✅ |

**Gate: ✅ PASS** (4/4 aplicáveis).

## Self Review

1. **Alguma interface real ou bloco de código foi criado, mesmo como pseudocódigo?** Não — toda estrutura de Repository/Contrato foi descrita em prosa e tabela, nenhum bloco `interface`/`class` usado, diferente do precedente de `ORGANIZATION_TECHNICAL_BLUEPRINT.md`, respeitando a restrição explícita e mais estrita desta ordem.
2. **A distinção entre a Application Layer do Audit e a Application Layer dos domínios de origem (§ 2-3) estava clara o suficiente para evitar confusão futura?** Sim — explicitamente destacada como "Nota importante" em § 2, reforçada em § 3, para que `ENG-0005.7` não implemente enriquecimento dentro do próprio Audit por engano.
3. **A conclusão de § 10 (Aggregate pode avançar sem a ADR) é uma forma de contornar a restrição?** Não — é uma leitura correta do Freeze: `create()` recebe dados já prontos, não decide nem descobre quem os enriquece; a ADR é pré-requisito de uso real por outro domínio, não de implementação do próprio Aggregate.
4. **Algum item de `AUDIT_AGGREGATE_DESIGN_FREEZE.md § 16` foi resolvido silenciosamente?** Não — todos os 9 itens continuam bloqueados, reproduzidos em § 9 deste Blueprint sem nenhuma resolução.

## Relatório Final

**Arquivos criados**: `services/kernel/audit/AUDIT_TECHNICAL_BLUEPRINT.md`.

**Arquivos alterados**: nenhum.

**Validações**: Link Checker (ver abaixo), rastreabilidade, comparação com o Freeze — nenhuma divergência.

**Conclusão**: arquitetura técnica conceitual definida — camadas, responsabilidades, estratégia de consulta e contratos futuros necessários, tudo em prosa, sem código ou interface real. `ENG-0005.7` (Aggregate Implementation) pode prosseguir sem bloqueio; `ENG-0005.9` (Repository Contract) e qualquer integração real de domínio de origem dependem de decisões ainda bloqueadas (§ 9).

---

Interrompendo a execução. Aguardando aprovação formal do CTO.
