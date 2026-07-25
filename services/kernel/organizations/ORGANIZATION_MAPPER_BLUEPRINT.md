# Organization — Mapper Blueprint

Versão: 1.0.0

Status: 🟢 Oficial — contrato conceitual do Mapper, sem tecnologia definida, sem implementação

Missão: ENG-0003.11 (Organization Mapper Blueprint) — EPIC-003

Escopo: detalhar, sobre a base já congelada em [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md) (ENG-0003.5), [ORGANIZATION_TECHNICAL_BLUEPRINT.md](ORGANIZATION_TECHNICAL_BLUEPRINT.md) (ENG-0003.6) e [ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md](ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md) (ENG-0003.10.5), especificamente o papel, as responsabilidades e o fluxo conceitual do **Mapper** do Aggregate `Organization` — o componente que traduz entre a representação em memória do Aggregate e um registro de persistência. Nenhum código, Mapper real, Repository concreto, Prisma Schema, teste ou Value Object foi criado nesta missão. Nenhuma das 12 missões anteriores do EPIC-003 (ENG-0003.1 a ENG-0003.10.5) foi alterada ou reaberta. Identity Domain consultado só como referência estrutural — confirmado que não existe Mapper implementado nem documentado lá ainda; nenhum conteúdo copiado.

**Regra de método**: todo fluxo, responsabilidade ou restrição abaixo deriva exclusivamente do que já está congelado em `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md`, do código real de `organization.ts` (ENG-0003.7), do contrato já congelado de `organization-repository.ts` (ENG-0003.9), e do contrato de campos já definido em `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md § 4`. Onde nenhuma dessas fontes decide algo, a seção correspondente é marcada **BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO** — nunca preenchida por inferência.

---

## 1. Objetivo

Definir como um Aggregate `Organization` será convertido para persistência e reconstruído a partir da persistência — o papel do Mapper como tradutor puro entre as duas representações — sem definir tecnologia, sem escolher ORM ou banco, sem código real. Este documento passa a ser **obrigatório** para toda implementação futura de Prisma Mapper, Repository, Queries e Infrastructure do Organization Domain (a partir de `ENG-0003.12`).

## 2. Escopo

**Pertence ao Mapper**: tradução pura entre `OrganizationProps` (+ `id`) e um registro de persistência abstrato, nas duas direções, preservando exatamente os campos já definidos em `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md § 4`; reconstrução de `Organization` exclusivamente via `reconstitute()` (§ 13); extração de dados persistíveis via os getters públicos já existentes em `organization.ts`.

**Não pertence ao Mapper**: nenhuma tecnologia (Prisma, SQL, ORM); consulta a banco de dados (isso é `Repository`, § 15); validação de regra de negócio (isso é o próprio Aggregate, § 16); decisão de qualquer valor não presente nos dados de origem; reconstrução ou tradução de Value Objects reais (bloqueados, § 10); qualquer campo fora do já congelado em `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md § 4`.

## 3. Papel do Mapper

Tradutor puro, sem estado próprio, sem I/O:

```
Aggregate (Organization — instância em memória)
  ↓ toPersistence
Persistência (registro — forma/tecnologia não definida)
  ↓ toDomain
Aggregate (Organization — reconstruído via reconstitute())
```

Jamais contém regra de negócio — toda regra já vive em `Organization.create()`/métodos de mutação (`AGGREGATE_IMPLEMENTATION_STANDARD.md §§ 3-4`, ENS-0001). O Mapper não decide nada; só traduz um valor já existente de uma representação para outra.

## 4. Responsabilidades

**Poderá**:
- Reconstruir o Aggregate a partir de um registro de persistência.
- Extrair dados persistíveis de uma instância de `Organization` já existente, via seus getters públicos.
- Reconstruir Value Objects **quando existirem** — hoje nenhum existe (§ 10).
- Preservar identidade — o mesmo `id` (`UniqueEntityId`) em toda reconstrução, nunca um novo.

**Jamais poderá**:
- Validar regras de negócio.
- Consultar banco de dados diretamente.
- Decidir estados — nenhum valor de `status` (ou qualquer outro campo) é inferido, defaultado ou corrigido pelo Mapper.
- Emitir Domain Events.
- Executar qualquer lógica de domínio.

## 5. Fluxo Aggregate → Persistência

Conceitual, sem código:

1. O `Repository` chama o Mapper para converter uma instância de `Organization` em um registro persistível.
2. O Mapper lê cada campo exclusivamente via os getters públicos já existentes (`id`, `slug`, `name`, `legalName`, `document`, `address`, `status`, `metadata`, `createdAt`, `updatedAt`, `deletedAt`) — nunca acessa `props` diretamente, que é privado ao Aggregate (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 1`, ENS-0001).
3. O Mapper produz um registro plano, com os mesmos campos e a mesma obrigatoriedade/nulidade já definidos em `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md § 4` — nenhuma transformação além de tipo primitivo (ex.: `UniqueEntityId` → string).
4. O `Repository` entrega esse registro ao mecanismo de persistência real — tecnologia não definida por este documento.

## 6. Fluxo Persistência → Aggregate

1. O `Repository` obtém um registro bruto do mecanismo de persistência real.
2. O `Repository` chama o Mapper para converter esse registro numa instância de `Organization`.
3. O Mapper monta um `OrganizationProps` a partir do registro, traduzindo tipos primitivos de volta para tipos de domínio (string → `UniqueEntityId` para `id`; string já restrita ao tipo `OrganizationStatus` para `status`).
4. O Mapper chama `Organization.reconstitute(props, id)` — nunca o construtor diretamente (§ 13) — devolvendo a instância ao `Repository`.
5. Nenhuma validação, nenhum evento — `reconstitute()` não valida nem dispara Domain Events (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 8`, ENS-0001), e o Mapper não adiciona nenhuma checagem própria por cima disso.

## 7. Campos Obrigatórios

Todo campo marcado "Obrigatório: Sim" em `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md § 4` (`id`, `slug`, `name`, `legalName`, `document`, `address`, `status`, `metadata`, `createdAt`, `updatedAt`) deve estar presente no registro de persistência em ambas as direções — o Mapper nunca constrói um `Organization` com um desses campos ausente, e nunca escreve um registro de persistência que os omita. Se o registro de origem não contiver um desses campos, isso é uma falha de integridade de dados, não uma decisão que o Mapper deva resolver sozinho (§ 14).

## 8. Campos Opcionais

`deletedAt` (`Date | undefined`) e `address.complement` (`string | undefined`) são os únicos campos opcionais do Aggregate hoje (`ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md § 9`). O Mapper preserva a ausência: `undefined` no domínio corresponde a nulo/ausente em persistência, e vice-versa — **nunca substituído por um default inventado** (nunca gera `deletedAt` como a data atual, nunca gera `complement` como string vazia). `metadata` sempre existe como objeto (possivelmente vazio, `{}`) — nunca tratado como opcional, mesmo quando seu conteúdo interno está vazio.

## 9. Identity Mapping

- **`OrganizationId`** — representado pelo `UniqueEntityId` do Aggregate. O Mapper preserva o mesmo `id` em toda reconstrução, nunca gera um novo (o valor já persistido é usado para construir o `UniqueEntityId`, nunca criado sem argumento — o que geraria um id novo via `node:crypto`, ENG-0001.2).
- **`Slug`** — campo `string` simples hoje; não há Value Object `Slug` para reconstruir (§ 10). O Mapper trata como string primitiva.
- **`Document`** — mesma situação: string primitiva, sem Value Object.

Relacionado ao estado atual do domínio: `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 4, 7` já registraram que nem `slug` nem `document` são Value Objects reais hoje. Este documento não muda isso — só reforça a implicação direta para o Mapper: nenhuma etapa de "reconstruir `Slug`"/"reconstruir `Document`" existe ainda.

## 10. Value Objects

`Slug`, `Document`, `Address`, `BrandingTheme` **permanecem bloqueados** — nenhum tem validação ou forma definida por nenhuma fonte oficial (ENG-0003.8). O Mapper, tal como descrito neste documento, não reconstrói nenhum Value Object real: trata `address` como objeto composto simples (`OrganizationAddress`, uma interface, não uma classe `ValueObject`), e `slug`/`document` como strings primitivas.

**Nenhuma estratégia fictícia de reconstrução de Value Object é inventada aqui.** Quando (e se) esses Value Objects forem implementados numa missão futura, condicionada à sua definição existir, este documento precisará ser revisado (§ 17) para incluir a etapa de reconstrução via `VO.create()` (ou equivalente) — não antecipado agora.

## 11. Status

`OrganizationStatus` é persistido e reconstruído como string simples, restrita aos 5 valores definitivos de [ADR-ORG-001 § 4](../../../adr/ADR-ORG-001-organization-status-strategy.md): `"active"`, `"suspended"`, `"trial"`, `"blocked"`, `"archived"`. O Mapper **nunca decide** um valor de `status` ausente ou inválido — se o registro de origem tiver um valor fora dos 5, isso é dado inválido (§ 14), não uma decisão do Mapper resolver com um default.

A tabela de transições (`ADR-ORG-001 § 13`) e o valor inicial na criação (`ADR-ORG-001 § 10`) permanecem não definidos — irrelevantes ao papel do Mapper, que só traduz o valor já existente, nunca decide uma transição.

## 12. Domain Events

Domain Events **não participam da persistência** do Aggregate — já confirmado em `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md § 5` ("nunca uma coluna/campo persistido"). O Mapper nunca lê nem escreve `domainEvents`; `reconstitute()` (usado pelo Mapper, § 13) nunca dispara eventos (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 8`, ENS-0001) — carregar um Aggregate existente não é um acontecimento de negócio novo. Publicação de eventos (quando existir Event Bus) é responsabilidade de Application/Infrastructure Layer sobre uma instância já criada via `create()`, nunca do Mapper.

## 13. Aggregate Reconstruction

Toda reconstrução de `Organization` a partir de dados persistidos deve usar **exclusivamente** `Organization.reconstitute(props, id)` — o único Factory Method autorizado para esse fim (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 8`, ENS-0001). O construtor de `Organization` é `private` (`organization.ts`) — tecnicamente inacessível fora da própria classe, portanto já impossível de qualquer forma para o Mapper instanciar diretamente; este documento reforça essa barreira já existente como regra explícita do papel do Mapper, sem introduzir uma restrição nova.

## 14. Tratamento de Dados Inválidos

O Mapper **não corrige dados** e **não toma decisão** diante de um registro malformado ou incompleto — validar regra de negócio não é sua responsabilidade (§ 4). Se um registro de persistência não contiver um campo obrigatório (§ 7), tiver um `status` fora dos 5 valores válidos (§ 11), ou qualquer outra inconsistência, o tratamento dessa falha é responsabilidade do `Repository`, nunca do Mapper.

**BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO**: o mecanismo exato desse tratamento (lançar como `InfrastructureError`? devolver `Result.fail`? outro tipo de erro?) não é definido por nenhuma fonte para esse cenário específico de dado corrompido — não inventado aqui.

## 15. Relação com Repository

**`Repository` coordena**: chama o Mapper (`toPersistence()`/`toDomain()`), orquestra a chamada ao mecanismo de persistência real, implementa exclusivamente o contrato já congelado (`findById`, `findAll`, `exists`, `save`, `delete` — `organization-repository.ts`, ENG-0003.9), traduz falha de infraestrutura em `InfrastructureError`.

**Mapper traduz**: só converte entre as duas representações, sem I/O, sem decisão.

Mesma separação já definida em `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md §§ 16-17` — este documento não a contradiz, detalha especificamente o lado do Mapper.

## 16. Relação com Aggregate

O Aggregate continua soberano — toda invariante de negócio já validada em `create()`/métodos de mutação permanece intacta; `reconstitute()` não revalida porque dado já persistido é assumido válido (`AGGREGATE_IMPLEMENTATION_STANDARD.md § 8`), não porque o Mapper tenha qualquer autoridade para alterar ou relaxar uma invariante.

O Mapper **nunca altera um valor durante a tradução** (nunca normaliza um `slug`, nunca trunca um campo, nunca ajusta formatação) — qualquer transformação de valor seria uma decisão de domínio disfarçada de tradução técnica, proibida pela mesma disciplina já aplicada a toda esta cadeia de missões: nunca inventar regra de negócio.

## 17. Futura Implementação

Checklist obrigatório para `ENG-0003.12` e toda missão seguinte de Mapper/Repository/Infrastructure:

- [ ] Seguir literalmente `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md § 4` (campos) e este documento (fluxo/responsabilidades).
- [ ] `toDomain()` usa exclusivamente `Organization.reconstitute()` — nunca o construtor, nunca `create()`.
- [ ] Nenhuma validação de regra de negócio implementada dentro do Mapper.
- [ ] Nenhum Value Object real reconstruído até que `Slug`/`Document`/`Address`/`BrandingTheme` sejam implementados (bloqueado, ENG-0003.8) — quando implementados, revisar este documento antes de estender o Mapper.
- [ ] Identidade (`id`) sempre preservada — nunca gerado um novo `UniqueEntityId` durante `toDomain()`.
- [ ] Nenhum campo além dos já listados em `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md § 4` é lido ou escrito.
- [ ] Tratamento de dado inválido (§ 14) implementado de acordo com decisão explícita futura — não inventado durante a implementação do Mapper.
- [ ] Self Review + DMV + ACR + ARG produzidos (`ARCHITECTURE_REVIEW_GATE_STANDARD.md`, ENS-0002), mesmo padrão de toda missão `ENG-` de implementação.
- [ ] Qualquer divergência deste documento exige ADR (§ 19).

## 18. Fora do Escopo

- Prisma, ORM, SQL, Migration, Queries, Infrastructure, Caching, Transactions — nenhuma tecnologia ou mecanismo de execução real definido aqui (§ 2).
- Value Objects reais — `Slug`, `Document`, `Address`, `BrandingTheme` continuam bloqueados (ENG-0003.8, § 10).
- `Workspace`, `Subscription`, `Billing`, `Team` — candidatos a Aggregate/objeto próprio, sem Object Specification, sem Freeze, sem contrato de persistência (`DEC-ORG-002/003/004`, `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md § 18`).

## 19. Declaração Formal

A partir desta missão, este documento é **vinculante** para toda implementação futura de Mapper, Repository concreto, Queries e Infrastructure do Organization Domain. Nenhuma implementação pode divergir do fluxo de §§ 5-6, das responsabilidades de § 4, da regra de reconstrução exclusiva via `reconstitute()` (§ 13), ou introduzir qualquer item de § 18, sem uma ADR explícita. Mudar este documento em si (não uma implementação concreta que o segue) também exige ADR — mesmo padrão já vigente para o Freeze, o Blueprint técnico e o Persistence Mapping Blueprint.

---

## Relação com Outros Módulos

- [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md) (ENG-0003.5) — base congelada do Aggregate traduzido por este Mapper
- [ORGANIZATION_TECHNICAL_BLUEPRINT.md](ORGANIZATION_TECHNICAL_BLUEPRINT.md) (ENG-0003.6) — assinaturas técnicas do Aggregate, incluindo `reconstitute()` (§ 13)
- [ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md](ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md) (ENG-0003.10.5) — contrato de campos (§§ 4-12), base direta de §§ 7-11 deste documento
- [ADR-ORG-001](../../../adr/ADR-ORG-001-organization-status-strategy.md) — fonte de `OrganizationStatus`, § 11
- [src/domain/aggregates/organization/organization.ts](src/domain/aggregates/organization/organization.ts) (ENG-0003.7) — implementação real, fonte dos getters usados em § 5 e do construtor `private`/`reconstitute()` citados em § 13
- [src/domain/repositories/organization-repository.ts](src/domain/repositories/organization-repository.ts) (ENG-0003.9) — contrato de Repository referenciado em § 15
- [knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) — §§ 1, 3-4, 8, fonte de §§ 3, 5, 13, 16

## Status

🟢 Blueprint do Mapper concluído (Missão ENG-0003.11). Nenhum código, Mapper, Repository concreto ou Prisma Schema implementado. Nenhum documento existente alterado, conforme escopo explícito desta ordem de missão. Aguardando aprovação formal do CTO antes de `ENG-0003.12`.
