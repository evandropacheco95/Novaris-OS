# NOVARIS — Context Relationships (Strategic DDD)

Versão: 1.7.0

Status: 🟢 Oficial — relacionamentos estratégicos entre Bounded Contexts, nenhum código, nenhuma implementação

Missão: ENG-0011 (Context Relationships); atualizado por ENG-0020 (Queue Ownership Resolution), ENG-0022 (Automation Domain Confirmation), ENG-0023 (AI Domain Confirmation), ENG-0024 (Domain Model Reconciliation), ENG-0025 (Knowledge Domain Position Resolution), ENG-0026 (Domain Model Reconciliation II), ENG-0027 (Task Ownership Resolution), ENG-0028 (Domain Model Reconciliation III) e ENG-0020.2 (Queue Ownership Documentation Reconciliation) — ver "Nota de Atualização" abaixo

Escopo: estabelecer os relacionamentos estratégicos (Strategic Design, DDD) entre os Bounded Contexts já consolidados, aplicando integralmente a decisão formal do CTO (abaixo). Nenhum código, módulo, contrato existente, Shared Kernel ou ADR foi alterado. Nenhuma proposta ou decisão arquitetural nova foi criada por esta missão — só aplicação do que o CTO já decidiu.

## Decisão Formal do CTO (recebida durante esta missão)

Substitui integralmente qualquer decisão provisória tomada antes de sua chegada. Aplicada literalmente, sem extrapolação:

1. **Documento canônico do Domain Layer**: `DOMAIN_MODEL.md`.
2. **Ordem de precedência documental**: ADRs → `DOMAIN_MODEL.md` → `ENGINEERING_PLAYBOOK.md` → `PROJECT_RULES.md` → `SYSTEM_ARCHITECTURE.md` → READMEs → demais documentos estratégicos (`NOVARIS_OS.md`, `PRODUCTS.md`, `ORGANIZATION.md`).
3. **Nome canônico do Bounded Context**: `Organization`.
4. **`Workspace`** é nomenclatura legada — só poderá existir futuramente como conceito interno de uma `Organization`, nunca como sinônimo do domínio.
5. **`Analytics`** é Supporting Domain.
6. **`AI` e `Automation` NÃO são Business Domains neste momento** — hoje existem apenas `AI Runtime` e `Automation Runtime` como Infrastructure Capabilities. Qualquer `AI Domain`/`Automation Domain` permanece Future Domain.
7. **`Subscription`** pertence ao domínio `Financial`.
8. **`Task`** pertence ao domínio `Projects`.
9. **`Queue`** pertence ao domínio `CRM`.
10. **`Release`** pertence ao domínio `Platform/Engineering`.
11. **`Knowledge`** permanece bloqueado até existir modelagem de domínio própria.

**Nota de rastreabilidade**: os decisões 9 e 10 introduzem dois nomes de domínio (`CRM`, `Platform/Engineering`) que não constavam em nenhuma das 6 listas já catalogadas em `DOMAIN_CANONICALIZATION.md § 2` sob esses nomes exatos — `CRM` existia como Produto (`PRODUCTS.md`/`NOVARIS_OS.md`), nunca como Domain Layer; `Platform/Engineering` não existia em nenhuma lista anterior. Registrados aqui exatamente como o CTO os nomeou, sem inventar mais conteúdo sobre eles além da posse do objeto declarada (§ 2, § 8).

**Nota de Atualização (ENG-0020, ADR-0011, ADR-0012)**: o item 9 acima ("`Queue` pertence ao domínio `CRM`") foi formalmente invalidado por `ADR-0011` (`CRM` confirmado como Product Layer, nunca Bounded Context) e resolvido por `ADR-0012` (`Queue` pertence a `Automation Domain`, sujeito à mesma pendência de confirmação de `Automation` como Business Domain já registrada no item 6). O texto do item 9 é preservado verbatim acima como registro histórico da decisão original do CTO — não foi apagado nem reescrito. As seções derivadas desta missão (§§ 1, 2, 3, 5, 8, 9, abaixo) foram atualizadas para refletir a resolução, seguindo a mesma disciplina já usada nesta engenharia para decisões supersedidas (`PROJECT_RULES.md`, Emenda 7).

**Nota de Atualização (ENG-0025, ADR-0015)**: o item 11 acima ("`Knowledge` permanece bloqueado até existir modelagem de domínio própria") foi resolvido — `Knowledge` foi absorvido pela AI Transversal Intelligence Layer (`ADR-0014`), não modelado como domínio próprio. O texto do item 11 é preservado verbatim acima. §§ 2, 8, 9 abaixo foram atualizados.

---

## 1. Resumo Executivo

A plataforma tem hoje **3 Bounded Contexts reais** (`Identity`, `Organization`, `Audit`) com relacionamento estratégico evidenciado em código: `Shared Kernel` (packages/shared-kernel) com todos os três; `Anti-Corruption Layer` de `Audit` sobre `Identity`/`Organization`; `Open Host Service` de `Identity`/`Organization` para o resto da plataforma. `AI` e `Automation`, por decisão formal do CTO, **não são domínios de negócio hoje** — permanecem só como Infrastructure Capabilities (`ai-runtime`, `automation-runtime`), removidos de qualquer classificação de Core/Supporting Domain até que uma Discovery formal os confirme como Future Domain modelável. Os demais domínios de `DOMAIN_MODEL.md` não têm implementação — seus relacionamentos são candidatos, derivados da cadeia de dependência já documentada. Dois nomes de domínio novos (`CRM`, `Platform/Engineering`) foram introduzidos pela decisão do CTO via posse de objeto (`Queue`, `Release`) — registrados, sem relacionamento avaliado ainda. **Atualização (ENG-0020)**: `CRM` foi confirmado como Product Layer, sem Bounded Context próprio (`ADR-0011`); `Queue` foi reatribuído a `Automation Domain` (`ADR-0012`), com o mesmo status "Ownership Pending Business Domain Confirmation" dos demais objetos de `Automation` — decisão intermediária, ver atualização abaixo. **Atualização (ENG-0020.2)**: `ADR-0013` (ENG-0022) confirmou `Automation` como Infrastructure Capability, não Business Domain, resolvendo a pendência acima negativamente — `Queue` **não possui Domain Owner hoje**, é Infrastructure Capability transversal, alinhado com § 2 abaixo (linha "Automation"). `Platform/Engineering` permanece nomeado só por posse de `Release`, sem alteração nesta missão.

## 2. Inventário de Contextos

Base: `DOMAIN_MODEL.md` (documento canônico, decisão CTO item 1), reconciliado com a decisão CTO itens 3-10.

| Contexto | Status | Classificação estratégica |
|---|---|---|
| Shared Kernel (`packages/shared-kernel`) | 🟢 Implementado | Não é um Bounded Context de negócio — é o padrão DDD "Shared Kernel" em si |
| Identity | 🟢 Implementado | Generic Domain |
| **Organization** (nome canônico, decisão CTO item 3; `Workspace` é legado, item 4) | 🟢 Implementado | Supporting Domain |
| Audit (fragmento de "System") | 🟡 Implementado, parcial | Generic Domain |
| Customer (Relationship) | 🟡 Scaffolding | Core Domain |
| Sales | 🟡 Scaffolding | Core Domain |
| Activity | ⚪ Future | Generic Domain |
| **Projects** (possui `Task`, decisão CTO item 8, formalizado por `ADR-0016`) | 🟡 Scaffolding | Supporting Domain |
| Marketing | 🟡 Scaffolding | Supporting Domain |
| Knowledge | 🔵 **Absorvido pela AI Transversal Intelligence Layer** (`ADR-0015`, ENG-0025) — não mais "bloqueado", resolvido | N/A — não é domínio; conteúdo-fonte da Knowledge Base de IA |
| **AI** | 🔵 **Confirmada Transversal Intelligence Layer, não Business Domain** (`ADR-0014`, ENG-0023) — `packages/ai/` (definição) + `ai-runtime` (execução, Infrastructure) + `CONSTITUTION.md Artigo 13` (governança) | N/A — não é domínio; consumida por qualquer domínio/produto |
| **Automation** | 🔴 **Confirmado Platform Capability, não Business Domain** (`ADR-0013`, ENG-0022) — `automation-runtime` (Infrastructure); `Queue` e os demais 6 objetos reclassificados como conceitos de Infrastructure, sem Owner de Domain Layer | N/A — não é domínio |
| **Financial** (possui `Subscription`, decisão CTO item 7) | 🟡 Scaffolding | Supporting Domain |
| **Analytics** (Supporting Domain, decisão CTO item 5) | 🟡 Scaffolding | Supporting Domain |
| **CRM** (Product Layer confirmado, `ADR-0011`; não possui mais `Queue` — reatribuído a `Automation`, `ADR-0012`) | 🔴 Confirmado como Product Layer, sem Bounded Context (`ADR-0011`) | N/A — não é domínio |
| **Platform/Engineering** (possui `Release`, decisão CTO item 10) | ⚪ Nomeado, sem Bounded Context/scaffolding próprio ainda | Não avaliável — só posse de objeto registrada |

## 3. Matriz de Relacionamentos

Só pares com evidência real ou candidata rastreável são detalhados — todo par não listado é `Separate Ways`/sem relacionamento identificado (§ "Pares sem relacionamento" ao final desta seção).

| Origem | Destino | Tipo | Justificativa | Dependência permitida | Dependência proibida |
|---|---|---|---|---|---|
| Identity | Organization | **Customer/Supplier** | `Organization` referencia `Identity` conceitualmente (`IDENTITY_DOMAIN_CLOSURE.md § 9` permite `UserId`); `Identity` nunca depende de `Organization` — relação assimétrica clássica, upstream/downstream | `Organization` → `Identity` (por id) | `Identity` → `Organization` (proibido, `IDENTITY_DOMAIN_CLOSURE.md § 8`) |
| Identity, Organization | Audit | **Anti-Corruption Layer** | `Audit` nunca importa tipos concretos de `Identity`/`Organization` — traduz `DomainEvent` bruto em `AuditEntry` (linguagem própria: `Actor`, `Target`, `ChangeSet`) através de uma camada de enriquecimento (`AUDIT_DOMAIN_DECISIONS.md §§ 4-5`); é o padrão ACL por definição, mesmo que o nome nunca tenha sido usado nos documentos do EPIC-005 | `Audit` → `Identity`/`Organization` (só por id) | `Identity`/`Organization` → `Audit` (nunca dependem do consumidor) |
| Identity | Todos os demais domínios de negócio | **Open Host Service** | `IDENTITY_DOMAIN_CLOSURE.md § 9` já publica um "Contrato para Outros Bounded Contexts" explícito (permitido/proibido) — um OHS real, não hipotético | Referência por `UserId`/`RoleId` | Nenhum domínio pode reescrever ou embutir `User`/`Role` |
| Organization | Todos os demais domínios de negócio | **Open Host Service** | `organizationId` é a "raiz de referência" de toda a plataforma (RN001, `ORGANIZATION_AGGREGATE_DESIGN_FREEZE.md § 10`) — mesmo padrão de OHS, ainda mais universal que Identity | Referência por `organizationId` | Nenhum domínio pode embutir `Organization` |
| `DomainEvent` (Shared Kernel) | Todo domínio que já implementa Aggregate | **Published Language** | Contrato genérico e publicado (`eventId`/`aggregateId`/`occurredAt`/`eventName`) que qualquer consumidor pode ler sem conhecer o produtor — candidato a Published Language da plataforma, hoje incompleto (sem payload, `EVENT_BUS_EPIC_PLANNING.md § 7`) | Consumir a forma já publicada | Nenhum domínio deve inventar sua própria variante de evento sem usar o contrato já publicado |
| Customer (Relationship) | Sales | **Customer/Supplier** | `DOMAIN_MODEL.md` posiciona `Sales` logo após `Relationship` na cadeia — Sales consome dados de relacionamento (quem é o cliente/prospect) para criar oportunidades | `Sales` → `Customer` (por id) | `Customer` → `Sales` (proibido pela cadeia) |
| Customer, Sales | Activity | **Customer/Supplier** (candidato, não confirmado) | `Activity` (agenda/tarefas/follow-up) provavelmente referencia interações com `Customer`/oportunidades de `Sales` — inferência da cadeia, nenhum objeto real confirma ainda | `Activity` → `Customer`/`Sales` (candidato) | `Customer`/`Sales` → `Activity` (proibido pela cadeia) |
| Sales, Activity | Projects | **Customer/Supplier** (candidato) | Projeto provavelmente nasce de uma oportunidade ganha (`Opportunity` → `Project`); `Projects` agora também é o dono confirmado de `Task` (decisão CTO item 8) | `Projects` → `Sales`/`Activity` (candidato) | `Sales`/`Activity` → `Projects` (proibido pela cadeia) |
| Marketing | Sales, Customer | **Customer/Supplier invertido (candidato)** | Marketing tipicamente gera leads que alimentam `Customer`/`Sales` — mas `DOMAIN_MODEL.md` posiciona `Marketing` **depois** de `Sales`/`Activity`/`Project` na cadeia, o que impede essa direção sob a regra já congelada ("nenhum domínio depende de um domínio abaixo dele") | Nenhuma confirmada — a posição de `Marketing` na cadeia contradiz o fluxo de negócio esperado (leads alimentando Sales) | **Risco arquitetural, não relacionamento** — ver § 8 |
| Organization | Financial | **Não determinado (registrado, não decidido aqui)** | A decisão do CTO (item 7) move `Subscription` para `Financial` — invertendo a leitura anterior desta missão (que seguia `DEC-ORG-003`). Um relacionamento real entre `Organization` e `Financial` em torno de `Subscription`/plano provavelmente existe, mas seu padrão DDD exato (Customer/Supplier? Conformist? em qual direção?) não é decidido por esta missão — "não crie novas propostas" (instrução do CTO) impede inferir além do que já foi dito | Não determinado | Não determinado |
| Audit | Event Bus (quando existir) | **Partnership (candidato futuro)** | Ambos precisam evoluir juntos para o mecanismo de enriquecimento funcionar (`AUDIT_DOMAIN_DECISIONS.md § 5`, `EVENT_BUS_EPIC_PLANNING.md § 4`) — nenhum dos dois tem poder de negociação claramente superior; decisão de acoplamento ainda não tomada | A definir quando Event Bus for implementado | N/A ainda |

**`AI`/`Automation` removidos da matriz** (estavam presentes numa versão anterior desta missão, antes da decisão formal do CTO chegar) — como não são Business Domains hoje (decisão CTO item 6), nenhum relacionamento de Bounded Context é avaliado para eles. A relação `ai-runtime`/`automation-runtime` → `Identity` (validação de permissão, `CONSTITUTION.md Artigo 12`) é uma relação de **Infrastructure Capability para Domain**, não entre dois Bounded Contexts — fora do escopo desta matriz (mesma distinção de camada já registrada em `KERNEL_BOUNDARY_REVIEW.md`). **Atualização (ENG-0022)**: `Automation` teve sua pendência resolvida por `ADR-0013` — confirmado definitivamente Platform Capability, nunca terá relacionamento de Bounded Context avaliado. **Atualização (ENG-0023)**: `AI` teve sua pendência resolvida por `ADR-0014` — confirmada Transversal Intelligence Layer, também nunca terá relacionamento de Bounded Context avaliado (não é um Bounded Context, é consumida transversalmente por qualquer domínio ou produto que a invoque). `ENG-0011` item 6 está agora integralmente resolvido: `Automation` (Platform Capability) e `AI` (Transversal Layer).

**`CRM` e `Platform/Engineering`**: nenhum relacionamento avaliado. **Atualização (ENG-0020)**: `CRM` foi confirmado como Product Layer, sem Bounded Context, sem objeto próprio (`ADR-0011`) — não participa mais desta matriz como candidato a domínio. `Platform/Engineering` permanece nomeado só via posse de objeto (`Release`), sem Bounded Context próprio, sem posição confirmada na cadeia de dependência — inalterado por esta missão.

### Pares sem relacionamento identificado (`Separate Ways`)

Registrados explicitamente, não omitidos: `Knowledge` com todos os demais contextos (bloqueado, decisão CTO item 11); `Analytics` com `Marketing`/`Activity`/`Projects` individualmente (Analytics consome de forma agregada/via Event Bus futuro, nunca diretamente de um domínio específico — nenhuma fonte confirma integração direta); `Financial` com `Sales`/`Marketing`/`Activity`/`Projects` (nenhuma fonte conecta diretamente, além da posição comum na cadeia); `CRM`/`Platform/Engineering` com todo o restante (nomeados, sem nenhuma relação ainda estabelecida).

## 4. Mapa Geral

```
Shared Kernel (packages/shared-kernel)
  │  (Shared Kernel pattern — DDD)
  ▼
┌─────────────────────────────────────────────┐
│ Generic Domains (Identity, Audit)            │  ← Open Host Service / ACL
└─────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────┐
│ Supporting Domains (Organization, Marketing, │
│ Projects, Financial, Analytics)              │
└─────────────────────────────────────────────┘
`Knowledge` removido desta lista (ENG-0025) — absorvido pela AI Transversal Intelligence Layer (`ADR-0015`), não é mais um Supporting Domain candidato.
  │
  ▼
┌─────────────────────────────────────────────┐
│ Core Domains (Customer, Sales)               │  ← Customer/Supplier entre si
└─────────────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────────────┐
│ Future Domains (Activity; AI e Automation —  │
│ decisão CTO item 6, hoje só Infrastructure;  │
│ CRM, Platform/Engineering — nomeados, sem    │
│ Bounded Context ainda)                       │
└─────────────────────────────────────────────┘

Infraestrutura (services/kernel/, Infrastructure Capabilities):
Event Bus, Logging, Storage, Integration Hub, Files, Notifications,
Realtime, Search, Monitoring, Scheduler, ai-runtime, automation-runtime
  — consumida por todos os domínios acima via Adapter, nunca o contrário
  (KERNEL_BOUNDARY_REVIEW.md, ENG-0007)
```

**Nota sobre a classificação acima**: a posição vertical (Generic → Supporting → Core → Future) reflete **maturidade de implementação e classificação estratégica combinadas**, não a cadeia de dependência real de `DOMAIN_MODEL.md`. `AI`/`Automation` foram movidos para "Future Domains" nesta revisão — antes de a decisão do CTO chegar, esta missão os havia classificado como candidatos a Core Domain; essa classificação foi retirada, não corrigida por inferência própria.

## 5. Relacionamentos Estratégicos (Padrões Identificados)

- **Shared Kernel**: `packages/shared-kernel/` — o único caso literal do padrão no código real; todo domínio implementado o reutiliza sem modificação (`AggregateRoot`, `Result`, `Repository`).
- **Anti-Corruption Layer**: `Audit` sobre `Identity`/`Organization` — o único ACL real e evidenciado.
- **Open Host Service**: `Identity` (contrato já publicado, `IDENTITY_DOMAIN_CLOSURE.md § 9`) e `Organization` (raiz de referência universal, RN001).
- **Published Language**: `DomainEvent` (Shared Kernel) — candidato, hoje incompleto (sem payload).
- **Customer/Supplier**: a cadeia de `DOMAIN_MODEL.md` é, estruturalmente, uma sequência de relações Customer/Supplier.
- **Partnership**: nenhum confirmado hoje; `Audit`↔`Event Bus` é candidato futuro.
- **Separate Ways**: a maioria dos pares entre domínios ainda não implementados; `AI`/`Automation` como Business Domain, `Platform/Engineering` com o restante da plataforma. `CRM` removido desta lista (ENG-0020) — confirmado Product Layer, não é candidato a Bounded Context (`ADR-0011`).
- **Não determinado**: `Organization`↔`Financial` em torno de `Subscription` — registrado, não classificado (ver § 3).

## 6. Dependências Permitidas

Regra geral já congelada (`DOMAIN_MODEL.md § DEPENDÊNCIAS`): todo domínio pode depender de qualquer domínio **anterior** na cadeia (Identity → Organization → Customer → Sales → Activity → Projects → Marketing → Knowledge → Financial → Analytics → System/Audit — cadeia sem `AI`/`Automation`, que não são domínios hoje), sempre por referência de id, nunca por tipo concreto embutido. Todo domínio pode depender do Shared Kernel sem restrição. `Platform/Engineering` ainda não tem posição confirmada nesta cadeia. `CRM` removido desta consideração (ENG-0020) — não é domínio, não ocupa posição na cadeia (`ADR-0011`).

## 7. Dependências Proibidas

Nenhum domínio pode depender de um domínio **posterior** na cadeia. Confirmado sem violação nos 3 contextos implementados (`KERNEL_BOUNDARY_REVIEW.md § 3`). Proibição adicional, já congelada por domínio individual: nenhum domínio embute `User`/`Role` (Identity) ou `Organization` — sempre referência por id.

## 8. Riscos

| Risco | Classificação |
|---|---|
| `Marketing` posicionado **depois** de `Sales`/`Activity`/`Project` na cadeia de `DOMAIN_MODEL.md`, mas o fluxo de negócio esperado (leads alimentando Sales) exigiria a direção oposta — nenhuma fonte resolve essa contradição | **Alto** |
| `DomainEvent` como candidato a Published Language, mas sem payload real — qualquer relacionamento que dependa dele está bloqueado na prática, mesmo que corretamente modelado em teoria | **Alto** |
| `Platform/Engineering` introduzido como dono de objeto (`Release`) sem nenhuma Discovery, Bounded Context ou posição na cadeia de dependência — risco real de decisões futuras presumirem mais sobre esse domínio do que a decisão do CTO efetivamente definiu | **Alto** — achado desta revisão, parcialmente mitigado (ENG-0020): o mesmo risco para `CRM` foi resolvido por `ADR-0011`/`ADR-0012` |
| Relacionamentos candidatos (`Activity`, `Projects`, `Marketing`, `Financial`, `Analytics`) inferidos só pela posição na cadeia, nunca confirmados por fonte de negócio explícita | **Médio** |
| ~~`Knowledge` bloqueado impede qualquer avaliação real de relacionamento~~ — **Resolvido (ENG-0025, `ADR-0015`)**: `Knowledge` absorvido pela AI Transversal Intelligence Layer, não é mais um domínio bloqueado que possa propagar bloqueio a outros | **Médio → Resolvido** |
| Relação `Organization`↔`Financial` (`Subscription`) sem padrão DDD definido — risco de duas implementações futuras assumirem direções diferentes sem uma decisão explícita | **Médio** — novo, decorrente da mudança de posse de `Subscription` |
| Nenhum Domain Service ou Application Layer existe ainda para operacionalizar nenhum dos relacionamentos candidatos — todo relacionamento acima é conceitual, não codificado (exceto Shared Kernel, real) | **Baixo** — esperado nesta fase |

## 9. Itens Pendentes

- Resolver a contradição de posição de `Marketing` na cadeia (Risco Alto, § 8).
- Definir o padrão DDD exato da relação `Organization`↔`Financial` em torno de `Subscription` (não decidido pelo CTO, só a posse do objeto).
- Confirmar Bounded Context, linguagem ubíqua e posição na cadeia de `Platform/Engineering` — hoje só tem um objeto (`Release`) e um nome, nada mais. `CRM` removido deste item (ENG-0020) — resolvido: confirmado Product Layer, nunca terá Bounded Context (`ADR-0011`).
- Confirmar ou descartar cada relacionamento candidato via Discovery formal do domínio correspondente.
- Resolver o payload ausente de `DomainEvent` antes de qualquer Published Language real poder ser exercitada.
- ~~`Knowledge` — mesmo bloqueio de `IMPLEMENTATION_ROADMAP.md § 6`, Risco R5~~ — **Resolvido (ENG-0025, `ADR-0015`)**: absorvido pela AI Transversal Intelligence Layer. `IMPLEMENTATION_ROADMAP.md` em si não foi atualizado (fora de escopo de `ENG-0025`) — achado registrado em `ADR-0015`.

---

## Validações

- **Link Checker** (`-Root` explícito): ver ENG-0011 FINAL REPORT.
- **ARG (ENS-0002)**: N/A nos critérios de código; PASS nos demais.
- **Domain Model Validation**: nenhuma Entity/Aggregate/Value Object/Domain Event criado; todo relacionamento não confirmado por código real está explicitamente rotulado "candidato"; nenhuma proposta nova além da decisão já formalizada pelo CTO.

## Relação com Outros Módulos

- [DOMAIN_CANONICALIZATION.md](DOMAIN_CANONICALIZATION.md) (ENG-0010) — base da lista de contextos consolidados
- [DOMAIN_CONTEXT_MAP.md](DOMAIN_CONTEXT_MAP.md) (ENG-0009) — fonte da classificação estratégica original e dos Bounded Contexts candidatos
- [KERNEL_BOUNDARY_REVIEW.md](../../services/kernel/KERNEL_BOUNDARY_REVIEW.md) (ENG-0007) — confirmação de ausência de violação de dependência nos contextos reais
- [AUDIT_DOMAIN_DECISIONS.md](../../services/kernel/audit/AUDIT_DOMAIN_DECISIONS.md) — fonte do relacionamento ACL de Audit

## Status

🟢 Relacionamentos estratégicos mapeados (Missão ENG-0011), revisados para aplicar integralmente a decisão formal do CTO recebida durante a execução. Nenhum código ou contrato alterado. Nenhuma proposta ou decisão arquitetural nova criada por esta missão.
