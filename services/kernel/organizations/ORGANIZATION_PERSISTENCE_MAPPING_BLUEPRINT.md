# Organization — Persistence Mapping Blueprint

Versão: 1.0.0

Status: 🟢 Oficial — contrato de persistência, sem tecnologia definida, sem implementação

Missão: ENG-0003.10.5 (Organization Persistence Mapping Blueprint) — EPIC-003

Escopo: consolidar, para o Aggregate `Organization` já implementado ([organization.ts](src/domain/aggregates/organization/organization.ts), ENG-0003.7) e já congelado ([ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md), ENG-0003.5), o contrato de **como** ele será persistido — nunca **com o quê**. Nenhum código, Prisma Schema, Migration, Mapper, Repository concreto, Value Object ou Domain Service foi criado nesta missão. Nenhuma das 11 missões anteriores do EPIC-003 (ENG-0003.1 a ENG-0003.10) foi alterada ou reaberta. Padrão estrutural de rigor seguido de [ORGANIZATION_TECHNICAL_BLUEPRINT.md](ORGANIZATION_TECHNICAL_BLUEPRINT.md) (ENG-0003.6) e, mais distante, de `IDENTITY_TECHNICAL_BLUEPRINT.md` — usados só como padrão de forma (cabeçalho, numeração de seções, "Relação com Outros Módulos", "Status"), nunca como fonte de conteúdo (nenhum dos dois documentos de Identity trata de persistência real ainda).

**Regra de método**: todo campo, restrição ou estratégia abaixo deriva exclusivamente do que já está congelado em `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md`, do código real já implementado em `organization.ts` (ENG-0003.7), ou de fontes já oficiais (`objects/Organization.md`, `ADR-ORG-001`). Onde nenhuma dessas fontes decide algo, a seção correspondente é marcada **BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO** — nunca preenchida por inferência.

---

## 1. Objetivo

Definir o contrato de persistência do Aggregate `Organization` — o mapeamento entre seu estado em memória (`OrganizationProps`, `organization.ts`) e uma futura camada de persistência — sem escolher banco de dados, ORM ou tecnologia. Este documento passa a ser **obrigatório** para toda implementação futura de Prisma Schema, Mapper, Prisma Repository, Migrations, Queries e Tests do Organization Domain (a partir de `ENG-0003.11`).

## 2. Escopo

**Faz parte**: o mapeamento campo a campo do Aggregate `Organization` (§ 4), a distinção entre estado persistido e estado transitório (§ 5), a estratégia conceitual de `Mapper` (§ 15-16) e a separação de responsabilidade entre `Mapper` e `Repository` (§ 16-17), candidatos de índice e restrição (§ 11-12) — sempre como candidatos, nunca como decisão de banco.

**Não faz parte**: escolha de banco de dados, ORM ou ferramenta de migration. `ENGINEERING_PLAYBOOK.md § 5` já registra que a implementação dos Repositories é feita via Prisma (`ADR-0005`) — este documento **deliberadamente não depende** dessa decisão platform-wide, mantendo o contrato válido mesmo que a tecnologia mude; nenhuma sintaxe, tipo ou nome específico de Prisma aparece abaixo. Também não fazem parte: Prisma Schema real, Migration, qualquer código TypeScript, Value Objects reais (`Slug`/`Document`/`Address`/`BrandingTheme` continuam bloqueados, ENG-0003.8), `Workspace`/`Team`/`Subscription` (fora do Freeze, § 1 abaixo), a tabela de transições de `status`, e qualquer campo do Blueprint técnico (`ORGANIZATION_TECHNICAL_BLUEPRINT.md § 3`) que a implementação real do Aggregate (ENG-0003.7) deliberadamente excluiu (`branding`, `plan`, `billingStatus`, `trialEnd`, `maxUsers`, `maxStorage`, `storageUsed`, `featureFlags`, `settings`).

## 3. Aggregate Persistido

**`Organization`** — única unidade persistida coberta por este documento. É o único Aggregate Root do Organization Domain já implementado (`organization.ts`, ENG-0003.7) e o único coberto pelo Freeze (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 1`). `Workspace`, `Team` e `Subscription` permanecem candidatos a Aggregate Root próprio (`DEC-ORG-002`, `DEC-ORG-003`, `DEC-ORG-004`), sem Object Specification, sem implementação, sem Freeze — não têm contrato de persistência próprio até que essas missões futuras existam.

## 4. Campos Persistidos

Tabela derivada exclusivamente de `OrganizationProps` + `id` (herdado de `Entity`/`AggregateRoot`), conforme implementado em `organization.ts` (ENG-0003.7):

| Campo do Aggregate | Tipo de domínio | Tipo esperado em persistência | Obrigatório? | Pode ser nulo? | Observações |
|---|---|---|---|---|---|
| `id` | `UniqueEntityId` | string (UUID) | Sim | Não | Chave primária. Gerado via `node:crypto` quando não fornecido (`UniqueEntityId`, ENG-0001.2). Fonte: `objects/Organization.md § ATRIBUTOS` ("ID, UUID, PK"). |
| `slug` | `string` | string | Sim | Não | Validado como não-vazio em `Organization.create()`. Ainda não é Value Object (`Slug` bloqueado, ENG-0003.8). Formato e escopo de unicidade **BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO** (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16`). |
| `name` | `string` | string | Sim | Não | Validado como não-vazio em `create()` e em `updateProfile()`. |
| `legalName` | `string` | string | Sim (campo obrigatório em `CreateOrganizationInput`) | Não | Diferente de `name`/`slug`, `create()` **não valida** não-vazio para `legalName` — comportamento já existente no código real (ENG-0003.7), não uma regra nova inventada aqui. |
| `document` | `string` | string | Sim (campo obrigatório em `CreateOrganizationInput`) | Não | Ainda não é Value Object (`Document` bloqueado, ENG-0003.8). Formato de validação (CNPJ) **BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO**. |
| `address` | `OrganizationAddress` (objeto composto) | objeto — ver § 8 | Sim | Não | Estrutura interna (8 campos) já congelada como agrupamento (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 5`), não como Value Object validado. |
| `status` | `OrganizationStatus` (union de 5 strings) | string (5 valores fechados) | Sim | Não | Exigido como input obrigatório em `create()` — nenhum default aplicado (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16`: valor inicial não definido). Ver § 6. |
| `metadata` | `OrganizationMetadata` (`Record<string, unknown>`) | JSON | Sim (sempre presente após `create()`, default `{}`) | Não | Forma interna livre, não definida por nenhuma fonte — mesma justificativa de `UserMetadata` (Identity, ENG-0002.7). |
| `createdAt` | `Date` | timestamp | Sim | Não | Gerado internamente em `create()` (`new Date()`); nunca fornecido pelo chamador. |
| `updatedAt` | `Date` | timestamp | Sim | Não | Atualizado a cada mutação bem-sucedida (`create()`, `updateProfile()`). |
| `deletedAt` | `Date \| undefined` | timestamp | Não | Sim | Campo existe no tipo (RN005, Soft Delete), mas **nenhum método do Aggregate hoje o preenche** — `archive()`/transições bloqueadas (`ORGANIZATION_TECHNICAL_BLUEPRINT.md § 8`). Fluxo real que o populariam: **BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO**. |

Nenhum tipo de banco (`Prisma.String`, `varchar`, `jsonb`, etc.) ou tipo SQL aparece acima — só o contrato de forma e obrigatoriedade.

## 5. Campos NÃO Persistidos

- **Domain Events** — a coleção interna `_domainEvents`/`domainEvents` de `AggregateRoot<T>` (Shared Kernel, ENG-0001.5) nunca é uma coluna/campo persistido. Representa algo que aconteceu, não estado; seu ciclo de vida termina quando a Application/Infrastructure Layer o publica (Event Bus) e chama `clearEvents()` — nenhuma dessas camadas existe ainda para `Organization`.
- **`Result<T, DomainError>` / `Option<T>`** — tipos funcionais do Shared Kernel (ENG-0001.3), existem só durante a execução de um método (`create()`, `updateProfile()`), nunca persistidos.
- **Getters computados/derivados** — nenhum existe hoje em `organization.ts` (todo getter reflete 1:1 um campo de `props`, listado em § 4). Se algum vier a existir no futuro, deve ser recalculado, nunca persistido.
- **Estado intermediário de validação** dentro de `create()`/`updateProfile()` (ex.: o `Result` parcial antes de `Result.ok`) — nunca existe fora da execução do método, não é campo do Aggregate.

**Nota de precisão**: o campo `metadata` (§ 4) **é** persistido — a expressão "metadata transitória" acima não se refere a ele, e sim a qualquer metadado computado em tempo de execução que nunca chegou a ser modelado como campo real de `OrganizationProps`.

## 6. OrganizationStatus

Persistido como valor de string simples — nenhuma tabela associada, nenhuma FK. Exatamente os 5 valores definitivos de [ADR-ORG-001 § 4](../../../adr/ADR-ORG-001-organization-status-strategy.md): `"active"`, `"suspended"`, `"trial"`, `"blocked"`, `"archived"`. Nenhum sexto valor é inventado aqui — `ADR-ORG-001 § 7` já rejeitou explicitamente a opção de um superconjunto de 8 valores.

Se a persistência real representar isso como um enum nativo do banco ou como string livre validada na Application Layer é decisão de tecnologia — fora do escopo deste documento (§ 2).

**BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO**:
- Tabela completa de transições entre os 5 valores (`ADR-ORG-001 § 13`, `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 8`).
- Valor inicial de `status` na criação — hoje contornado exigindo `status` como input obrigatório de `create()` (ENG-0003.7), não resolvido de verdade (`ADR-ORG-001 § 10`: candidato mais provável `"trial"`, não confirmado).

## 7. Identidade

- **`OrganizationId`** — representado pela instância de `UniqueEntityId` herdada de `Entity`/`AggregateRoot` (getter `id`). Persistido como string (UUID v4, gerado via `node:crypto` quando não fornecido) — mesma estratégia já usada por `User`/`Role` no Identity Domain. Chave primária.
- **`Slug`** — campo `string` simples hoje, **não** um Value Object real. `Slug` (candidato a VO) permanece bloqueado (ENG-0003.8: nenhuma fonte define formato ou escopo de unicidade). Persistido como string; unicidade **BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO** (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16`: "escopo da unicidade não coberto").
- **`Document`** — campo `string` simples hoje, também não um Value Object real. `Document` (candidato a VO) permanece bloqueado (ENG-0003.8: formato CNPJ não definido em nenhuma fonte). Persistido como string; formato de validação **BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO**.

## 8. Objetos Compostos

- **`Address`** (`OrganizationAddress`: `street`, `number`, `district`, `complement?`, `city`, `state`, `zipCode`, `country`) — não é Value Object real hoje (`Address` bloqueado, ENG-0003.8). Estrutura interna (os 8 campos) já congelada como agrupamento (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 5`, "Agrupamento congelado") — nenhum campo além desses 8 deve ser inventado em persistência. Estratégia prevista: objeto embutido/serializado ou colunas próprias — decisão de tecnologia, fora de escopo (§ 2).
- **`Branding` (`BrandingTheme`)** — **não implementado** no Aggregate atual (`organization.ts` não tem campo `branding`). `ORGANIZATION_TECHNICAL_BLUEPRINT.md § 3` o lista como candidato do Blueprint técnico, mas `ENG-0003.7` excluiu deliberadamente por falta de valor/forma de criação definida. Nada a mapear ainda. Quando (e se) for implementado no Aggregate, seguirá o mesmo agrupamento já congelado (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 5`: `logoUrl`, `faviconUrl`, `primaryColor`, `secondaryColor`, `accentColor`).
- **`Metadata`** (`OrganizationMetadata = Record<string, unknown>`) — persistido (§ 4), forma interna livre. Estratégia prevista: campo único, tipo JSON — nunca colunas próprias, já que nenhuma fonte define uma forma estruturada. Não inventar chaves específicas.

## 9. Valores Opcionais

- `deletedAt?: Date` — opcional, nulo até (e se) um fluxo de soft delete existir; hoje nenhum método popula esse campo (§ 4, § 6).
- `complement?: string` (dentro de `Address`) — opcional, nulo permitido.
- `metadata` — tecnicamente sempre presente após `create()` (default `{}`), nunca deve ser tratado como nulo em persistência — sempre um objeto, possivelmente vazio.

Regra geral: um campo opcional no domínio (`?` em TypeScript) deve permitir nulo em persistência; um campo obrigatório no domínio nunca deve ser nulo em persistência. Tradução 1:1 — nenhum default além do já existente no próprio Aggregate (`metadata: {}`) é inventado aqui.

## 10. Coleções

**Não existem coleções persistidas dentro do Aggregate `Organization`** — nenhum array, lista de ids ou sub-entidade coletiva em `OrganizationProps` (diferente de `User.roleIds[]` no Identity Domain). `Workspace`, `Team` e `Subscription` são candidatos a Aggregate Root **próprio** (`DEC-ORG-002`, `DEC-ORG-003`, `DEC-ORG-004`) — mesmo se implementados no futuro, nunca seriam coleções embutidas dentro de `Organization`; referenciariam `Organization` só por `organizationId`, no sentido inverso (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 10`). Ficam fora do escopo deste documento.

## 11. Índices Esperados

Candidatos, sem definir banco ou tecnologia de indexação:

- `id` — chave primária (implícita).
- `slug` — candidato a índice único; escopo de unicidade **BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO** (§ 7). Listado como candidato, não confirmado.
- `document` — candidato a índice único (CNPJ tende a ser único por natureza de negócio), mas nenhuma fonte confirma essa restrição explicitamente para `Organization`. Candidato, não confirmado.
- `status` — candidato a índice simples (ex.: listar organizações em `trial`); nenhuma fonte cita esse caso de uso explicitamente. Candidato especulativo.
- `deletedAt` — candidato a índice parcial, para excluir registros com soft delete de consultas padrão. Decisão de tecnologia, fora de escopo confirmar aqui.

## 12. Restrições Esperadas

| Restrição | Campo(s) | Fonte / Status |
|---|---|---|
| Unique | `id` | Garantido pela geração de `UniqueEntityId` (ENG-0001.2) |
| Unique (candidato) | `slug` | Escopo não definido — § 7, § 11 |
| Nullable | `deletedAt`, `address.complement` | Únicos campos opcionais do Aggregate hoje, § 9 |
| Imutabilidade | `id`, `createdAt` | Nenhum método de `organization.ts` os altera após criação |
| Referência | Nenhuma FK própria | `Organization` é a raiz de referência (RN001) — outros Aggregates referenciam `organizationId` dela, nunca o contrário |
| Consistência transacional | Toda mutação de `Organization` | Fronteira transacional própria (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 12`) — nenhuma restrição de persistência pode depender de outro Aggregate na mesma transação |

## 13. Estratégia de Versionamento

**Não existe versionamento definido.** `Organization` **não implementa** `Versionable` do Shared Kernel — diferente de `User`/`Role` no Identity Domain (`ORGANIZATION_TECHNICAL_BLUEPRINT.md § 3`: "nenhuma fonte cita ... `version` para `Organization`"). Nenhum campo `version` existe em `OrganizationProps`. Controle de concorrência (optimistic locking) em persistência real é **BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO** — não inventado aqui.

## 14. Estratégia de Auditoria

RN006 (`objects/Organization.md`, "Auditoria obrigatória") descreve um registro rico: Usuário, Data, IP, Origem, Evento, Valores antigos, Valores novos — diferente do par simples `createdBy`/`updatedBy` do contrato `Auditable` do Shared Kernel. `ORGANIZATION_TECHNICAL_BLUEPRINT.md § 3` já registrou essa observação, concluindo que é "consistente com um mecanismo de audit log separado (possivelmente `services/kernel/audit/`), não com o próprio Aggregate implementando `Auditable`. Não presumido além disso."

Este documento não resolve essa lacuna. **BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO**: se o mecanismo real de auditoria é um Aggregate/Entity próprio (`Audit Log`, já citado em `BOM.md`), um serviço do Kernel já existente (`services/kernel/audit/`), um trigger de banco, ou outro mecanismo — nenhuma solução é criada aqui.

## 15. Mapeamento Aggregate ↔ Persistência

Conceitualmente:

```
Aggregate (Organization — instância em memória, encapsulando invariantes)
  ↓
Mapper (função/classe pura de tradução, sem I/O)
  ↓
Persistência (registro real — tecnologia não definida por este documento)
```

Acesso direto ao Aggregate pela camada de persistência é **proibido** — nenhum código de acesso a banco pode instanciar `Organization` diretamente; só o `Mapper` traduz nas duas direções, só o `Repository` orquestra a chamada ao `Mapper` e ao mecanismo de persistência. Reforça `ENGINEERING_PLAYBOOK.md § 2`: "`domain/` nunca importa de `infrastructure/`".

## 16. Responsabilidades do Mapper

**Poderá**:
- Converter uma instância de `Organization` em um registro plano de persistência, usando exclusivamente os campos de § 4 (`toPersistence()`).
- Converter um registro de persistência de volta em uma instância de `Organization`, via `Organization.reconstitute()` (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 8`, ENS-0001) — sem validação, sem eventos, mesma regra já vigente para o Aggregate (`toDomain()`).
- Traduzir tipos de domínio (`UniqueEntityId`, union type de `status`) para tipos primitivos de persistência (string) e vice-versa.

**Nunca poderá**:
- Validar regra de negócio — validação é exclusiva de `Organization.create()`/métodos de mutação (`AGGREGATE_IMPLEMENTATION_STANDARD.md §§ 3-4`).
- Disparar Domain Events.
- Decidir um valor não fornecido pelos dados de origem (ex.: um `status` inicial ausente) — isso seria inventar uma decisão de domínio dentro de uma camada de tradução.
- Persistir ou consultar diretamente — isso é responsabilidade do `Repository` (§ 17); `Mapper` é uma função pura de tradução, sem I/O.
- Expor, em sua assinatura pública, qualquer tipo específico de tecnologia (Prisma, SQL) — o `Mapper` vive na Infrastructure Layer (`ENGINEERING_PLAYBOOK.md § 5`), mas a Domain Layer nunca depende dele.

## 17. Responsabilidades do Repository

**Poderá**:
- Orquestrar chamadas ao `Mapper` e ao mecanismo de persistência real, implementando exclusivamente o contrato já congelado (`findById`, `findAll`, `exists`, `save`, `delete` — `organization-repository.ts`, ENG-0003.9).
- Traduzir falha de infraestrutura em `InfrastructureError` (`Result` pattern, já parte do contrato).

**Nunca poderá**:
- Validar regra de negócio do Aggregate.
- Expor um registro de persistência bruto fora de si mesmo — todo retorno público é `Organization` ou `Result<Organization, InfrastructureError>`/`Result<Option<Organization>, InfrastructureError>`, nunca um tipo de tecnologia específica.
- Adicionar método de conveniência não presente no contrato já congelado (`OrganizationRepository`, ENG-0003.9) sem uma nova ordem de missão — mesma restrição já registrada em `organization-repository.ts` ("acrescentar um método agora seria antecipar uma decisão de infraestrutura").

## 18. Fora do Escopo

Consolidado das seções acima, cada item citando sua fonte de bloqueio:

- Natureza de `Plan` (Value Object vs. Aggregate próprio) — `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16`.
- Natureza de `Subscription` além do domínio dono já resolvido — `DEC-ORG-003`.
- `Billing` (`billingStatus`, `trialEnd`) — campos do `ORGANIZATION_TECHNICAL_BLUEPRINT.md § 3`, não implementados no Aggregate real (ENG-0003.7).
- `Workspace`, `Team` — candidatos a Aggregate Root próprio (`DEC-ORG-002`, `DEC-ORG-004`), sem Object Specification, sem contrato de persistência próprio.
- Tabela completa de transições de `status` — § 6.
- Value Objects reais (`Slug`, `Document`, `Address`, `BrandingTheme`) — todos bloqueados, ENG-0003.8.
- `Branding` — campo não implementado no Aggregate atual, § 8.
- `maxUsers`, `maxStorage`, `storageUsed`, `featureFlags`, `settings` — excluídos do Aggregate atual, ENG-0003.7.
- Mecanismo real de auditoria (RN006) — § 14.
- Versionamento / optimistic locking — § 13.
- Qualquer tecnologia de banco, ORM, Migration ou Schema real — § 2.

## 19. Critérios para Futura Implementação

Checklist obrigatório para `ENG-0003.11` (Organization Prisma Repository) e toda missão seguinte de persistência:

- [ ] Seguir este documento literalmente — nenhum campo além dos listados em § 4 pode ser persistido sem nova decisão/ADR.
- [ ] Nenhuma regra de negócio nova inventada durante a implementação (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 4`, ENS-0001).
- [ ] `Mapper` implementado como função/classe pura, sem I/O, seguindo §§ 15-16.
- [ ] `Repository` concreto implementa exclusivamente o contrato já congelado (`OrganizationRepository`, ENG-0003.9) — nenhum método novo sem nova ordem de missão.
- [ ] Nenhum item de § 18 (Fora de Escopo) implementado ou presumido.
- [ ] Multi-tenancy: `Organization` é a própria raiz de referência (RN001) — nenhum escopo de tenant é inventado sobre a Organization em si.
- [ ] Self Review + DMV + ACR + ARG produzidos (`ARCHITECTURE_REVIEW_GATE_STANDARD.md`, ENS-0002) — mesmo padrão de toda missão `ENG-` de implementação.
- [ ] Qualquer divergência deste documento exige ADR (§ 20).

## 20. Declaração Formal

A partir desta missão, este documento é **vinculante** para toda implementação futura de persistência do Aggregate `Organization`: Prisma Schema, Mapper, Prisma Repository, Migrations, Queries, Tests. Nenhuma implementação pode divergir dos campos de § 4, das restrições de §§ 5, 9, 12, ou da separação de responsabilidades de §§ 16-17, nem introduzir qualquer item listado em § 18, sem uma ADR explícita. Mudar este documento em si (não uma implementação concreta que o segue) também exige ADR — mesmo padrão já vigente para o Freeze (`ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 17`) e o Blueprint técnico.

---

## Relação com Outros Módulos

- [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md) (ENG-0003.5) — base congelada de todo campo mapeado aqui
- [ORGANIZATION_TECHNICAL_BLUEPRINT.md](ORGANIZATION_TECHNICAL_BLUEPRINT.md) (ENG-0003.6) — assinaturas técnicas do Aggregate, fonte dos campos excluídos (§ 2, § 18)
- [ORGANIZATION_DOMAIN_DECISIONS.md](ORGANIZATION_DOMAIN_DECISIONS.md) (ENG-0003.4) — `DEC-ORG-002/003/004`, fonte de § 3, § 10, § 18
- [ADR-ORG-001](../../../adr/ADR-ORG-001-organization-status-strategy.md) — fonte de `OrganizationStatus`, § 6
- [src/domain/aggregates/organization/organization.ts](src/domain/aggregates/organization/organization.ts) (ENG-0003.7) — implementação real da qual todo campo de § 4 foi extraído
- [src/domain/repositories/organization-repository.ts](src/domain/repositories/organization-repository.ts) (ENG-0003.9) — contrato de Repository referenciado em § 17
- [knowledge/engineering/ENGINEERING_PLAYBOOK.md § 5](../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md) — Infrastructure Layer, Persistence via Prisma (`ADR-0005`), citado e deliberadamente não incorporado ao contrato (§ 2)
- [knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) — `reconstitute()` (§ 16), multi-tenancy (§ 19)

## Status

🟢 Blueprint de persistência concluído (Missão ENG-0003.10.5). Nenhum código, Prisma Schema, Migration, Mapper ou Repository concreto implementado. Nenhum documento existente alterado, conforme escopo explícito desta ordem de missão. Aguardando aprovação formal do CTO antes de `ENG-0003.11 — Organization Prisma Repository`.
