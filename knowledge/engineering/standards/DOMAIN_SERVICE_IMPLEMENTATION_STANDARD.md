# Domain Service Implementation Standard

Versão: 1.0.0

Status: 🟢 Oficial — padrão obrigatório, congelado

Missão: ENS-0003 (Domain Service Implementation Standard)

---

## 1. Objetivo

Definir o padrão único e obrigatório de implementação de Domain Services para **todos** os domínios da NOVARIS — não só Identity. Consolida a mesma disciplina já aplicada aos Aggregates ([AGGREGATE_IMPLEMENTATION_STANDARD.md](AGGREGATE_IMPLEMENTATION_STANDARD.md), ENS-0001) e ao processo de revisão ([ARCHITECTURE_REVIEW_GATE_STANDARD.md](ARCHITECTURE_REVIEW_GATE_STANDARD.md), ENS-0002), aplicada agora à camada de Domain Service.

**Este documento é inteiramente genérico.** Identity é citado como **domínio de referência** — os 3 Domain Services já identificados e congelados em [DOMAIN_SERVICE_IDENTIFICATION.md](../../../services/kernel/identity/DOMAIN_SERVICE_IDENTIFICATION.md) (`AuthenticationDomainService`, `AuthorizationDomainService`, `RoleAssignmentDomainService`) ilustram as regras abaixo, mas nenhuma delas depende de `User`, `Role`, `Permission` ou de qualquer conceito do Identity Domain. **Nenhum Domain Service é implementado nesta missão.**

## 2. Quando um Domain Service Pode Existir

Critérios oficiais, **congelados em [DOMAIN_SERVICE_IDENTIFICATION.md § 2](../../../services/kernel/identity/DOMAIN_SERVICE_IDENTIFICATION.md) (Missão ENG-0002.10A)**, reproduzidos aqui exatamente, sem alteração, como parte da vigência deste Standard:

Um Domain Service só pode existir se pelo menos **um** dos critérios abaixo for verdadeiro:

- ✔ envolve mais de um Aggregate; **OU**
- ✔ depende de Repository; **OU**
- ✔ depende de uma consulta que o Aggregate não pode realizar sozinho (ex.: buscar por um campo que não é o próprio id, ou verificar unicidade entre instâncias irmãs); **OU**
- ✔ exige colaboração entre múltiplos objetos do domínio.

Consistente com a definição já usada em [ENGINEERING_PLAYBOOK.md § 3](../ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer): "Domain Services: lógica de domínio que não pertence naturalmente a uma única Entity."

## 3. Quando um Domain Service NÃO Pode Existir

Caso nenhum dos 4 critérios do § 2 se aplique, a regra **permanece obrigatoriamente no Aggregate** (ou no Value Object, quando for regra de formato/valor). É expressamente proibido criar Domain Service para:

- validações simples de formato ou valor (pertencem ao Value Object, ex.: `Permission.create()`);
- setters (proibidos por padrão em qualquer Aggregate, ENS-0001 § 1 — um Domain Service não é uma forma indireta de reintroduzir um setter);
- formatação ou conversão de dados;
- regras internas de um único Aggregate, mesmo que envolvam múltiplos campos desse mesmo Aggregate;
- qualquer comportamento que já pertença naturalmente a um Aggregate, só porque "parece mais organizado" extraí-lo;
- conveniência técnica — um wrapper fino sobre um método de Repository (ex.: `execute()` que só chama `repository.findById()` e devolve o resultado, sem nenhuma decisão própria) não é Domain Service, é uso direto do Repository pela Application Layer.

## 4. Estrutura Obrigatória

- Toda classe de Domain Service implementa `DomainService<TInput, TOutput>` ou `AsyncDomainService<TInput, TOutput>` de `@novaris/shared-kernel` (ENG-0001.8) — nunca reimplementa essa assinatura.
- Ponto de entrada único: método `execute(input: TInput)`.
- **Sem estado mutável entre chamadas** — cada `execute()` é independente; um Domain Service não guarda dado de uma chamada para influenciar a próxima.
- Dependências (Repository, Specification, Policy, outros Domain Services) são injetadas via construtor — nunca instanciadas dentro de `execute()` (Dependency Inversion, mesma disciplina de todo o Shared Kernel).
- Localização: `src/domain/services/<nome-em-kebab-case>/<nome>.ts`, mesmo nível de `src/domain/aggregates/`, `src/domain/value-objects/`, `src/domain/repositories/` já em uso ([ENGINEERING_PLAYBOOK.md § 2](../ENGINEERING_PLAYBOOK.md#2-estrutura-obrigatória-dos-serviços)):

```
<serviço>/
├── src/
│   └── domain/
│       ├── aggregates/
│       ├── value-objects/
│       ├── repositories/
│       └── services/
│           └── <nome>/
│               └── <nome>.ts
└── tests/
    └── domain/
        └── services/
            └── <nome>/
                └── <nome>.test.ts
```

## 5. Padrão de Nomenclatura

- **Classe**: `PascalCase`, sufixo `DomainService` obrigatório — distingue de um futuro Application Service (`Command`/`Handler`, ver ENGINEERING_PLAYBOOK.md § 4). Ex.: `AuthenticationDomainService`, nunca `Authentication` nem `AuthenticationService`.
- **Arquivo**: `kebab-case.ts` igual ao nome da classe em minúsculas.
- **Tipos de Input/Output**: `<Nome>Input`/`<Nome>Output`, ou reaproveitar diretamente um Aggregate/Value Object já existente como saída, quando fizer sentido (ex.: `AuthenticationDomainService` devolve `User`, não um DTO próprio).
- **Proibido**: sufixos genéricos que não expressam uma capacidade real do domínio — `Manager`, `Helper`, `Util`, `Utility`, `Processor`, `Service` sozinho (sem `Domain`). Ver § "Regras Adicionais" abaixo — este é exatamente o sintoma de um "Utility Service".

## 6. Factory Methods

- **Quando NÃO existem** (caso normal): diferente de um Aggregate (ENS-0001 §§ 2-3), um Domain Service não tem identidade própria, não tem ciclo de vida persistido, e não é reconstituído a partir de dado salvo — portanto **não tem** `create()`/`reconstitute()`. O construtor é público, recebe as dependências diretamente; instanciar é responsabilidade de quem compõe o grafo de dependências (Application Layer ou, futuramente, um container de injeção — `requer decisão`, sem tooling definido ainda).
- **Quando existem** (exceção): um Factory Method estático opcional (ex.: `static withDefaultRules(...)`) **pode** existir apenas quando há uma composição fixa e reaproveitável de dependências (ex.: sempre a mesma cadeia de Specifications combinadas) documentada como um cenário real, não hipotético. Não é obrigatório e não deve ser criado preventivamente.

## 7. Dependências Permitidas

- **Repository** — sempre via contrato (`ReadRepository<T>`/`WriteRepository<T>`/composição própria do domínio, ex.: `UserRepository`), nunca implementação concreta. Ver § 12.
- **Specification** — via `Specification<T>`/`AbstractSpecification<T>` do Shared Kernel. Ver § 13.
- **Policy** — quando existir no domínio (ver § 14; nenhuma Policy foi implementada em nenhum domínio da plataforma até esta missão).
- **Outros componentes do Shared Kernel**: `Result<T,E>`, `Option<T>`, `Either<L,R>`, a hierarquia de erros (`DomainError`/`InfrastructureError` e subclasses), `UniqueEntityId`.
- **Aggregates e Value Objects do próprio domínio** — para ler seu estado e invocar seus métodos públicos.
- **Outro Domain Service do mesmo domínio** (composição) — permitido, mas deve ser justificado explicitamente na documentação do Domain Service que compõe; evitar cadeias profundas (mais de 2 níveis de composição é sinal de desenho a revisar).

## 8. Dependências Proibidas

É proibido a um Domain Service depender de, importar, ou referenciar, direta ou indiretamente:

- NestJS (ou qualquer framework de aplicação);
- Prisma, Supabase, qualquer ORM;
- SQL, MongoDB, Redis, ou qualquer tecnologia de persistência concreta;
- HTTP (request/response, headers, status codes);
- DTOs (formato de entrada/saída da Application Layer — [ENGINEERING_PLAYBOOK.md § 4](../ENGINEERING_PLAYBOOK.md#4-application-layer));
- Controllers;
- qualquer coisa de `infrastructure/`, `interfaces/` ou `application/`.

Mesma regra de direção de dependência já vigente para toda a Domain Layer: "`domain/` nunca importa de `infrastructure/` ou `interfaces/`" ([ENGINEERING_PLAYBOOK.md § 1](../ENGINEERING_PLAYBOOK.md)).

## 9. Result Pattern Obrigatório

Todo `execute()` devolve `DomainServiceResult<T>` (= `Result<T, DomainError | InfrastructureError>`, já definido em `@novaris/shared-kernel`, ENG-0001.8) — **nunca lança exceção de domínio**. Falha por violação de regra de negócio é uma subclasse de `DomainError` (`BusinessRuleError`, `ConflictError` etc., ENG-0001.4); falha por dependência de infraestrutura (ex.: `Repository` não conseguiu ler) chega já embrulhada como `InfrastructureError`, propagada sem reinterpretação. Mesma disciplina já obrigatória para Aggregates (ENS-0001 § 3) e Value Objects (`Permission.create()`, `Email.create()`).

## 10. Uso de `DomainService` ou `AsyncDomainService`

- **`DomainService<TInput, TOutput>`** — usar apenas quando `execute()` é inteiramente síncrono, sem nenhuma chamada a Repository ou qualquer outra dependência assíncrona. Caso raro na prática: como o critério de existência mais comum (§ 2) é "depende de Repository", e todo método de Repository é assíncrono (`Promise`-based, ENG-0001.7), a maioria dos Domain Services reais não se qualifica aqui.
- **`AsyncDomainService<TInput, TOutput>`** — obrigatório sempre que `execute()` chama qualquer método de Repository ou qualquer dependência assíncrona. **Este é o caso esperado para a maioria dos Domain Services da plataforma.**
- Regra prática de decisão: se o Domain Service depende de Repository (o critério de existência mais frequente), ele é `AsyncDomainService`. Só considerar `DomainService` síncrono quando a única justificativa de existência for "colaboração entre múltiplos objetos do domínio" sem nenhum acesso a Repository — cenário incomum, mas não impossível (ex.: uma decisão que só combina o estado de dois Aggregates já carregados em memória por quem chama).

## 11. Regras de Colaboração entre Aggregates

- Um Domain Service pode carregar múltiplos Aggregates (via seus respectivos Repositories), ler seu estado, e invocar métodos de mutação neles.
- Cada Aggregate mutado é salvo através do **seu próprio** Repository — nunca existe um "Repository de domínio" compartilhado entre tipos de Aggregate diferentes.
- Um Domain Service **nunca** muta o estado interno de um Aggregate diretamente (sem passar pelos métodos públicos dele) — o encapsulamento do Aggregate (ENS-0001 § 1: "mutação só via métodos nomeados") vale também quando quem chama é um Domain Service, não só a Application Layer.
- Um Domain Service nunca embute um Aggregate dentro de outro nem cria uma estrutura de dados nova que funda dois Aggregates — a colaboração é sempre "carregar, ler, decidir, invocar método, salvar", nunca fusão.

## 12. Uso Correto de Repository

- O(s) Repository(ies) necessário(s) são recebidos via construtor, tipados pela interface (`UserRepository`, não uma implementação concreta).
- Usa exclusivamente os métodos já definidos no contrato do domínio (ex.: `findById`, `findAll`, `exists`, `save`, `delete`, herdados de `ReadRepository`/`WriteRepository`, ENG-0001.7) — nunca adiciona lógica de consulta própria dentro do Domain Service (isso seria Infrastructure Concern, disfarçado).
- Nunca instancia um Repository concreto (`new PrismaUserRepository()` ou equivalente) dentro do Domain Service — violaria Dependency Inversion. A escolha de implementação concreta acontece na composição raiz da aplicação, fora da Domain Layer inteira.

## 13. Uso Correto de Specifications

- Uma `Specification<T>` encapsula uma condição de negócio testável isoladamente (`isSatisfiedBy(candidate: T): boolean`) — um Domain Service usa Specifications já existentes para decidir se pode prosseguir, nunca reimplementa a mesma checagem com lógica solta (`if`s inline duplicando o que a Specification já expressa).
- Uma Specification é só leitura — nunca muta o Aggregate que avalia.
- Composição fluente (`and`/`or`/`not`, já providas por `AbstractSpecification<T>`, ENG-0001.6) deve ser preferida a múltiplos `if` aninhados sempre que houver mais de uma condição a combinar.

## 14. Uso Correto de Policies

- Policy = "regra de decisão configurável" ([ENGINEERING_PLAYBOOK.md § 3](../ENGINEERING_PLAYBOOK.md#3-organização-da-domain-layer)). **Nenhuma Policy foi implementada em nenhum domínio da plataforma até esta missão** — `packages/shared-kernel/src/core/policies/` é scaffolding vazio desde a Missão ENG-0001.1; o Identity Domain avaliou explicitamente e não modelou nenhuma (Missão ENG-0002.4, [IDENTITY_TECHNICAL_BLUEPRINT.md § 14](../../../services/kernel/identity/IDENTITY_TECHNICAL_BLUEPRINT.md)).
- Quando uma Policy existir em algum domínio futuro, um Domain Service pode depender dela exatamente como depende de uma Specification hoje — injetada via construtor, nunca com o valor/regra hardcoded dentro do `execute()`.
- Este Standard **não define** a forma exata de um contrato `Policy<T>` — esse contrato ainda não existe no Shared Kernel. Definir essa forma fica `requer decisão`/nova missão `ENS-` quando a primeira Policy real de algum domínio precisar dela — não antecipado aqui.

## 15. Emissão de Domain Events

- **Quem pode emitir**: **somente Aggregates**, nunca um Domain Service diretamente. `addDomainEvent` é `protected` em `AggregateRoot<T>` (Shared Kernel) — um Domain Service não tem, e não deve ter, acesso a esse método.
- **Quando emitir**: um Domain Service que precisa que um evento seja emitido invoca o método do próprio Aggregate que já o emite internamente (ex.: chamar `user.activate()`, que por sua vez chama `this.addDomainEvent(new UserActivated(...))` dentro de si mesmo, ENS-0001 § 5) — o Domain Service nunca constrói nem dispara um evento em nome de um Aggregate que não invocou.
- **Quando NÃO emitir**: um Domain Service cujo `execute()` só lê e decide, sem mutar nenhum Aggregate (ex.: um serviço de verificação de permissão), nunca emite nenhum evento — não houve transição de estado real, então não há evento de domínio a registrar.

## 16. Regras de Transação

- Mesma regra já congelada para os Aggregates de qualquer domínio (ver, por exemplo, `IDENTITY_AGGREGATE_DESIGN_FREEZE.md § 5`, generalizada aqui): **nenhuma operação de escrita cruza dois Aggregates na mesma transação implícita**. Um Domain Service que mutou dois Aggregates diferentes chama `save()` em cada um, através do Repository de cada um, separadamente — não existe "transação de domínio" amarrando os dois.
- Se uma consistência forte entre dois Aggregates (ex.: "ou os dois salvam, ou nenhum salva") for realmente necessária no futuro, isso é uma decisão de Infrastructure (Unit of Work, transação de banco) — fora do escopo de qualquer Domain Service, `requer decisão`/ADR quando a necessidade real e concreta aparecer, não antecipada aqui.
- Do ponto de vista de um Domain Service, consistência entre instâncias de Aggregates diferentes é sempre **eventual**, nunca forte.

## 17. Regras de Idempotência

- Um Domain Service cujo `execute()` só lê (não muta nenhum Aggregate) é sempre idempotente por definição — chamar duas vezes com o mesmo input produz o mesmo resultado, sem efeito colateral.
- Um Domain Service que invoca um método de mutação de Aggregate **herda** a idempotência (ou falta dela) desse método: se o método do Aggregate já é idempotente (ex.: um método de revogação que não falha ao revogar algo já revogado), o Domain Service que o invoca também é; se o método tem guarda de estado que rejeita uma segunda chamada (ex.: um método de ativação que falha se já estiver ativo), o Domain Service propaga essa falha como `Result.fail`, nunca a esconde nem a converte em sucesso silencioso.
- Um Domain Service nunca deve fabricar idempotência artificial que o Aggregate já decidiu não ter — isso mudaria, por um caminho indireto, uma regra de negócio já congelada, sem ADR.

## 18. Responsabilidades Proibidas

Nenhuma das responsabilidades abaixo pode existir dentro de um Domain Service — todas pertencem a outra camada:

| Responsabilidade | Onde pertence de fato |
|---|---|
| Persistência concreta (SQL, ORM, driver de banco) | Infrastructure Layer |
| Cache | Infrastructure Layer |
| Logs / logging estruturado | Cross-cutting / Infrastructure ([ENGINEERING_PLAYBOOK.md § 11](../ENGINEERING_PLAYBOOK.md#11-observabilidade)) |
| HTTP (request/response, status code, headers) | Interface Layer |
| Serialização/deserialização | Infrastructure/Interface Layer |
| DTO (formato de entrada/saída de API) | Application Layer |
| Autorização técnica (parsing de JWT, validação de sessão/token) | Infrastructure Layer — distinto de autorização de **domínio** (ex.: decidir se um `User` tem uma `Permission` é regra de negócio, cabe em Domain Service; validar a assinatura de um token não é) |
| UI | Fora da plataforma de backend inteiramente |

## 19. Checklist Obrigatório

- [ ] Implementa `DomainService<TInput,TOutput>` ou `AsyncDomainService<TInput,TOutput>` do Shared Kernel
- [ ] Satisfaz pelo menos 1 dos 4 critérios de existência (§ 2), documentado explicitamente na origem/justificativa do Domain Service
- [ ] `execute()` devolve `DomainServiceResult<T>`, nunca lança exceção
- [ ] Dependências (Repository/Specification/Policy/outro Domain Service) injetadas via construtor, nunca instanciadas dentro de `execute()`
- [ ] Nenhuma dependência de Infrastructure/Framework/HTTP/DTO/Controller (§ 8)
- [ ] Nenhum Domain Event emitido diretamente — só via método de Aggregate que o Domain Service invoca (§ 15)
- [ ] Cada Aggregate mutado é salvo pelo seu próprio Repository, nunca por um Repository compartilhado (§ 11, § 16)
- [ ] Nomenclatura: sufixo `DomainService` obrigatório; sem sufixo genérico (`Manager`/`Helper`/`Util`/`Processor`) (§ 5)
- [ ] Localização em `src/domain/services/<nome>/`; testes espelhados em `tests/domain/services/<nome>/` (§ 4)
- [ ] Testes cobrem: cada caminho de sucesso, cada caminho de falha de regra de negócio, cada caminho de falha de infraestrutura, idempotência quando aplicável (§ 17)

## 20. Exemplo Conceitual

Exemplo deliberadamente genérico (`ExampleDomainService`, não um Domain Service real de nenhum domínio) — só para ilustrar a forma, sem código de produção:

```
class ExampleDomainService implements AsyncDomainService<ExampleInput, ExampleOutput> {
  constructor(
    private readonly exampleRepository: ExampleRepository,
    private readonly exampleSpecification: Specification<ExampleAggregate>,
  ) {}

  async execute(input: ExampleInput): Promise<DomainServiceResult<ExampleOutput>> {
    // carrega o(s) Aggregate(s) necessário(s) via this.exampleRepository
    // se não encontrado: Result.fail(new NotFoundError(...))
    // aplica this.exampleSpecification.isSatisfiedBy(aggregate) para decidir
    // se inválido: Result.fail(new BusinessRuleError(...))
    // invoca método de mutação do próprio Aggregate, se necessário (ex.: aggregate.someBehavior(...))
    // salva via this.exampleRepository.save(aggregate), se algo mudou
    // Result.ok(output)
  }
}
```

## 21. Declaração Formal de Freeze

A partir desta missão, este é o padrão **obrigatório e congelado** para todo Domain Service de qualquer domínio da NOVARIS. Mudar este Standard (não uma implementação específica de Domain Service) exige ADR ou nova missão `ENS-`. Não é retroativo a nenhuma implementação (nenhum Domain Service foi implementado em nenhum domínio até esta missão — não há nada para reconciliar). Este Standard passa a ser a base obrigatória para qualquer futura missão de implementação de Domain Service, incluindo `ENG-0002.10B` (implementação dos 3 Domain Services já identificados e congelados para o Identity Domain), quando aprovada pelo CTO.

---

## Regras Adicionais

**Por que um Domain Service não pode virar um "Utility Service"?**

Um Utility Service é um conjunto de funções sem estado nem identidade de domínio, geralmente organizado por conveniência técnica (`StringUtils`, `DateHelper`) — não expressa uma capacidade nomeada do vocabulário ubíquo, não tem um motivo de existir ligado a uma regra de negócio real, e tende a virar um "catch-all" onde qualquer lógica é despejada por não caber claramente em outro lugar. Os critérios de existência (§ 2), a lista de proibições explícitas (§ 3) e a nomenclatura obrigatória (§ 5 — sufixo `DomainService`, nunca `Util`/`Helper`/`Manager`/`Processor`) existem exatamente para impedir essa deriva: cada Domain Service tem exatamente **uma** capacidade de domínio nomeada, nunca uma coleção de métodos não relacionados.

**Como evitar um "Anemic Domain Model"?**

Aplicando rigorosamente o critério padrão do § 3: toda regra que um único Aggregate pode decidir sozinho **fica nele** — nunca extraída para um Domain Service por conveniência, "para deixar o Aggregate mais simples", ou por hábito de outras arquiteturas (ex.: Service Layer genérico sobre Entities anêmicas). Um Domain Service só nasce quando a lógica **estruturalmente não cabe** em nenhum Aggregate individual (múltiplos Aggregates, Repository, consulta externa, § 2). Se todo comportamento fosse sistematicamente movido para Services e os Aggregates virassem apenas contêineres de dados com getters/setters, isso seria exatamente um Anemic Domain Model — a proibição de setters e a obrigatoriedade de métodos nomeados com significado de domínio (ENS-0001 § 1) já são a defesa estrutural contra isso, reforçada aqui pela restrição simétrica sobre quando um Domain Service pode existir.

**Como preservar um Rich Domain Model?**

Mantendo comportamento e dado juntos sempre que possível: um Aggregate expõe métodos com significado de domínio (`activate()`, `grantPermission()`), nunca setters genéricos — já obrigatório desde ENS-0001 § 1. Domain Services são a exceção documentada e minoritária, nunca a regra geral — a proporção esperada é poucos Domain Services por domínio em relação ao número de Aggregates e métodos de mutação (o Identity Domain, domínio de referência, tem 3 Domain Services identificados sobre 2 Aggregates com múltiplos métodos de negócio cada — `DOMAIN_SERVICE_IDENTIFICATION.md`), exatamente porque a maior parte do comportamento já vive nos próprios Aggregates.

**Quando uma lógica deve voltar para um Aggregate?**

Sempre que, durante a implementação real, se descobrir que um Domain Service proposto na verdade só toca **um** Aggregate e não depende de Repository nem de consulta externa — nesse caso a suposição inicial (de que precisava de colaboração) estava errada, e a lógica deve ser implementada como método do próprio Aggregate, não do Domain Service. Corrigir um candidato **ainda não implementado** não exige ADR (é ajuste de uma proposta, não mudança de uma estrutura já congelada). Já migrar um Domain Service **já implementado** de volta para um Aggregate é uma mudança estrutural e exige ADR — mesma regra da Declaração de Freeze (§ 21).

---

## Relação com Outros Módulos

- [AGGREGATE_IMPLEMENTATION_STANDARD.md](AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) — padrão irmão, mesma disciplina aplicada a Aggregates; um Domain Service sempre orquestra Aggregates que seguem esse Standard, nunca os substitui
- [ARCHITECTURE_REVIEW_GATE_STANDARD.md](ARCHITECTURE_REVIEW_GATE_STANDARD.md) (ENS-0002) — gate obrigatório quando este Standard for aplicado numa futura missão `ENG-` de implementação de Domain Service
- [services/kernel/identity/DOMAIN_SERVICE_IDENTIFICATION.md](../../../services/kernel/identity/DOMAIN_SERVICE_IDENTIFICATION.md) (ENG-0002.10A) — origem dos critérios de existência (§ 2) e do domínio de referência (Identity)
- [packages/shared-kernel/](../../../packages/shared-kernel/README.md) — `DomainService`, `AsyncDomainService`, `DomainServiceResult<T>`, `Specification`/`AbstractSpecification`, `Repository`/`ReadRepository`/`WriteRepository`, hierarquia de erros — todos reutilizados, nenhum reimplementado
- [ENGINEERING_PLAYBOOK.md §§ 2-4](../ENGINEERING_PLAYBOOK.md) — estrutura de serviço, Domain/Application Layer, base deste Standard
- [architecture/ADM/ARCHITECTURE_DECISION_MATRIX.md](../../../architecture/ADM/ARCHITECTURE_DECISION_MATRIX.md) — índice executivo, referenciará este Standard

## Status

🟢 Oficial (v1.0.0), padrão obrigatório e congelado (Missão ENS-0003). Nenhum código implementado, nenhuma regra de negócio nova, nenhuma decisão arquitetural conflitante — consolidação de práticas já estabelecidas pelo Shared Kernel (ENG-0001.6, ENG-0001.7, ENG-0001.8), pelo ENS-0001 e pelo `DOMAIN_SERVICE_IDENTIFICATION.md` do Identity Domain.
