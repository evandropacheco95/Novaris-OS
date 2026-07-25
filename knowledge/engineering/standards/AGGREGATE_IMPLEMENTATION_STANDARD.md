# Aggregate Implementation Standard

Versão: 1.0.0

Status: 🟢 Oficial — padrão obrigatório, congelado

Missão: ENS-0001 (Aggregate Implementation Standard)

---

## Objetivo

Definir o padrão único e obrigatório de implementação de Aggregates para **todos** os domínios da NOVARIS — não só Identity. Consolida boas práticas de DDD já compatíveis com a arquitetura aprovada: [ENGINEERING_PLAYBOOK.md](../ENGINEERING_PLAYBOOK.md) (Clean Architecture, camadas), [packages/shared-kernel/](../../../packages/shared-kernel/README.md) (`AggregateRoot<T>`, `Entity<T>`, `ValueObject<T>`, `DomainEvent`, `Result`), e o primeiro caso real trabalhado até o nível de design — [IDENTITY_TECHNICAL_BLUEPRINT.md](../../../services/kernel/identity/IDENTITY_TECHNICAL_BLUEPRINT.md) / [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](../../../services/kernel/identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md).

**Nenhuma regra de negócio nova aqui** — este documento é sobre **como** implementar um Aggregate (estrutura, convenções), nunca sobre qual regra de negócio um Aggregate específico deve ter (isso é modelagem de domínio, feita missão a missão, por domínio).

---

## 1. Estrutura Interna do Aggregate

- Toda classe de Aggregate `extends AggregateRoot<TProps>` de `@novaris/shared-kernel` — nunca reimplementa identidade, igualdade ou coleção de Domain Events.
- `TProps` é uma `interface` própria do Aggregate (`<Nome>Props`), nunca reaproveitada entre Aggregates diferentes.
- Estado interno só é acessível via `this.props` (herdado de `Entity<T>`) — nunca campos soltos na classe além do que `Entity`/`AggregateRoot` já provêm.
- Exposição de estado para o exterior é só leitura: getters (`get status(): UserStatus`), nunca setters públicos.
- Mutação de estado só acontece através de métodos nomeados com significado de domínio (`activate()`, `assignRole()`) — nunca `set status(...)` genérico.

## 2. Convenções de Construtores

- O construtor é sempre `protected` ou `private` — nunca público. Instanciar um Aggregate de fora da própria classe só é possível via Factory Method (§ 3).
- Assinatura fixa: `constructor(props: TProps, id?: UniqueEntityId)`, delegando com `super(props, id)`.
- O construtor **não valida nada** — validação é responsabilidade exclusiva do Factory Method que o chama. Um construtor que já recebeu `props` bem formado só monta o objeto.

## 3. Factory Methods

- `static create(input: TCreateInput): Result<TAggregate, DomainError>` — único ponto de entrada para criar uma instância nova. Valida todas as invariantes de criação (§ 4), monta `TProps`, chama o construtor, e **dispara o(s) Domain Event(s) de criação** (`addDomainEvent`) antes de retornar.
- Nunca lança exceção — retorna `Result.fail(new ValidationError(...))` ou `Result.fail(new BusinessRuleError(...))` quando uma invariante falha, `Result.ok(instance)` em caso de sucesso. Mesma disciplina de `Permission.create`/`Email.create` (ENG-0002.3).
- `reconstitute()` é um Factory Method **separado** (§ 8) — nunca reaproveita `create()`.

## 4. Invariantes

- Toda invariante do Aggregate é verificada em dois lugares: dentro de `create()` (§ 3) e dentro de cada método de mutação que possa violá-la — nunca só na criação.
- Uma invariante violada nunca lança exceção — devolve `Result.fail` com o erro de domínio apropriado (`ValidationError` para formato, `BusinessRuleError` para regra de negócio, `ConflictError` para estado conflitante — hierarquia do Shared Kernel, ENG-0001.4).
- Toda invariante deve ter fonte documentada (Blueprint do domínio, Object Specification, ou regra explícita já registrada) — nunca inventada durante a implementação. Ver `IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 6` como exemplo de como registrar invariantes citadas vs. propostas vs. `requer decisão`.

## 5. Domain Events

- Toda transição de estado relevante para o resto do sistema dispara um Domain Event via `this.addDomainEvent(...)` — nunca é publicado pelo próprio Aggregate (publicação é responsabilidade da Application/Infrastructure Layer, via Event Bus).
- Nome do evento: `<Aggregate><AçãoNoPassado>` (`UserActivated`, `RoleCreated`) — convenção já em uso (`BOM.md`, `ENGINEERING_PLAYBOOK.md § 16`).
- Todo evento implementa o contrato `DomainEvent` do Shared Kernel: `eventId`, `aggregateId`, `occurredAt`, `eventName` (ENG-0001.5).
- `reconstitute()` (§ 8) nunca dispara eventos — carregar um Aggregate existente não é um acontecimento de negócio novo.

## 6. Auditoria

- Todo Aggregate que participa de fluxo administrado por humanos implementa `Auditable` (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`) do Shared Kernel (ENG-0001.9) — nem todo Aggregate precisa (ver `IDENTITY_TECHNICAL_BLUEPRINT.md § 1`: `Role` implementa, mas sem `HasMetadata`, porque nenhuma fonte associa metadados a ele).
- `createdBy`/`updatedBy` são sempre fornecidos pela Application Layer (quem está executando a operação) — o Aggregate nunca infere "usuário atual" sozinho, isso acopraria Domain Layer a um mecanismo de sessão/autenticação.
- `updatedAt` e `version` (`Versionable`, ENG-0001.9) são atualizados a cada método de mutação bem-sucedido — nunca manualmente pelo chamador.

## 7. Multi-tenancy

- Todo `TProps` de um Aggregate que representa dado de negócio inclui `organizationId: UniqueEntityId` — decorre da regra já estabelecida em `objects/Organization.md` ("toda informação pertence obrigatoriamente a uma Organization"), confirmada estruturalmente em `IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 4`.
- Um Aggregate nunca referencia (por id) um objeto de outra Organization — regra explícita desde `IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 9` (`User.roleIds` só referencia `Role`s da mesma Organization), generalizada aqui para todo domínio.
- A responsabilidade de nunca vazar dado entre Organizations é em camadas: RLS no banco (`DATABASE_ARCHITECTURE.md`) como última barreira, mas a Application Layer e o Repository já devem escopar toda consulta por `organizationId` — RLS não substitui esse cuidado, é um backstop.

## 8. Reconstituição

- `static reconstitute(props: TProps, id: UniqueEntityId): TAggregate` — usado exclusivamente pela implementação concreta de Repository (Infrastructure Layer) para recriar um Aggregate a partir de dados já persistidos.
- Não roda a validação de `create()` — dado já persistido é assumido válido; revalidar a cada carregamento seria redundante e quebraria dados legados se uma regra mudar.
- Não dispara Domain Events — carregar não é um evento de negócio novo (§ 5).
- Continua com tipagem estrita (TypeScript `strict`) — a ausência de validação de regra de negócio não significa ausência de tipagem correta.

## 9. Organização de Diretórios

Segue [ENGINEERING_PLAYBOOK.md § 2](../ENGINEERING_PLAYBOOK.md#2-estrutura-obrigatória-dos-serviços) — Aggregates vivem em `src/domain/aggregates/<nome-em-kebab-case>/`, mesmo nível de `src/domain/value-objects/` (já em uso, ENG-0002.3):

```
<serviço>/
├── src/
│   └── domain/
│       ├── aggregates/
│       │   └── <nome>/
│       │       └── <nome>.ts
│       └── value-objects/
│           └── ...
└── tests/
    └── domain/
        └── aggregates/
            └── <nome>/
                └── <nome>.test.ts
```

`tests/` espelha `src/`, nunca colocado junto ao código-fonte — mesma convenção já fixada para serviços em `services/kernel/<modulo>/` (distinta do padrão usado em `packages/shared-kernel/`, que é pacote, não serviço).

## 10. Convenções de Nomenclatura

- Classe do Aggregate: `PascalCase`, substantivo singular, exatamente o termo já oficial na Linguagem Ubíqua do domínio (`User`, nunca `UserAggregate` — nenhum sufixo).
- Arquivo: `kebab-case.ts` igual ao nome da classe em minúsculas (`user.ts`).
- Interface de Props: `<Aggregate>Props`.
- Factory Methods: nomes fixos `create`/`reconstitute` — nunca sinônimos (`build`, `make`, `from`).
- Domain Events: `<Aggregate><AçãoNoPassado>` (§ 5).
- Getters: mesmo nome do campo em `props`, sem prefixo `get` no nome da propriedade (a sintaxe de getter do TypeScript já expressa isso).

## 11. Checklist Obrigatório para Revisão

- [ ] Estende `AggregateRoot<TProps>` do Shared Kernel
- [ ] Construtor `protected`/`private`, sem validação
- [ ] `static create()` retornando `Result<T, DomainError>`, nunca lança exceção
- [ ] `static reconstitute()` separado, sem validação e sem Domain Events
- [ ] Toda invariante verificada em `create()` **e** em cada método de mutação relevante
- [ ] `organizationId` presente no Props (quando o Aggregate representa dado de negócio)
- [ ] Nenhuma referência embutida a outro Aggregate — só `UniqueEntityId`
- [ ] Nenhuma referência cross-Organization
- [ ] Domain Events nomeados `<Aggregate><AçãoNoPassado>`, implementando `DomainEvent`
- [ ] `Auditable`/`Versionable` implementados quando aplicável; `createdBy`/`updatedBy` vêm da Application Layer
- [ ] Nenhum setter público — mutação só via métodos nomeados
- [ ] Localização em `src/domain/aggregates/<nome>/`; testes espelhados em `tests/domain/aggregates/<nome>/`
- [ ] Testes cobrem: criação válida, cada invariante violada, reconstituição, cada método de mutação, geração correta de cada Domain Event

## 12. Exemplos Conceituais (sem código de produção)

Exemplo deliberadamente genérico (`ExampleAggregate`, não um Aggregate real de nenhum domínio) — só para ilustrar a forma, não para introduzir regra de negócio nova:

```
class ExampleAggregate extends AggregateRoot<ExampleAggregateProps> {
  private constructor(props: ExampleAggregateProps, id?: UniqueEntityId) {
    super(props, id)
  }

  static create(input: CreateExampleInput): Result<ExampleAggregate, DomainError> {
    // valida invariantes de criação
    // se inválido: Result.fail(new ValidationError(...))
    // monta props, cria instância
    // instance.addDomainEvent(<evento de criação>)
    // Result.ok(instance)
  }

  static reconstitute(props: ExampleAggregateProps, id: UniqueEntityId): ExampleAggregate {
    // sem validação, sem eventos
    return new ExampleAggregate(props, id)
  }

  someBehavior(input: SomeInput): Result<void, DomainError> {
    // verifica invariante relevante
    // se inválido: Result.fail(new BusinessRuleError(...))
    // muta props internamente
    // this.addDomainEvent(<evento da ação>)
    // Result.ok(undefined)
  }

  get someField(): SomeType {
    return this.props.someField
  }
}
```

**Consistência retroativa confirmada**: o desenho de `User`/`Role` já congelado em `IDENTITY_AGGREGATE_DESIGN_FREEZE.md` segue este padrão em tudo — nenhuma mudança foi necessária nele para se adequar a este Standard (ver Domain Model Validation da Missão ENS-0001).

---

## Vigência

A partir desta missão, **todo** Aggregate implementado em qualquer domínio da NOVARIS segue este Standard. Mudar este Standard (não uma implementação específica de Aggregate) exige ADR.

## Relação com Outros Módulos

- [ENGINEERING_PLAYBOOK.md § 2-3](../ENGINEERING_PLAYBOOK.md) — estrutura de serviço e Domain Layer, base deste Standard
- [packages/shared-kernel/](../../../packages/shared-kernel/README.md) — `AggregateRoot<T>`, `Entity<T>`, `ValueObject<T>`, `DomainEvent`, `Result`, hierarquia de erros
- [services/kernel/identity/IDENTITY_TECHNICAL_BLUEPRINT.md](../../../services/kernel/identity/IDENTITY_TECHNICAL_BLUEPRINT.md), [IDENTITY_AGGREGATE_DESIGN_FREEZE.md](../../../services/kernel/identity/IDENTITY_AGGREGATE_DESIGN_FREEZE.md) — primeiro caso de design trabalhado até este nível de detalhe, usado para validar este Standard
- [architecture/ADM/ARCHITECTURE_DECISION_MATRIX.md](../../../architecture/ADM/ARCHITECTURE_DECISION_MATRIX.md) — índice executivo, referenciará este Standard

## Status

🟢 Oficial (v1.0.0), padrão obrigatório e congelado (Missão ENS-0001). Nenhum código implementado, nenhuma regra de negócio nova, nenhuma decisão arquitetural conflitante — consolidação de práticas já em uso.
