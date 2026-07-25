# Organization — Technical Blueprint

Versão: 0.1.0

Status: 🟢 Oficial — modelagem técnica, sem implementação

Missão: ENG-0003.6 (Organization Technical Blueprint) — EPIC-003

Escopo: especificação técnica completa do Aggregate `Organization`, reutilizando exclusivamente os componentes já implementados no Shared Kernel, sobre a base já congelada em [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md) (ENG-0003.5) e [ADR-ORG-001](../../../adr/ADR-ORG-001-organization-status-strategy.md). Nenhum código TypeScript, classe, interface real, Repository, Domain Service, teste ou migration foi criado nesta missão — apenas assinaturas e diagramas textuais, mesmo padrão de [IDENTITY_TECHNICAL_BLUEPRINT.md](../identity/IDENTITY_TECHNICAL_BLUEPRINT.md) (usado aqui só como padrão estrutural, não como fonte de conteúdo).

**Regra de método**: todo conteúdo abaixo deriva exclusivamente do que já está congelado em `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md §§ 1-15`. Onde a Freeze marcou algo como não coberto (§ 16), esta Blueprint **não decide** — reproduz a mesma assinatura pendente, sem inventar comportamento, exatamente como `IDENTITY_TECHNICAL_BLUEPRINT.md § 4` fez com o mecanismo de senha antes de `ADR-0010`.

---

## 1. Objetivo

Traduzir o contrato já congelado do Aggregate `Organization` em assinaturas técnicas — classes, interfaces, tipos — reutilizando os blocos já implementados no Shared Kernel (`AggregateRoot<T>`, `ValueObject<T>`, `Result<T,E>`, hierarquia de erros, `Repository<T>`, `DomainEvent`), servindo de contrato para uma futura missão de implementação real (`ENG-0003.x`, análoga a `ENG-0002.7`).

## 2. Estrutura de Diretórios

Segue [ENGINEERING_PLAYBOOK.md § 2](../../../knowledge/engineering/ENGINEERING_PLAYBOOK.md#2-estrutura-obrigatória-dos-serviços), mesmo padrão já em uso em `services/kernel/identity/`:

```
services/kernel/organizations/
├── src/
│   └── domain/
│       ├── aggregates/
│       │   └── organization/
│       │       └── organization.ts
│       ├── value-objects/
│       │   ├── slug.ts
│       │   ├── document.ts
│       │   ├── address.ts
│       │   └── branding-theme.ts
│       ├── repositories/
│       │   └── organization-repository.ts
│       └── domain-events/
│           └── organization-created.ts
└── tests/
    └── domain/
        ├── aggregates/organization/organization.test.ts
        ├── value-objects/{slug,document,address,branding-theme}.test.ts
        ├── repositories/organization-repository.test.ts
        └── domain-events/organization-created.test.ts
```

`src/domain/services/` **não é criado** — [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 14](ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md): "Nenhuma [regra que exija Domain Service] identificada." `application/`, `infrastructure/`, `interfaces/` permanecem fora do escopo, como em todo Kernel module ainda não implementado.

## 3. Aggregate `Organization`

```
class Organization extends AggregateRoot<OrganizationProps>
  implements Timestamped, HasMetadata<OrganizationMetadata>
```

**Diferença deliberada em relação a `User`/`Role` (Identity Domain)**: `Organization` **não implementa** `Auditable` nem `Versionable`. Nenhuma fonte oficial (`objects/Organization.md § ATRIBUTOS`, consolidada em `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 4`) cita campos `created_by`/`updated_by` ou `version` para `Organization` — diferente de `User`/`Role`, que os têm explicitamente. RN006 ("Auditoria obrigatória") e `§ AUDITORIA` de `objects/Organization.md` descrevem um registro mais rico (usuário, data, IP, origem, evento, valores antigos, valores novos) do que o par simples `createdBy`/`updatedBy` do contrato `Auditable` — consistente com um mecanismo de audit log separado (possivelmente `services/kernel/audit/`, já existente no Kernel), não com o próprio Aggregate implementando `Auditable`. Não presumido além disso — decisão de qual mecanismo real fica para uma futura missão.

```
interface OrganizationProps {
  slug: Slug;
  name: string;
  legalName: string;
  document: Document;
  address: Address;
  branding: BrandingTheme;
  plan: string;                    // natureza (VO vs. Aggregate) não definida — Freeze § 16
  billingStatus: string;
  trialEnd: Date;
  maxUsers: number;
  maxStorage: number;
  storageUsed: number;
  featureFlags: Record<string, unknown>;
  settings: Record<string, unknown>;
  metadata: OrganizationMetadata;
  status: OrganizationStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

type OrganizationStatus = "active" | "suspended" | "trial" | "blocked" | "archived";
// Definitivo — ADR-ORG-001. Tabela de transições NÃO definida — Freeze § 8/§ 16.

type OrganizationMetadata = Record<string, unknown>;
// Mesma justificativa de UserMetadata (Identity, ENG-0002.7) — forma não definida por nenhuma fonte.
```

`contactInfo` (`email`/`phone`/`website`) **não aparece como campo estruturado** — `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 4` já registrou que esse agrupamento não foi confirmado como Value Object; mantido implicitamente como parte dos atributos já citados, sem forma decidida aqui.

## 4. Value Objects

Todos seguem o mesmo padrão já implementado em `Email`/`Permission` (Identity, ENG-0002.3): construtor privado, `static create()` devolvendo `Result<T, ValidationError>`, imutável.

```
class Slug extends ValueObject<SlugProps> {
  static create(value: string): Result<Slug, ValidationError>
  get value(): string
}
// Formato de validação e escopo de unicidade NÃO definidos — Freeze § 16.

class Document extends ValueObject<DocumentProps> {
  static create(value: string): Result<Document, ValidationError>
  get value(): string
}
// Formato de validação (CNPJ) NÃO definido em nenhuma fonte.

class Address extends ValueObject<AddressProps> {
  static create(input: AddressInput): Result<Address, ValidationError>
  get street(): string
  get number(): string
  get district(): string
  get complement(): string | undefined
  get city(): string
  get state(): string
  get zipCode(): string
  get country(): string
}
// Campos citados em Freeze § 5; regra de validação de cada campo não definida.

class BrandingTheme extends ValueObject<BrandingThemeProps> {
  static create(input: BrandingThemeInput): Result<BrandingTheme, ValidationError>
  get logoUrl(): string | undefined
  get faviconUrl(): string | undefined
  get primaryColor(): string | undefined
  get secondaryColor(): string | undefined
  get accentColor(): string | undefined
}
```

**`Plan` explicitamente não modelado como Value Object** — `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 5`: natureza (VO vs. Aggregate próprio) não coberta pelo Freeze. Nenhuma classe `Plan` é definida aqui.

## 5. Repository Contract

```
interface OrganizationRepository extends ReadRepository<Organization>, WriteRepository<Organization> {}
```

Zero métodos próprios — mesmo critério já aplicado a `UserRepository`/`RoleRepository` (ENG-0002.9): nenhuma fonte define índices/consultas reais (ex.: buscar por `slug`) ainda; acrescentar um método agora seria antecipar uma decisão de infraestrutura. Ver § 15.

## 6. Domain Events

Apenas um evento é **definitivo**, conforme [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 9](ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md):

```
class OrganizationCreated implements DomainEvent {
  readonly eventId: string;
  readonly aggregateId: UniqueEntityId;
  readonly occurredAt: Date;
  readonly eventName = "OrganizationCreated";
}
```

**Nenhum outro evento é definido com assinatura aqui.** `OrganizationActivated`, `OrganizationUpdated`, `OrganizationSuspended`, `OrganizationPlanChanged`, `OrganizationBillingFailed`, `OrganizationArchived`, `OrganizationDeleted` permanecem candidatos — a lista canônica de eventos (além de `OrganizationCreated`) não foi resolvida pelo Freeze (§ 16); definir suas assinaturas agora seria decidir algo que o Freeze explicitamente deixou em aberto.

## 7. Factory Methods

```
static create(input: CreateOrganizationInput): Result<Organization, DomainError>
static reconstitute(props: OrganizationProps, id: UniqueEntityId): Organization

interface CreateOrganizationInput {
  name: string;
  slug: Slug;
  legalName: string;
  document: Document;
  address: Address;
  // Sem campo `createdBy` — Organization não implementa Auditable, ver § 3.
}
```

`create()` dispara `OrganizationCreated` (§ 6), segue `AGGREGATE_IMPLEMENTATION_STANDARD.md § 3` (ENS-0001) — construtor privado, `create()` valida, `reconstitute()` não valida nem dispara eventos (ENS-0001 § 8). **Valor inicial de `status` não definido** — `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16`: `create()` não pode ser implementado por completo até essa decisão existir (candidato mais provável seria `"trial"`, mas não confirmado por nenhuma fonte).

## 8. Métodos Públicos do Aggregate

Assinaturas propostas, derivadas de `ORGANIZATION_TECHNICAL_BLUEPRINT` (este documento) e dos casos de uso já citados em `ORGANIZATION_DOMAIN_MODEL.md § 8`:

```
updateProfile(input: UpdateOrganizationProfileInput): Result<void, DomainError>
// Atualiza name/legalName/document/address/branding. Regras de validação: ver § 10.

changePlan(newPlan: string): Result<void, DomainError>
// BLOQUEADO — política de troca de plano (upgrade/downgrade, proração) não definida (Freeze § 16).

suspend(): Result<void, DomainError>
activate(): Result<void, DomainError>
archive(): Result<void, DomainError>
// BLOQUEADOS — tabela de transições de status não definida (Freeze § 8/§ 16); guarda de
// transição não pode ser escrita sem inventar uma regra que nenhuma fonte confirma.
```

Nenhum destes 4 últimos métodos pode ser implementado com corpo real a partir apenas deste documento — as assinaturas existem para servir de contrato futuro, não para autorizar implementação imediata.

## 9. Fluxos Internos

```
Criar Organization
  Application Layer → Organization.create({ name, slug, legalName, document, address })
    → Organization dispara OrganizationCreated
    → OrganizationRepository.save(organization)

Atualizar Perfil
  OrganizationRepository.findById(id) → Result<Option<Organization>, InfrastructureError>
    → organization.updateProfile(input) [regras de validação, § 10]
    → OrganizationRepository.save(organization)

Suspender / Ativar / Arquivar / Alterar Plano
  [BLOQUEADO — ver § 8; nenhum fluxo pode ser detalhado até a tabela de transições
   e a política de troca de plano existirem]
```

## 10. Regras de Validação

| Regra | Status | Fonte |
|---|---|---|
| `name` obrigatório na criação | Definitiva | `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 6` |
| `slug` obrigatório na criação | Definitiva | Idem |
| Formato de `slug` | Não definido | Freeze § 16 |
| Escopo de unicidade de `slug` | Não definido | Freeze § 16 |
| Formato de `document` (CNPJ) | Não definido | Nenhuma fonte |
| Completude de `address` (campos obrigatórios vs. opcionais) | Não definida | Nenhuma fonte |
| `status` restrito aos 5 valores de `OrganizationStatus` | Definitiva | `ADR-ORG-001` |

## 11. Domain Services Candidatos

**Nenhum confirmado** — `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 14`: "Nenhuma [regra que exija Domain Service] identificada." Único candidato já registrado, ainda não modelável: a cadeia de provisionamento (`objects/Organization.md § AUTOMAÇÕES`, `ORGANIZATION_DOMAIN_DISCOVERY.md §§ 10, 12`) — atravessa múltiplos Bounded Contexts, permanece fora do escopo de qualquer Blueprint do Organization Domain isoladamente.

## 12. Casos de Erro

Reutilização direta da hierarquia já existente no Shared Kernel — nenhuma classe de erro nova:

| Cenário | Classe |
|---|---|
| `slug`/`document`/campos de `Address`/`BrandingTheme` malformados | `ValidationError` |
| `Organization` não encontrada via Repository | `NotFoundError` (uso pela Application Layer, não pelo Aggregate — mesmo padrão de `AuthorizationDomainService`, ENG-0002.10C) |
| Transição de `status` inválida (quando a tabela existir) | `ConflictError` — não implementável ainda, § 8 |
| Falha de infraestrutura (Repository) | `InfrastructureError` |

## 13. Estratégia de Testes

Cobertura esperada, seguindo `AGGREGATE_IMPLEMENTATION_STANDARD.md § 11` (checklist ENS-0001), **para as partes não bloqueadas**:

- Criação válida (`create()`, com os campos obrigatórios de § 10).
- Rejeição de criação com `name`/`slug` ausente.
- `reconstitute()` sem validação, sem eventos.
- Geração correta de `OrganizationCreated`.
- `updateProfile()` — caminho de sucesso e cada campo inválido (quando as regras de § 10 pendentes forem decididas).

**Não testável ainda**: `changePlan()`, `suspend()`, `activate()`, `archive()` — nenhum teste pode ser escrito para uma guarda de transição que não existe (§ 8).

## 14. Critérios de Implementação

Uma futura missão de implementação real deste Aggregate deve, obrigatoriamente:

- Seguir `AGGREGATE_IMPLEMENTATION_STANDARD.md` (ENS-0001) integralmente.
- Reutilizar exclusivamente componentes já existentes no Shared Kernel — nenhum novo.
- Produzir Self Review + DMV + ACR + ARG (`ARCHITECTURE_REVIEW_GATE_STANDARD.md`, ENS-0002).
- **Não implementar** `changePlan()`/`suspend()`/`activate()`/`archive()` até os itens de `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16` relevantes serem decididos — implementá-los sem essa decisão seria inventar regra de negócio, proibido em toda esta cadeia de missões.
- Implementar `create()`/`reconstitute()`/`updateProfile()` primeiro — únicos comportamentos com base documental completa.

## 15. Itens Explicitamente Fora de Escopo

Herdados sem alteração de [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16](ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md), mais os itens técnicos que esta Blueprint por si só expôs:

- Natureza de `Plan` (Value Object vs. Aggregate próprio).
- Tabela completa de transições de `status`, incluindo se `suspended → active` é real.
- Valor inicial de `status` na criação.
- Lista canônica de Domain Events além de `OrganizationCreated`.
- Escopo de unicidade de `slug`.
- Regras de limite (`maxUsers`/`maxStorage`) — o que acontece ao exceder.
- Política de troca de plano (upgrade/downgrade, proração).
- Mecanismo real de auditoria (RN006) — se é um Aggregate/Entity próprio (`Audit Log`, já citado em `BOM.md`), um serviço do Kernel (`services/kernel/audit/`), ou outro mecanismo.
- `Workspace`, `Team`, `Subscription` — não desenhados nesta Blueprint, que cobre exclusivamente `Organization` (mesmo escopo do Freeze, § 1).
- Implementação real de `OrganizationRepository` (Infrastructure Layer — Prisma, Supabase ou outro).
- Application, Infrastructure e Interface Layers inteiras.

---

## Relação com Outros Módulos

- [ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md](ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md) (ENG-0003.5) — base congelada desta Blueprint
- [ADR-ORG-001](../../../adr/ADR-ORG-001-organization-status-strategy.md) — fonte de `OrganizationStatus`
- [packages/shared-kernel/](../../../packages/shared-kernel/README.md) — todos os componentes reutilizados
- [knowledge/engineering/standards/](../../../knowledge/engineering/standards/README.md) — ENS-0001, ENS-0002, ENS-0003, padrões seguidos integralmente

## Status

🟢 Blueprint técnico concluído (Missão ENG-0003.6). Nenhuma implementação de código. `create()`/`reconstitute()`/`updateProfile()` têm base suficiente para uma futura missão de implementação; `changePlan()`/`suspend()`/`activate()`/`archive()` permanecem bloqueados até `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 16` ser resolvido. Aguardando aprovação do CTO.
