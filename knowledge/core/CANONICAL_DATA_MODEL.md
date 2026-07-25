# CANONICAL_DATA_MODEL.md

Versão: 1.0

Status: Oficial

Autoridade: Chief System Architect

Escopo: modelo conceitual — nenhum SQL, nenhuma migration, nenhuma tabela criada. Fonte oficial para futura geração de banco.

---

## Nota de Método (leia antes de tudo)

1. **Exclusivamente objetos do BOM**: toda entidade abaixo é um dos objetos já catalogados em [BOM.md](BOM.md) — nenhuma entidade nova. A ordem cita `BUSINESS_OBJECT_MODEL.md`; o arquivo real é `BOM.md`.
2. **Grau de detalhe desigual, declarado**: 4 entidades (`Organization`, `User`, `Role`, `Permission`) já têm Object Specification em [objects/](objects/README.md) e recebem tratamento completo dos 18 campos abaixo. As ~65 restantes só têm, em qualquer documento oficial, nome + uma linha de definição + (para algumas) domínio e relacionamento. Tratá-las com o mesmo detalhe das 4 primeiras exigiria inventar atributos, cardinalidade, lifecycle e regras de negócio que ninguém decidiu — isso contrariaria [NOVARIS_CONSTITUTION.md Article V](NOVARIS_CONSTITUTION.md) (nenhuma entidade sem Object Specification) tanto quanto pular a etapa. Por isso a maioria aparece na tabela-índice (§ 4) com os campos que já são conhecidos e `TODO` explícito nos que não são — não um placeholder genérico "a definir" sem dizer o que falta.
3. **Campos 7 e 8 (Objetos Agregados / Objetos Raiz)**: nenhum documento anterior declara fronteiras de agregado (conceito de DDD). Onde a relação entre objetos já é conhecida (`BOM.md`, `objects/`), proponho uma leitura de agregado — marcada como **proposta**, não decisão — no § 5. Não proponho agregados para entidades sem relacionamento documentado.

---

## Padrões Canônicos Aplicáveis a Toda Entidade

Três dos 18 campos pedidos já são regra de plataforma, não específicos de cada entidade — declarados uma vez aqui em vez de repetidos 69 vezes:

| Campo | Regra Canônica | Fonte |
|---|---|---|
| **3. Chave Primária** | `id UUID`, gerado antes do insert quando aplicável | [DATABASE_ARCHITECTURE.md § 3](DATABASE_ARCHITECTURE.md) |
| **9. Ownership** | `organization_id` obrigatório em toda entidade que pertence a uma Organization, exceto objetos globais do Kernel | [DATABASE_ARCHITECTURE.md § 6](DATABASE_ARCHITECTURE.md), [NOVARIS_CONSTITUTION.md Article III](NOVARIS_CONSTITUTION.md) |
| **16. Versionamento** | Migration sequencial `NNNN_descricao.sql`, nunca reordenada após aplicada | [DATABASE_ARCHITECTURE.md § 17](DATABASE_ARCHITECTURE.md) |

Cada entidade abaixo referencia esta seção para os campos 3/9/16 em vez de repetir o texto.

---

## Entidades Detalhadas

### Organization

1. **Entidade oficial**: sim ([BOM.md § 4](BOM.md), Core Objects)
2. **Atributos principais**: id, slug, name, legal_name, document, email, phone, plan (Starter/Growth/Business/Enterprise), billing_status, trial_end, max_users, max_storage, storage_used, feature_flags, settings, metadata + timestamps ([objects/Organization.md](objects/Organization.md))
3. **Chave primária**: padrão canônico (UUID)
4. **Chaves estrangeiras**: nenhuma — é o topo da hierarquia de posse
5. **Cardinalidade**: 1 Organization → N Users, Teams, Pipelines, Dashboards, Projects, Campaigns, Assets, Files ([objects/Organization.md](objects/Organization.md))
6. **Dependências**: Identity, Authentication, Billing, Permissions, Storage, Audit, Feature Flags, Analytics ([objects/Organization.md](objects/Organization.md))
7. **Objetos agregados** *(proposta)*: Workspace, Team, Subscription, Environment — todos existem apenas no contexto de uma Organization
8. **Objeto raiz**: sim — raiz de todo o modelo multi-tenant
9. **Ownership**: padrão canônico — não se aplica a si mesma (é a origem do `organization_id`)
10. **Eventos gerados**: OrganizationCreated, OrganizationActivated, OrganizationUpdated, OrganizationSuspended, OrganizationPlanChanged, OrganizationBillingFailed, OrganizationArchived, OrganizationDeleted
11. **APIs consumidoras**: `GET/POST/PATCH/DELETE /organizations`, `/organizations/:id/suspend`, `/organizations/:id/activate`, `/organizations/:id/change-plan`
12. **Serviços consumidores**: todos os módulos de `services/` e todo domínio de negócio futuro — é o objeto mais referenciado da plataforma
13. **Domínio responsável**: Workspace ([DOMAIN_MODEL.md](DOMAIN_MODEL.md))
14. **Lifecycle**: Created → Pending Configuration → Active → Suspended → Archived → Deleted (Soft Delete)
15. **Estados**: ACTIVE, SUSPENDED, TRIAL, BLOCKED, ARCHIVED
16. **Versionamento**: padrão canônico
17. **Regras de consistência**: RN001-RN010 ([objects/Organization.md](objects/Organization.md)) — toda informação pertence a uma Organization; nenhuma consulta cruza organizações; RLS obrigatório
18. **Objetos derivados**: nenhum declarado

### User

1. **Entidade oficial**: sim ([BOM.md § 4](BOM.md), Core Objects)
2. **Atributos principais**: `TODO` — não definidos em nenhum documento ([objects/User.md](objects/User.md))
3. **Chave primária**: padrão canônico
4. **Chaves estrangeiras**: `organization_id` (Organization)
5. **Cardinalidade**: 1 Organization → N Users; N Users ↔ N Roles (via atribuição)
6. **Dependências**: `services/kernel/identity/`, `logging/`, `event-bus/` ([objects/User.md](objects/User.md))
7. **Objetos agregados** *(proposta)*: nenhum — User é folha, não agrega outros objetos
8. **Objeto raiz**: sim, dentro do sub-agregado de Identity
9. **Ownership**: padrão canônico
10. **Eventos gerados**: UserCreated, UserInvited, UserActivated, UserDisabled
11. **APIs consumidoras**: `getUser`, `verifyCredentials`, `createSession`, `revokeSession` ([services/kernel/identity/CONTRACT.md](../../services/kernel/identity/CONTRACT.md))
12. **Serviços consumidores**: `services/kernel/identity/`, todo módulo que precisa identificar "quem fez X"
13. **Domínio responsável**: Core (= Identity Domain) ([DOMAIN_MODEL.md](DOMAIN_MODEL.md))
14. **Lifecycle**: `TODO`
15. **Estados**: `TODO`
16. **Versionamento**: padrão canônico
17. **Regras de consistência**: `TODO`
18. **Objetos derivados**: `TODO`

### Role

1. **Entidade oficial**: sim ([BOM.md § 4](BOM.md), Core Objects)
2. **Atributos principais**: `TODO` ([objects/Role.md](objects/Role.md))
3. **Chave primária**: padrão canônico
4. **Chaves estrangeiras**: nenhuma direta — associação N:N com User via tabela de junção (não nomeada em nenhum documento)
5. **Cardinalidade**: N Roles ↔ N Users; 1 Role → N Permissions
6. **Dependências**: `services/kernel/identity/`, `roles/`
7. **Objetos agregados** *(proposta)*: nenhum — Role referencia Permission, não o contém
8. **Objeto raiz**: não — existe em função de User/Permission
9. **Ownership**: padrão canônico (aplicável se Roles forem por Organization; **requer decisão** se existem Roles globais da plataforma)
10. **Eventos gerados**: `TODO`
11. **APIs consumidoras**: `TODO`
12. **Serviços consumidores**: `services/kernel/roles/`
13. **Domínio responsável**: Core (= Identity Domain)
14. **Lifecycle**: `TODO`
15. **Estados**: `TODO`
16. **Versionamento**: padrão canônico
17. **Regras de consistência**: `TODO`
18. **Objetos derivados**: `TODO`

### Permission

1. **Entidade oficial**: sim ([BOM.md § 4](BOM.md), Core Objects)
2. **Atributos principais**: nome no formato `<domínio>.<recurso>.<ação>` (ex.: `crm.leads.read`) — demais atributos `TODO` ([objects/Permission.md](objects/Permission.md))
3. **Chave primária**: padrão canônico
4. **Chaves estrangeiras**: associação N:N com Role via tabela de junção (não nomeada)
5. **Cardinalidade**: N Permissions ↔ N Roles
6. **Dependências**: `services/kernel/identity/`, `permissions/`
7. **Objetos agregados** *(proposta)*: nenhum — é a unidade mínima
8. **Objeto raiz**: não
9. **Ownership**: **requer decisão** — se Permissions são globais da plataforma (catálogo fixo) ou definíveis por Organization
10. **Eventos gerados**: `TODO`
11. **APIs consumidoras**: `TODO`
12. **Serviços consumidores**: `services/kernel/permissions/`, `services/kernel/ai-runtime/` (validação antes de ação de IA, [NOVARIS_CONSTITUTION.md Article XII](NOVARIS_CONSTITUTION.md))
13. **Domínio responsável**: Core (= Identity Domain)
14. **Lifecycle**: `TODO`
15. **Estados**: `TODO`
16. **Versionamento**: padrão canônico
17. **Regras de consistência**: `TODO` — inclui a regra de resolução de conflito entre permissões concedidas e negadas, não definida em nenhum documento
18. **Objetos derivados**: `TODO`

---

## Índice Completo das Demais Entidades

Campos 3 (PK), 9 (Ownership) e 16 (Versionamento) seguem o padrão canônico para todas, salvo nota em contrário. Campos 2 (Atributos), 5 (Cardinalidade detalhada), 14 (Lifecycle), 15 (Estados) e 17 (Regras de consistência) são `TODO` para toda entidade abaixo — nenhum documento oficial os definiu ainda. As colunas mostram apenas o que já é conhecido.

### Core Objects (restantes)

| Entidade | Domínio (DOMAIN_MODEL) | Chaves Estrangeiras Conhecidas | Eventos Conhecidos | Objeto Raiz? |
|---|---|---|---|---|
| Workspace | Workspace | Organization | TODO | Não — sub-agregado de Organization |
| Team | Workspace | Organization | TODO | Não |
| Party | Relationship | TODO | TODO | Sim (proposta) — Person/External Organization são especializações |
| Person | Relationship | Party | TODO | Não — especialização de Party |
| External Organization | Relationship | Party | TODO | Não — especialização de Party |
| Relationship | Relationship | Party (origem e destino) | RelationshipCreated | Não |
| Document | *Sem domínio (ver UBIQUITOUS_LANGUAGE.md)* | TODO | TODO | TODO |
| File | *Sem domínio* | TODO | TODO | TODO |
| Asset | Marketing | TODO | TODO | TODO |
| Tag | *Sem domínio* | TODO | TODO | Não — sempre associada a outro objeto |
| CustomField | *Sem domínio* | TODO | TODO | Não |
| Activity | Activity | Party (implícito) | ActivityCreated, ActivityCompleted | Não |
| Task | Activity | User (implícito) | TODO | Não |
| Timeline | Activity | TODO | TODO | Não — projeção, não objeto primário (ver § Objetos Derivados) |
| Notification | *Sem domínio* | User (implícito) | TODO | Não |
| Comment | Activity | TODO (objeto comentado, polimórfico) | TODO | Não |

### Business Objects (restantes)

| Entidade | Domínio | Chaves Estrangeiras Conhecidas | Eventos Conhecidos | Objeto Raiz? |
|---|---|---|---|---|
| Opportunity | Sales | Party, Pipeline, Stage | OpportunityCreated, OpportunityWon, OpportunityLost | Sim (proposta) |
| Pipeline | Sales | TODO | TODO | Não |
| Stage | Sales | Pipeline | TODO | Não |
| Proposal | Sales | Opportunity | ProposalApproved | Não — agregado por Opportunity (proposta) |
| Contract | Sales | Opportunity | TODO | Não — agregado por Opportunity (proposta) |
| Invoice | Financial | TODO | InvoicePaid | TODO |
| Payment | Financial | Invoice | TODO | Não |
| Revenue | Sales | TODO | TODO | TODO |
| Expense | Financial | TODO | TODO | TODO |
| Subscription | Workspace *(também Financial em DOMAIN_MODEL — ver UBIQUITOUS_LANGUAGE.md)* | Organization | TODO | Não |
| Campaign | Marketing | TODO | TODO | TODO |
| Project | Projects | TODO | TODO | TODO |
| Sprint | Projects | Project | TODO | Não |
| Goal | *Sem domínio* | TODO | TODO | TODO |
| KPI | *Sem domínio* | TODO | TODO | TODO |
| Ticket | *Sem domínio* | TODO | TODO | TODO |
| Workflow | Automation | TODO | TODO | TODO |
| Automation | Automation | Workflow | WorkflowExecuted | Não |

### Intelligence Objects (restantes)

| Entidade | Domínio | Chaves Estrangeiras Conhecidas | Eventos Conhecidos | Objeto Raiz? |
|---|---|---|---|---|
| Agent | AI | TODO | AgentFinished | Sim (proposta) |
| Prompt | AI | Agent (implícito) | TODO | Não |
| Context | AI | Agent | TODO | Não |
| Memory | AI | Agent | TODO | Não |
| Knowledge Base | *Sem domínio* | TODO | TODO | TODO |
| Embedding | AI | TODO | TODO | Não |
| Tool | AI | Agent (implícito) | TODO | Não |
| Agent Execution | *Sem domínio* | Agent (implícito pelo nome) | TODO | Não |
| Decision | AI | Agent (implícito) | TODO | Não |
| Recommendation | AI | TODO | TODO | Não |
| Insight | AI | TODO | TODO | Não |

### Analytics Objects (restantes)

| Entidade | Domínio | Chaves Estrangeiras Conhecidas | Eventos Conhecidos | Objeto Raiz? |
|---|---|---|---|---|
| Metric | Analytics | Widget (implícito) | TODO | Não |
| Dashboard | Analytics | TODO | TODO | Sim (proposta) |
| Widget | Analytics | Dashboard | TODO | Não |
| Report | Analytics | TODO | TODO | TODO |
| Snapshot | Analytics | TODO | TODO | TODO |
| Forecast | Analytics | TODO | TODO | TODO |
| Benchmark | Analytics | TODO | TODO | TODO |

### System Objects (restantes)

| Entidade | Domínio | Chaves Estrangeiras Conhecidas | Eventos Conhecidos | Objeto Raiz? |
|---|---|---|---|---|
| API Key | Core (= Identity) | Organization ou User (não especificado) | TODO | Não |
| Webhook | System | Integration | TODO | Não |
| Integration | System | Organization (implícito) | TODO | Sim (proposta) |
| Secret | *Sem domínio* | TODO | TODO | TODO |
| Environment | Workspace | Organization | TODO | Não |
| Audit Log | System | TODO (polimórfico — referencia qualquer objeto) | TODO | Não — append-only, ver [DATABASE_ARCHITECTURE.md § 5](DATABASE_ARCHITECTURE.md) |
| Event Log | System | TODO | Todos os eventos do sistema | Não |
| Queue | Automation *(também System em DOMAIN_MODEL — ver UBIQUITOUS_LANGUAGE.md)* | TODO | TODO | TODO |
| Job | System | Queue | TODO | Não |
| Schedule | *Sem domínio* | TODO | TODO | TODO |
| Feature Flag | System | Organization | TODO | Não |
| Migration | System | TODO | TODO | TODO |
| Release | Projects *(também System em DOMAIN_MODEL — ver UBIQUITOUS_LANGUAGE.md)* | TODO | TODO | TODO |

---

## Objetos Derivados (proposta, não decisão)

Nenhum documento anterior declara objetos derivados explicitamente. Candidatos identificáveis pela própria definição em `BOM.md`:

- **Timeline** — "linha do tempo consolidada dos eventos de um objeto" ([BOM.md](BOM.md)) é, pela própria definição, uma projeção de `Activity`/eventos, não um registro primário independente.
- **Snapshot** — "estado consolidado em determinado momento" ([BOM.md](BOM.md)) é, pela própria definição, derivado do estado de outro objeto num instante.
- **Event Log** — registro cru dos eventos publicados no Event Bus; derivado por definição, não primário.

Os demais 66 objetos são tratados como primários até decisão em contrário.

---

## Relação com Outros Módulos

- [BOM.md](BOM.md) — catálogo de origem de toda entidade
- [objects/](objects/README.md) — especificação individual completa, quando existir
- [DOMAIN_MODEL.md](DOMAIN_MODEL.md) — atribuição de domínio usada na coluna "Domínio"
- [UBIQUITOUS_LANGUAGE.md](UBIQUITOUS_LANGUAGE.md) — dicionário de termos; mesma base de entidades, foco em uso da linguagem em vez de modelo de dados
- [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) — convenções físicas (naming, RLS, migrations) que este modelo conceitual antecede
- [services/kernel/](../../services/kernel/README.md) — módulos que implementam parte das entidades de Core Objects
- [services/domains/](../../services/domains/README.md) — bounded contexts que implementam as entidades de Business Objects; a coluna "Domínio" usa os nomes de `DOMAIN_MODEL.md` (ex.: `Relationship`), enquanto o bounded context correspondente em `services/domains/` chama-se `customer` — ver [ADR-0007](../../adr/ADR-0007-domain-boundaries.md)

## Status

🟢 Oficial (v1.0). 4 entidades com os 18 campos completos (`Organization`, `User`, `Role`, `Permission`); ~65 entidades na tabela-índice, com apenas o que já é conhecido — a maioria dos campos por entidade fica `TODO` explícito, não inventado. Objetos agregados/raiz são proposta, não decisão registrada.
