# Identity — Domain Service Identification

Versão: 1.0.0

Status: 🟢 Oficial — identificação e classificação congeladas, sem implementação

Missão: ENG-0002.10A (Domain Service Identification) — EPIC-002, Sprint-002

Escopo: identificar, classificar e congelar todos os Domain Services necessários ao Identity Domain, a partir do que já está congelado em [IDENTITY_TECHNICAL_BLUEPRINT.md](IDENTITY_TECHNICAL_BLUEPRINT.md) (Blueprint), [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](IDENTITY_AGGREGATE_DESIGN_FREEZE.md) (Freeze) e do comportamento real já implementado em `User` (ENG-0002.7), `Role` (ENG-0002.8) e nos Repository Contracts (ENG-0002.9). **Nenhum código foi criado ou alterado nesta missão** — nenhum arquivo `.ts` foi tocado.

---

## 1. Objetivo

Responder, para o Identity Domain como um todo:

- quais Domain Services realmente existem;
- quais regras pertencem a eles;
- quais regras permanecem dentro dos Aggregates (`User`, `Role`) ou dos Value Objects (`Email`, `Permission`);
- quais regras pertencem à futura Application Layer;
- quais regras dependem de Repository;
- quais regras exigem colaboração entre múltiplos Aggregates.

E, a partir dessas respostas, **congelar** a lista de Domain Services do domínio — mudança estrutural futura (adicionar, remover ou reclassificar um Domain Service) exige ADR, mesmo padrão já usado para os Aggregates ([IDENTITY_AGGREGATE_DESIGN_FREEZE.md § Declaração de Freeze](IDENTITY_AGGREGATE_DESIGN_FREEZE.md)).

## 2. Critérios Oficiais para Existência de Domain Service

Um Domain Service só pode existir se pelo menos **um** dos critérios abaixo for verdadeiro (ordem de missão ENG-0002.10A, "Critérios de Decisão"):

- ✔ envolve mais de um Aggregate; **OU**
- ✔ depende de Repository; **OU**
- ✔ depende de uma consulta que o Aggregate não pode realizar sozinho (ex.: buscar por um campo que não é o próprio id, ou verificar unicidade entre instâncias irmãs); **OU**
- ✔ exige colaboração entre múltiplos objetos do domínio.

Caso nenhum desses critérios se aplique, a regra **permanece obrigatoriamente no Aggregate** (ou no Value Object, quando for regra de formato/valor). É expressamente proibido criar Domain Service para validações simples, setters, formatação, conversões, ou qualquer comportamento que já pertença naturalmente ao Aggregate — mesmo que "pareça" merecer uma classe própria.

Este critério é consistente com [ENGINEERING_PLAYBOOK.md § 3](../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer): "Domain Services: lógica de domínio que não pertence naturalmente a uma única Entity."

## 3. Mapa Completo das Regras do Domínio

Inventário de toda regra de negócio já registrada em fonte oficial para `User`/`Role`/`Permission`/`Email`, reunidas de [IDENTITY_DOMAIN_MODEL.md § 9](IDENTITY_DOMAIN_MODEL.md), [IDENTITY_TECHNICAL_BLUEPRINT.md §§ 1, 7, 8, 9](IDENTITY_TECHNICAL_BLUEPRINT.md), [IDENTITY_AGGREGATE_DESIGN_FREEZE.md §§ 4-11](IDENTITY_AGGREGATE_DESIGN_FREEZE.md) e do código já implementado (`user.ts`, `role.ts`, `email.ts`, `permission.ts`). Numeração `R1`–`R17`, referenciada nas seções seguintes.

| # | Regra |
|---|---|
| R1 | `id` é imutável após a criação (`User`, `Role`) |
| R2 | Todo `User`/`Role` pertence a exatamente uma Organization (multi-tenancy) |
| R3 | `Permission.code` segue o formato `<domínio>.<recurso>.<ação>` |
| R4 | `User` com status `"disabled"` não pode autenticar |
| R5 | `Role.name` é único dentro de uma Organization |
| R6 | `User` não pode ser seu próprio `createdBy` na criação |
| R7 | `User.roleIds` só pode referenciar `Role`s da mesma Organization do `User` |
| R8 | Transições de `UserStatus` restritas ao ciclo de vida congelado (`created → invited → active → disabled`) |
| R9 | `Role.permissions` só cresce/diminui via `grantPermission`/`revokePermission` |
| R10 | Verificar se um `User` possui uma `Permission` (via seus `Role`s) |
| R11 | Verificar credenciais de um `User` (autenticação) |
| R12 | Nenhuma transação de escrita cruza dois Aggregates — cada `save()` grava exatamente um Aggregate |
| R13 | `createdBy`/`updatedBy` sempre fornecidos por quem chama, nunca inferidos pelo Aggregate |
| R14 | Reativação de `User` "disabled" (`requer decisão`, não confirmada) |
| R15 | Remoção de `Role` com `User`s ainda atribuídos — referência órfã (`requer decisão`, não confirmada) |
| R16 | Unicidade de `Email` — por Organization ou global (`requer decisão`, não confirmada) |
| R17 | Número máximo de `Role`s por `User` (`requer decisão`, não confirmada) |

R14–R17 são explicitamente `requer decisão` em Blueprint/Freeze — **não são regras confirmadas**, portanto não são classificadas nas seções 4-11 abaixo (classificar exigiria presumir uma decisão de negócio ainda não tomada). Ver § 6 (Candidatos Rejeitados) para o porquê de nenhum Domain Service ter sido proposto para elas.

## 4. Tabela — Regra × Categoria × Responsável × Origem × Justificativa

| Regra | Categoria | Responsável | Documento de Origem | Justificativa |
|---|---|---|---|---|
| R1 | A | `Entity`/`AggregateRoot` (Shared Kernel) | ENG-0001.2 | Identidade é responsabilidade estrutural da própria classe base; nenhuma colaboração externa necessária |
| R2 | A | `User`/`Role` (campo `organizationId` obrigatório no `Props`) | Freeze § 4 | Garantida pelo próprio tipo — `organizationId: UniqueEntityId` é campo obrigatório, verificável em tempo de compilação, sem consulta externa |
| R3 | A | `Permission` (Value Object) | Blueprint § 3, `BOM.md` | Formato validado inteiramente a partir do próprio valor recebido, sem depender de mais nada |
| R4 | B | `AuthenticationDomainService` (candidato já proposto, Blueprint § 4) | Blueprint § 4, § 8 | `User` não tem método `authenticate()` — a regra só existe no ponto em que alguém tenta autenticar, o que exige carregar o `User` (Repository) e aplicar uma Specification sobre ele antes de prosseguir |
| R5 | B (condicional) | Candidato novo — ver § 5 | Freeze § 6 ("Proposta") | Um `Role` isolado não pode saber se seu `name` já existe em outro `Role` da mesma Organization — exige consulta a outras instâncias via `RoleRepository` |
| R6 | A | `User.create()` (satisfeita por construção) | Blueprint § 8, Freeze § 6, ENG-0002.7 § Self Review | `create()` nunca aceita um `id` externo — a violação é estruturalmente impossível, sem necessidade de checagem em runtime nem de colaboração externa |
| R7 | B (novo) | Candidato novo — ver § 5 | Freeze § 9 ("proposta, não confirmada"), ENG-0002.7 § Self Review | `User` só tem o `roleId` (referência); verificar a que Organization esse `Role` pertence exige carregá-lo via `RoleRepository` — colaboração entre dois Aggregates |
| R8 | A | `User.invite`/`activate`/`disable` | Freeze § 11 | Toda a máquina de estados é interna a `User`, já implementada com guarda (`ConflictError`) sem qualquer dependência externa |
| R9 | A | `Role.grantPermission`/`revokePermission` | Freeze §§ 4, 5, 8 | `permissions` é embutido por valor dentro da própria fronteira transacional de `Role` — nenhuma colaboração externa necessária |
| R10 | B | `AuthorizationDomainService` (candidato já proposto, Blueprint § 4) | Blueprint § 4, § 10 | Exige carregar um `User` **e** o(s) `Role`(s) que ele referencia — nenhum dos dois Aggregates tem, sozinho, todo o dado necessário |
| R11 | B | `AuthenticationDomainService` (candidato já proposto, Blueprint § 4) | Blueprint § 4 | Exige `UserRepository` (buscar por credencial) e um mecanismo de verificação de senha (fora de escopo técnico, Blueprint) |
| R12 | C | Application Layer (orquestração de chamadas a Repository) | Freeze § 5, ENS-0001 § 9 | Rege *como* a Application Layer sequencia chamadas a `save()` — não é comportamento de um objeto de domínio, é uma restrição sobre o chamador |
| R13 | C | Application Layer (contexto de sessão/autenticação do ator) | ENS-0001 § 6 | A origem de "quem está executando a operação" é responsabilidade de infraestrutura de sessão — o Aggregate nunca deve inferir isso sozinho, para não se acoplar a um mecanismo de autenticação |

Não há nenhuma regra classificada como **Categoria D (Infrastructure Concern)** neste mapa — nenhuma das regras encontradas em fonte oficial é, ela própria, uma preocupação de infraestrutura (armazenamento, serialização, protocolo). Onde a infraestrutura aparece (ex.: "como o `UserRepository` é implementado com Prisma") não é uma regra de negócio, está fora do escopo desta missão e do próprio domínio.

## 5. Análise Detalhada — Candidatos a Domain Service

Para cada regra classificada como Categoria B, as 5 perguntas obrigatórias da ordem de missão, respondidas integralmente.

### R4 + R11 — `AuthenticationDomainService`

1. **Pertence exclusivamente a um Aggregate?** NÃO.
2. — (não aplicável, resposta da pergunta 1 é NÃO)
3. **Depende de**: ☑ Repository (`UserRepository`, para localizar o `User`); ☐ mais de um Aggregate (só `User` está envolvido); ☑ consulta externa (verificação de senha — mecanismo explicitamente fora de escopo técnico); ☐ outro Bounded Context; ☐ política organizacional.
4. **Deve morar em**: ☑ Domain Service.
5. **Documento que fundamenta**: [IDENTITY_TECHNICAL_BLUEPRINT.md § 4](IDENTITY_TECHNICAL_BLUEPRINT.md) — já propõe `AuthenticationDomainService implements AsyncDomainService<VerifyCredentialsInput, User>`, consumindo `UserIsActiveSpecification` (Blueprint § 6) antes de prosseguir (R4). Esta missão **confirma e congela** essa classificação já proposta — não a inventa.

**Status**: ✅ Candidato aprovado (já proposto no Blueprint, congelado agora).

### R10 — `AuthorizationDomainService`

1. **Pertence exclusivamente a um Aggregate?** NÃO.
2. —
3. **Depende de**: ☑ Repository (`UserRepository` + `RoleRepository`); ☑ mais de um Aggregate (`User` e `Role`); ☐ consulta externa; ☐ outro Bounded Context; ☐ política organizacional.
4. **Deve morar em**: ☑ Domain Service.
5. **Documento que fundamenta**: [IDENTITY_TECHNICAL_BLUEPRINT.md § 4](IDENTITY_TECHNICAL_BLUEPRINT.md) — já propõe `AuthorizationDomainService implements AsyncDomainService<CheckPermissionInput, boolean>`, consumindo `RoleHasPermissionSpecification` (Blueprint § 6) sobre cada `Role` carregado. Esta missão **confirma e congela** essa classificação já proposta.

**Status**: ✅ Candidato aprovado (já proposto no Blueprint, congelado agora).

### R7 — `RoleAssignmentDomainService` (novo, identificado nesta missão)

1. **Pertence exclusivamente a um Aggregate?** NÃO.
2. —
3. **Depende de**: ☑ Repository (`RoleRepository`, para carregar o `Role` e ler seu `organizationId`); ☑ mais de um Aggregate (`User` e `Role`); ☐ consulta externa; ☐ outro Bounded Context; ☐ política organizacional.
4. **Deve morar em**: ☑ Domain Service.
5. **Documento que fundamenta**: [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 9](IDENTITY_AGGREGATE_DESIGN_FREEZE.md) — "`User.roleIds` só pode referenciar `Role`s da mesma Organization do `User` (cross-Organization proibido)", marcada "proposta, não confirmada em nenhuma fonte anterior" no próprio Freeze, mas já registrada como estruturalmente fora do alcance de `User.assignRole()` no Self Review da Missão ENG-0002.7 ("Verificar que `roleId` pertence à mesma Organization do `User`... exige carregar o `Role`... fica para a Application Layer/Domain Service").

**Responsabilidade proposta**: antes de delegar a `user.assignRole(roleId, updatedBy)`, carregar o `Role` via `RoleRepository`, comparar `role.organizationId` com `user.organizationId`; só prosseguir se coincidirem, senão devolver erro de domínio (`BusinessRuleError`, hierarquia já existente no Shared Kernel).

**Por que não é apenas `User.revokeRole()` também?** `revokeRole` **não** precisa deste Domain Service — remover uma referência não pode introduzir uma violação de multi-tenancy que não existia antes (se a referência já estava lá, ela já passou por essa checagem quando foi adicionada, ou o dado já estava inconsistente por outro motivo, fora do escopo desta análise). `User.revokeRole()` permanece Categoria A, sem alteração.

**Status**: ✅ Candidato aprovado — **novo**, identificado nesta missão a partir de uma lacuna já registrada em ENG-0002.7 (não inventado agora: a lacuna já estava documentada, esta missão só a classifica formalmente).

### R5 — Unicidade de `Role.name` (candidato condicional, NÃO aprovado nesta missão)

1. **Pertence exclusivamente a um Aggregate?** NÃO.
2. —
3. **Depende de**: ☑ Repository (`RoleRepository`, para consultar outras instâncias); ☐ mais de um Aggregate (só instâncias de `Role`, mesmo tipo); ☑ consulta externa (busca por nome dentro da Organization, índice não definido); ☐ outro Bounded Context; ☐ política organizacional.
4. **Deve morar em**: candidato a Domain Service **ou** a uma checagem de pré-condição na Application Layer (padrão "check-then-create") — **este documento não decide entre os dois**, ver justificativa.
5. **Documento que fundamenta**: [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 6](IDENTITY_AGGREGATE_DESIGN_FREEZE.md), status **"Proposta"** (não "Citada", não confirmada por nenhuma fonte que declare a regra explicitamente).

**Por que não é aprovado como Domain Service nesta missão**: a regra em si (`Role.name` único por Organization) é apenas "Proposta" no Freeze, não confirmada. Aprovar formalmente um Domain Service para uma regra ainda não confirmada seria decidir a regra de negócio por trás dele — proibido por esta ordem de missão ("nenhuma regra de negócio nova"). Diferente de R7 (também "proposta" no Freeze, mas cuja necessidade de proteção **já foi confirmada como lacuna real** durante a implementação de `User.assignRole()`, ENG-0002.7), R5 nunca chegou a ser testada contra uma implementação real — `Role.create()` (ENG-0002.8) não tem nenhuma checagem de unicidade, e nenhuma missão de implementação encontrou essa lacuna na prática ainda.

**Status**: ⏸️ Candidato registrado, **não aprovado nem rejeitado** — decisão explicitamente adiada até a regra em si (R5) ser confirmada pelo CTO. Se confirmada, a forma (Domain Service vs. Application Layer pré-checagem) ainda precisará ser decidida separadamente.

## 6. Candidatos Rejeitados

Domain Services considerados durante a modelagem e **deliberadamente não propostos**, com a razão técnica de cada rejeição:

| Candidato Considerado | Por que foi rejeitado |
|---|---|
| `UserActivationDomainService` (ou similar, para `invite`/`activate`/`disable`) | Toda a máquina de estados (R8) já é interna a `User`, com guarda própria (`ConflictError`) e sem nenhuma dependência de Repository ou de outro Aggregate — nenhum dos 4 critérios de existência (§ 2) se aplica. Regra permanece 100% no Aggregate. |
| `UserCreationDomainService` (ou `UserRegistrationDomainService`) | `User.create()` já cobre toda a criação, incluindo a satisfação estrutural de R6 (`createdBy` não pode ser autorreferencial). Nenhuma colaboração externa envolvida. |
| `PermissionValidationDomainService` | Validação de formato de `Permission.code` (R3) já é responsabilidade do próprio Value Object `Permission.create()` — um Value Object nunca precisa de Domain Service para validar seu próprio valor. |
| `RoleGrantPermissionDomainService` / `RolePermissionDomainService` | `Role.grantPermission`/`revokePermission` (R9) já operam inteiramente dentro da fronteira transacional de `Role` — `permissions` é embutido por valor, sem consulta externa nem colaboração com outro Aggregate. |
| `UserRoleRevocationDomainService` | Simétrico ao candidato de R7, mas para revogação — rejeitado porque remover uma referência não pode introduzir uma violação de multi-tenancy nova (ver justificativa em § 5, R7). `User.revokeRole()` permanece Categoria A. |
| `EmailUniquenessDomainService` | A regra que este serviço encarnaria (R16 — unicidade de `Email`, por Organization ou global) é explicitamente `requer decisão` em [IDENTITY_TECHNICAL_BLUEPRINT.md § 8](IDENTITY_TECHNICAL_BLUEPRINT.md) — **não existe ainda como regra de negócio confirmada**. Propor um Domain Service para uma regra inexistente seria inventar a própria regra por trás dele, proibido por esta missão. |
| `RoleOrphanReferenceDomainService` (checagem de `Role` removido ainda referenciado por algum `User`) | A política de remoção de `Role` (R15) é explicitamente `requer decisão` em [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 10](IDENTITY_AGGREGATE_DESIGN_FREEZE.md) — mesma razão do candidato anterior: a regra de negócio que o serviço protegeria ainda não existe. |
| `PasswordHashingDomainService` / `PasswordVerificationDomainService` | O mecanismo de verificação de senha é explicitamente proibido de ser decidido nesta cadeia de missões — [IDENTITY_TECHNICAL_BLUEPRINT.md § 4](IDENTITY_TECHNICAL_BLUEPRINT.md): "mecanismo de verificação de senha (hash) não definido — proibido... fora do escopo aqui". Mesmo que uma decisão de hashing seja tomada no futuro, a operação de verificar um hash é uma preocupação técnica (Categoria D, Infrastructure Concern via uma Porta/Adapter), não uma regra de domínio — não é isso que caracteriza um Domain Service. |
| Serviços genéricos de busca (`UserFinderDomainService`, `RoleQueryDomainService` etc.) | Seriam wrappers finos sobre `Repository.findById`/`findAll`, sem nenhuma lógica de domínio própria — exatamente o que a ordem de missão proíbe explicitamente ("comportamento que já pertença naturalmente ao Aggregate/Repository"). Uma consulta sem decisão embutida não é Domain Service, é uso direto do Repository pela Application Layer. |
| `UserReactivationDomainService` | A regra que protegeria (R14 — se `User` "disabled" pode voltar a "active") é explicitamente `requer decisão` em [IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 11](IDENTITY_AGGREGATE_DESIGN_FREEZE.md) — mesma razão de `EmailUniquenessDomainService`/`RoleOrphanReferenceDomainService`. |

## 7. Regras que Permanecem nos Aggregates (Categoria A)

R1, R2, R3, R6, R8, R9 — ver § 4 para a tabela completa. Resumo: toda transição de estado de `User` (R8), toda mutação de `permissions` em `Role` (R9), toda validação de formato de Value Object (R3), e toda regra satisfeita estruturalmente pelo próprio tipo (R1, R2, R6) permanecem exatamente onde já estão implementadas — nenhuma mudança de local proposta por esta missão.

## 8. Regras que Futuramente Irão para Application Layer (Categoria C)

- **R12** — sequenciamento de chamadas a `save()`, garantindo que nenhuma escrita cruza dois Aggregates na mesma operação lógica (Freeze § 5). Não é comportamento de nenhum objeto de domínio — é uma restrição sobre como o código que orquestra os Repositories deve se comportar.
- **R13** — fornecimento de `createdBy`/`updatedBy` a partir do contexto de quem está executando a operação (sessão/autenticação) — a Application Layer é a única camada com acesso legítimo a essa informação; o Aggregate nunca deve inferi-la (ENS-0001 § 6).

Nenhuma das duas é uma regra de negócio no sentido de "decisão que afeta o resultado" — são restrições de orquestração/proveniência de dado, mas ainda assim seguem o pedido da ordem de missão de classificar toda regra encontrada, mesmo as que não geram Domain Service nem ficam no Aggregate.

## 9. Regras Dependentes de Repository

R4, R5 (condicional), R7, R10, R11 — todas as Categoria B (ou candidata a B) dependem de pelo menos um Repository (`UserRepository` e/ou `RoleRepository`) para serem executadas, porque nenhuma delas pode ser resolvida com o estado de uma única instância de Aggregate já carregada em memória.

## 10. Regras Dependentes de Múltiplos Aggregates

R7 (`User` + `Role`, via `RoleAssignmentDomainService`) e R10 (`User` + `Role`, via `AuthorizationDomainService`) — as únicas duas regras que exigem carregar e raciocinar sobre instâncias de **dois tipos diferentes** de Aggregate Root ao mesmo tempo. R4/R11 (`AuthenticationDomainService`) e R5 (candidata) envolvem só um tipo de Aggregate, mesmo dependendo de Repository.

## 11. Matriz Domain Service × Aggregate

| Domain Service | Usa `User` | Usa `Role` | Repository Necessário | Status |
|---|---|---|---|---|
| `AuthenticationDomainService` | Lê | — | `UserRepository` | ✅ Aprovado (já proposto no Blueprint, congelado agora) |
| `AuthorizationDomainService` | Lê | Lê | `UserRepository` + `RoleRepository` | ✅ Aprovado (já proposto no Blueprint, congelado agora) |
| `RoleAssignmentDomainService` | Lê (delega mutação a `User.assignRole`) | Lê (só `organizationId`) | `UserRepository` + `RoleRepository` | ✅ Aprovado — novo, identificado nesta missão |
| Unicidade de `Role.name` (sem nome definitivo ainda) | — | Lê (consulta por nome) | `RoleRepository` | ⏸️ Condicional — regra em si não confirmada (§ 5) |

Nenhum Domain Service usa `Permission` ou `Email` diretamente — ambos são Value Objects consumidos através de `User`/`Role`, nunca carregados isoladamente via Repository (não têm Repository próprio, Blueprint § 5).

## 12. Declaração Formal de Freeze

A partir desta missão, a lista de Domain Services do Identity Domain está **congelada**:

- **3 Domain Services aprovados**: `AuthenticationDomainService`, `AuthorizationDomainService` (ambos já propostos no Blueprint, agora confirmados), `RoleAssignmentDomainService` (novo, identificado nesta missão a partir de uma lacuna já registrada em ENG-0002.7).
- **1 candidato condicional, não aprovado nem rejeitado**: unicidade de `Role.name` — depende de R5 ser confirmada como regra de negócio antes que sua forma (Domain Service vs. Application Layer) possa ser decidida.
- **10 candidatos rejeitados** (§ 6), cada um com razão técnica registrada.

Adicionar, remover ou reclassificar um Domain Service deste domínio a partir de agora **exige ADR** — mesmo padrão já usado para a estrutura dos Aggregates ([IDENTITY_AGGREGATE_DESIGN_FREEZE.md](IDENTITY_AGGREGATE_DESIGN_FREEZE.md)). Confirmar R5, R14, R15, R16 ou R17 como regra de negócio (decisão do CTO) **não** exige ADR por si só — mas, se a confirmação de R5 disparar a necessidade de um Domain Service novo, a criação desse serviço específico segue esta mesma regra de freeze.

Esta missão **não implementa nenhum dos 3 Domain Services aprovados** — implementação é objeto de uma futura missão (`ENG-0002.10B`, citada na própria ordem de missão como próxima etapa), sujeita a aprovação explícita do CTO antes de começar.

---

## Relação com Outros Módulos

- [IDENTITY_TECHNICAL_BLUEPRINT.md § 4](IDENTITY_TECHNICAL_BLUEPRINT.md) — origem de `AuthenticationDomainService`/`AuthorizationDomainService`, confirmados aqui
- [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](IDENTITY_AGGREGATE_DESIGN_FREEZE.md) — origem de R2, R5, R6, R7, R8, R9, R12
- [src/domain/aggregates/](src/domain/aggregates/README.md) — `User`/`Role`, onde as regras Categoria A já estão implementadas
- [src/domain/repositories/](src/domain/repositories/README.md) — `UserRepository`/`RoleRepository`, consumidos pelos 3 Domain Services aprovados
- [knowledge/engineering/ENGINEERING_PLAYBOOK.md § 3](../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer) — definição de Domain Service usada como critério (§ 2)
- [packages/shared-kernel/](../../../packages/shared-kernel/README.md) — `DomainService`/`AsyncDomainService`/`DomainServiceResult<T>` (ENG-0001.8), contrato que os 3 Domain Services aprovados vão implementar quando codificados

## Status

🟢 Identificação e classificação concluídas e congeladas (Missão ENG-0002.10A). Nenhum código implementado. Aguardando aprovação formal do CTO antes de qualquer missão de implementação (`ENG-0002.10B`).
