# UBIQUITOUS_LANGUAGE.md

Versão: 1.0

Status: Oficial

Autoridade: Chief System Architect

Escopo: dicionário de termos oficiais da plataforma NOVARIS. Nenhum objeto novo é criado aqui — todo termo é um dos já catalogados em [BOM.md](BOM.md), por restrição explícita da ordem de missão.

---

## Nota de Método (leia antes de tudo)

1. **Nenhum objeto novo**: todo termo abaixo já existe em `BOM.md`. Onde `DOMAIN_MODEL.md` nomeia um objeto que **não** está em `BOM.md` (ex.: `Epic`, `Story`, `Contact`, `Quotation`, `Milestone`, `Knowledge`, `Article`, `Playbook`, `Manual`, `Specification`, `ADR`, `Calendar Event`, `Reminder`, `Checklist`, `Landing Page`, `Template`, `Content`, `Audience`, `Commission`, `Health Check`, `Execution`, `Trigger`, `Action`, `Condition`, `Contact`, `Address`, `Phone`, `Email`, `Social Profile`, `IdentityProvider`, `Token`, `Session`, `Plan`, `Billing`, `Storage`), esse nome **não** vira termo aqui — ficaria fora da restrição da ordem de missão. Isso significa que alguns domínios de `DOMAIN_MODEL.md` ficam com poucos termos, ou nenhum (ver Domínio Knowledge, abaixo).
2. **"Core" vs. "Identity"**: a ordem de missão pede o domínio "Core"; `DOMAIN_MODEL.md` não tem domínio chamado "Core" — tem "Identity Domain" na mesma posição (primeiro, sob o Kernel). Trato "Core" como o mesmo que "Identity Domain". Não confundir com a categoria "Core Objects" do BOM, que é mais ampla (20 objetos, vários já alocados em outros domínios abaixo).
3. **Duplicatas entre domínios**: `DOMAIN_MODEL.md` lista `Task` em Activity **e** Project, `Queue` em Automation **e** System, `Subscription` em Workspace **e** Financial, `Release` em Project **e** System — a mesma violação da própria regra do documento já registrada em `PROJECT_RULES.md`. Cada termo abaixo aparece **uma vez**, no domínio mais específico; a duplicata original fica anotada na linha.
4. **Objetos do BOM sem domínio em `DOMAIN_MODEL.md`**: `Document`, `File`, `Tag`, `CustomField`, `Notification`, `Goal`, `KPI`, `Ticket`, `Knowledge Base`, `Agent Execution`, `Secret`, `Schedule` não aparecem em nenhum dos 13 domínios de `DOMAIN_MODEL.md`. Ficam em "Sem Domínio Atribuído" no final — não inventei um domínio para eles.
5. **Campos `Quando Utilizar`, `Quando Não Utilizar` e `Sinônimos Proibidos`**: nenhum documento oficial define uso linguístico termo a termo. Preenchidos apenas onde uma fonte já oficial permite (ex.: a seção "Não é Responsabilidade" de `objects/Organization.md`); nos demais, ficam `TODO` explícito — inventar regra de uso da palavra sem base seria fabricar convenção, não documentá-la.
6. **Campos `Objetos/Eventos/APIs Relacionados`**: preenchidos com o que já é oficial em `BOM.md`, `objects/` e `services/*/CONTRACT.md`; `TODO` onde nada foi definido ainda.

---

## Domínio: Core (= Identity Domain)

Responsabilidade do domínio ([DOMAIN_MODEL.md](DOMAIN_MODEL.md)): usuários, autenticação, autorização, perfis, roles, permissões, sessões, tokens, SSO, MFA, audit login.

| Nome Oficial | Definição | Quando Utilizar | Quando Não Utilizar | Sinônimos Proibidos | Objetos Relacionados | Eventos Relacionados | APIs Relacionadas |
|---|---|---|---|---|---|---|---|
| **User** | Representa um usuário autenticado ([BOM.md](BOM.md)) | Para a pessoa que acessa o sistema com credenciais próprias | Não usar para `Person`/`Party` (contato de negócio sem login) | `Usuário` (traduzido) é aceitável em prosa; `Cliente`, `Conta` são proibidos como sinônimo | Organization, Roles, Teams, Tasks, Activities | UserCreated, UserInvited, UserActivated, UserDisabled | [services/kernel/identity/CONTRACT.md](../../services/kernel/identity/CONTRACT.md) |
| **Role** | Define funções e permissões ([BOM.md](BOM.md)) | Para o agrupamento nomeado de permissões atribuível a um User | Não usar para uma permissão individual | `Perfil de acesso`, `Grupo` são proibidos como sinônimo | User, Permission | RoleCreated, RoleAssignedToUser, RoleRevokedFromUser | [services/kernel/identity/CONTRACT.md](../../services/kernel/identity/CONTRACT.md) — implementado como Aggregate dentro de Identity, não em `services/kernel/roles/` (scaffolding sem capacidade própria, `KERNEL_BOUNDARY_REVIEW.md`, ENG-0007/0008) |
| **Permission** | Representa uma permissão granular, formato `<domínio>.<recurso>.<ação>` ([BOM.md](BOM.md)) | Para uma ação autorizável individual | Não usar como sinônimo de `Role` | `Direito`, `Acesso` são proibidos como sinônimo | Role | PermissionGrantedToRole, PermissionRevokedFromRole | [services/kernel/identity/CONTRACT.md](../../services/kernel/identity/CONTRACT.md) — implementado como Value Object dentro de Identity, não em `services/kernel/permissions/` (encerrado sem capacidade própria, `PERMISSION_EPIC_CLOSURE.md`, EPIC-004) |
| **API Key** | Credencial de integração ([BOM.md](BOM.md)) | Para autenticação de sistema-a-sistema, sem usuário humano | Não usar para sessão de usuário (ver `User`) | `Token de API` é aceitável; `Senha` é proibido | TODO | TODO | TODO |

> 📖 **Modelagem de domínio completa** (Bounded Context, Aggregates, Value Objects, Domain Events e casos de uso propostos, incluindo os termos `Session`/`IdentityProvider`/`Token` — hoje fora deste dicionário por não estarem em `BOM.md`): [services/kernel/identity/IDENTITY_DOMAIN_MODEL.md](../../services/kernel/identity/IDENTITY_DOMAIN_MODEL.md) (Missão ENG-0002.1). Esta tabela continua a fonte canônica dos termos já oficiais.

## Domínio: Workspace

Responsabilidade do domínio: organizações, times, espaços, configurações, branding, planos, billing, storage, feature flags.

| Nome Oficial | Definição | Quando Utilizar | Quando Não Utilizar | Sinônimos Proibidos | Objetos Relacionados | Eventos Relacionados | APIs Relacionadas |
|---|---|---|---|---|---|---|---|
| **Organization** | Empresa, unidade empresarial ou cliente (SaaS Tenant); mecanismo central de isolamento multi-tenant ([objects/Organization.md](objects/Organization.md)) | Para o tenant — toda informação pertence a uma Organization | Não usar `Organization` para times internos dentro do tenant (ver `Team`) nem para empresas externas de contato (ver `External Organization`) | `Empresa`, `Conta`, `Tenant` são proibidos como sinônimo em documentação técnica — usar sempre `Organization` | Users, Teams, Pipelines, Dashboards, Projects, Campaigns, Assets, Files, CRM, AI, Automation, Financial, Marketplace, Knowledge, Analytics ([objects/Organization.md](objects/Organization.md)) | OrganizationCreated, OrganizationActivated, OrganizationUpdated, OrganizationSuspended, OrganizationPlanChanged, OrganizationBillingFailed, OrganizationArchived, OrganizationDeleted | POST/GET/PATCH/DELETE `/organizations`, `/organizations/:id/suspend`, `/organizations/:id/activate`, `/organizations/:id/change-plan` ([objects/Organization.md](objects/Organization.md)) |
| **Workspace** | Ambiente lógico de trabalho dentro de uma organização ([BOM.md](BOM.md)) | Para subdivisão interna de uma Organization | Não confundir com a própria `Organization` | `Espaço` é aceitável em prosa; `Tenant` é proibido | Organization | TODO | TODO |
| **Team** | Agrupamento de usuários ([BOM.md](BOM.md)) | Para conjunto de Users dentro de uma Organization/Workspace | Não usar como sinônimo de `Role` (Team agrupa pessoas, Role agrupa permissões) | `Grupo` é proibido como sinônimo | User, Organization | TODO | TODO |
| **Subscription** *(também citado em Financial por `DOMAIN_MODEL.md` — tratado aqui)* | Assinatura ([BOM.md](BOM.md)) | Para o vínculo de uma Organization a um plano pago | Não usar para o pagamento individual (ver `Payment`, domínio Financial) | `Plano` é aceitável para o nível contratado; `Fatura` é proibido como sinônimo | Organization | TODO | TODO |
| **Environment** | Ambiente de execução ([BOM.md](BOM.md)) | Para contexto técnico de execução (produção, staging) de uma Organization | Não usar para `Workspace` (que é organizacional, não técnico) | TODO | TODO | TODO | TODO |

## Domínio: Relationship

Responsabilidade do domínio: pessoas, empresas, relacionamentos, contatos, interações.

| Nome Oficial | Definição | Quando Utilizar | Quando Não Utilizar | Sinônimos Proibidos | Objetos Relacionados | Eventos Relacionados | APIs Relacionadas |
|---|---|---|---|---|---|---|---|
| **Party** | Entidade de negócio (pessoa ou organização) que pode participar de processos ([BOM.md](BOM.md)) | Como termo genérico ao referir-se a `Person` ou `External Organization` indistintamente | Não usar quando já se sabe se é `Person` ou `External Organization` — usar o específico | `Contato` é proibido como sinônimo de `Party` (ver Nota de Método § 1 — `Contact` não é objeto do BOM) | Person, External Organization, Relationship | RelationshipCreated (via `Relationship`, `DOMAIN_MODEL.md § EVENT BUS`) | TODO |
| **Person** | Pessoa física ([BOM.md](BOM.md)) | Especialização de `Party` para indivíduo | Não usar para `User` (que é a conta de acesso, não a pessoa de negócio) | `Cliente`, `Lead` são proibidos como sinônimo de `Person` em nível de objeto — são conceitos de domínio de negócio (fora de escopo desta missão) | Party | TODO | TODO |
| **External Organization** | Empresa externa (cliente, fornecedor, parceiro etc.) ([BOM.md](BOM.md)) | Especialização de `Party` para pessoa jurídica externa | Não confundir com `Organization` (o tenant da plataforma) | `Empresa` isolado é ambíguo — usar sempre `External Organization` ou `Organization`, nunca só "empresa" | Party | TODO | TODO |
| **Relationship** | Vínculo entre Parties (Cliente, Fornecedor, Parceiro, Prospect, Investidor, Colaborador) ([BOM.md](BOM.md)) | Para o vínculo em si, com seu tipo | Não usar como sinônimo de `Party` | TODO | Party | RelationshipCreated | TODO |

## Domínio: Sales

Responsabilidade do domínio: oportunidades, pipelines, etapas, negociação, propostas, contratos, receitas.

| Nome Oficial | Definição | Quando Utilizar | Quando Não Utilizar | Sinônimos Proibidos | Objetos Relacionados | Eventos Relacionados | APIs Relacionadas |
|---|---|---|---|---|---|---|---|
| **Opportunity** | Oportunidade comercial ([BOM.md](BOM.md)) | Para negociação em andamento com um Party | Não usar após fechamento — nesse ponto vira `Contract`/`Revenue` | `Negócio`, `Deal` são aceitáveis em prosa; `Lead` é proibido como sinônimo (Lead é um conceito de CRM fora do escopo desta missão) | Party, Pipeline, Stage, Activities, Tasks, Proposal, Contract | OpportunityCreated, OpportunityWon, OpportunityLost | TODO |
| **Pipeline** | Fluxo de trabalho configurável ([BOM.md](BOM.md)) | Para a sequência de Stages que uma Opportunity percorre | Não usar como sinônimo de `Workflow` (Automation Domain) — `Pipeline` é específico de Sales | TODO | Opportunity, Stage | TODO | TODO |
| **Stage** | Etapa de um Pipeline ([BOM.md](BOM.md)) | Para uma etapa nomeada dentro de um Pipeline | Não usar isolado de um Pipeline | `Fase` é proibido como sinônimo (usado para outras estruturas, ex. fases de implementação) | Pipeline | TODO | TODO |
| **Proposal** | Proposta comercial ([BOM.md](BOM.md)) | Para documento formal de oferta a um Party | Não usar como sinônimo de `Contract` (que é o vínculo já fechado) | `Orçamento` é proibido como sinônimo | Opportunity | ProposalApproved | TODO |
| **Contract** | Contrato ([BOM.md](BOM.md)) | Para o vínculo formal já fechado | Não usar antes do fechamento — nesse estágio é `Opportunity`/`Proposal` | TODO | Opportunity | TODO | TODO |
| **Revenue** | Receita ([BOM.md](BOM.md)) | Para valor reconhecido de negócio fechado | Não usar como sinônimo de `Payment` (que é o recebimento em si, domínio Financial) | `Faturamento` é proibido como sinônimo isolado | TODO | TODO | TODO |

## Domínio: Activity

Responsabilidade do domínio: agenda, atividades, tarefas, calendário, follow-up, timeline.

| Nome Oficial | Definição | Quando Utilizar | Quando Não Utilizar | Sinônimos Proibidos | Objetos Relacionados | Eventos Relacionados | APIs Relacionadas |
|---|---|---|---|---|---|---|---|
| **Activity** | Registro de interação (ligação, WhatsApp, e-mail, reunião, visita, nota) ([BOM.md](BOM.md)) | Para qualquer interação registrada com um Party | Não usar como sinônimo de `Task` (Activity é registro passado, Task é trabalho pendente) | TODO | Timeline, Comment | ActivityCreated, ActivityCompleted | TODO |
| **Task** *(também citado em Projects por `DOMAIN_MODEL.md` — tratado aqui como a unidade operacional; ver nota em Projects)* | Tarefa operacional, estados Pending/In Progress/Completed/Cancelled ([BOM.md](BOM.md)) | Para trabalho pendente atribuído a um User | Não usar para o nível `Task` da hierarquia de backlog `Epic→Feature→Story→Task→Subtask` de `BACKLOG.md` sem checar se é o mesmo conceito — ver `BOM.md` nota de sobreposição não resolvida | TODO | User | TODO | TODO |
| **Timeline** | Linha do tempo consolidada dos eventos de um objeto ([BOM.md](BOM.md)) | Para visão cronológica agregada | Não usar como um objeto persistente próprio — é uma projeção de outros eventos | TODO | Activity | TODO | TODO |
| **Comment** | Comentário associado a qualquer objeto ([BOM.md](BOM.md)) | Para anotação livre em qualquer objeto do sistema | TODO | TODO | TODO | TODO | TODO |

## Domínio: Projects

Responsabilidade do domínio: projetos, sprint, roadmap, backlog, kanban.

| Nome Oficial | Definição | Quando Utilizar | Quando Não Utilizar | Sinônimos Proibidos | Objetos Relacionados | Eventos Relacionados | APIs Relacionadas |
|---|---|---|---|---|---|---|---|
| **Project** | Projeto ([BOM.md](BOM.md)) | Para iniciativa com escopo e prazo delimitados | Não usar como sinônimo do produto "NOVARIS Projects" (`PRODUCTS.md`) — ver nota de possível colisão em `BOM.md` | TODO | TODO | TODO | TODO |
| **Sprint** | Sprint de desenvolvimento ([BOM.md](BOM.md)) | Para ciclo de entrega de um Project | Não usar como sinônimo de `SPRINT_TEMPLATE.md` (`.command-center/`) sem checar se é o mesmo conceito de planejamento de engenharia ou de execução de projeto de cliente | TODO | Project | TODO | TODO |
| **Release** *(também citado em System por `DOMAIN_MODEL.md` — tratado aqui)* | Versão da plataforma ([BOM.md](BOM.md)) | Para uma versão publicada, de produto ou de projeto de cliente | TODO | TODO | TODO | TODO | TODO |

`Task` já coberto em Activity (acima) — `DOMAIN_MODEL.md` o lista também aqui; não duplicado nesta tabela.

## Domínio: Marketing

Responsabilidade do domínio: campanhas, landing pages, SEO, conteúdo, social media.

| Nome Oficial | Definição | Quando Utilizar | Quando Não Utilizar | Sinônimos Proibidos | Objetos Relacionados | Eventos Relacionados | APIs Relacionadas |
|---|---|---|---|---|---|---|---|
| **Campaign** | Campanha ([BOM.md](BOM.md)) | Para iniciativa de marketing com início/fim | TODO | TODO | TODO | TODO | TODO |
| **Asset** | Recurso digital ([BOM.md](BOM.md)) | Para arquivo de mídia reutilizável (imagem, vídeo, template) | Não usar como sinônimo de `File` (Core Objects — arquivo genérico armazenado, sem conotação de marketing) | TODO | TODO | TODO | TODO |

`Landing Page`, `Template`, `Content`, `Audience` — nomeados em `DOMAIN_MODEL.md § MARKETING DOMAIN`, mas não são objetos do BOM (ver Nota de Método § 1). Não viram termo aqui.

## Domínio: Knowledge

Responsabilidade do domínio (`DOMAIN_MODEL.md`): documentação, wiki, playbooks, artigos.

⚠️ **Nenhum termo**: os objetos que `DOMAIN_MODEL.md` atribui a este domínio (`Knowledge`, `Article`, `Playbook`, `Manual`, `Specification`, `ADR`) não existem em `BOM.md` sob esses nomes. O objeto mais próximo do BOM é `Knowledge Base` (Intelligence Objects), que `DOMAIN_MODEL.md` não lista em nenhum domínio — ver "Sem Domínio Atribuído" abaixo. Não inventei um mapeamento para preencher esta seção.

## Domínio: AI

Responsabilidade do domínio: agentes, prompts, contexto, memória, ferramentas, embeddings.

| Nome Oficial | Definição | Quando Utilizar | Quando Não Utilizar | Sinônimos Proibidos | Objetos Relacionados | Eventos Relacionados | APIs Relacionadas |
|---|---|---|---|---|---|---|---|
| **Agent** | Agente de IA ([BOM.md](BOM.md)) | Para um agente configurado e executável | TODO | `Bot` é proibido como sinônimo | Prompt, Tool, Memory, Context | AgentFinished | TODO |
| **Prompt** | Prompt versionado ([BOM.md](BOM.md)) | Para instrução de IA versionada e reutilizável | TODO | TODO | Agent | TODO | TODO |
| **Context** | Contexto utilizado por agentes ([BOM.md](BOM.md)) | Para o conjunto de informação fornecida a um Agent numa execução | Não usar como sinônimo de `Memory` (Context é a informação da execução atual; Memory persiste entre execuções) | TODO | Agent, Memory | TODO | TODO |
| **Memory** | Memória persistente ([BOM.md](BOM.md)) | Para informação retida entre execuções de um Agent | TODO | TODO | Agent, Context | TODO | TODO |
| **Embedding** | Representação vetorial ([BOM.md](BOM.md)) | Para representação numérica usada em busca semântica | TODO | TODO | TODO | TODO | TODO |
| **Tool** | Ferramenta disponível para agentes ([BOM.md](BOM.md)) | Para uma capacidade que um Agent pode invocar | TODO | TODO | Agent | TODO | TODO |
| **Decision** | Decisão tomada por IA ou regras ([BOM.md](BOM.md)) | Para o registro de uma decisão automatizada, exigido por [NOVARIS_CONSTITUTION.md Article XII](NOVARIS_CONSTITUTION.md) | TODO | TODO | Agent | TODO | TODO |
| **Recommendation** | Sugestão gerada ([BOM.md](BOM.md)) | Para output de IA que não é aplicado automaticamente, requer ação humana | Não usar como sinônimo de `Decision` (Decision já foi tomada; Recommendation aguarda decisão) | TODO | TODO | TODO | TODO |
| **Insight** | Conclusão baseada em dados ([BOM.md](BOM.md)) | Para achado analítico, não necessariamente acionável | TODO | TODO | TODO | TODO | TODO |

`Agent Execution` (Intelligence Object do BOM) não aparece na lista de objetos de AI Domain em `DOMAIN_MODEL.md` — ver "Sem Domínio Atribuído".

## Domínio: Automation

Responsabilidade do domínio: workflows, triggers, queues, execuções.

| Nome Oficial | Definição | Quando Utilizar | Quando Não Utilizar | Sinônimos Proibidos | Objetos Relacionados | Eventos Relacionados | APIs Relacionadas |
|---|---|---|---|---|---|---|---|
| **Workflow** | Fluxo automatizado ([BOM.md](BOM.md)) | Para a definição de um processo automatizável | Não usar como sinônimo de `Pipeline` (Sales) | TODO | Automation | WorkflowExecuted | TODO |
| **Automation** | Automação executável ([BOM.md](BOM.md)) | Para a instância executável de um Workflow | TODO | TODO | Workflow | TODO | TODO |
| **Queue** *(também citado em System por `DOMAIN_MODEL.md` — tratado aqui)* | Fila de processamento ([BOM.md](BOM.md)) | Para fila de execução assíncrona de Automation/Job | TODO | TODO | Automation, Job | TODO | TODO |

## Domínio: Financial

Responsabilidade do domínio: receitas, despesas, pagamentos, faturamento.

| Nome Oficial | Definição | Quando Utilizar | Quando Não Utilizar | Sinônimos Proibidos | Objetos Relacionados | Eventos Relacionados | APIs Relacionadas |
|---|---|---|---|---|---|---|---|
| **Invoice** | Documento financeiro ([BOM.md](BOM.md)) | Para cobrança formal emitida | TODO | TODO | Payment | InvoicePaid | TODO |
| **Expense** | Despesa ([BOM.md](BOM.md)) | Para saída financeira registrada | TODO | TODO | TODO | TODO | TODO |
| **Payment** | Pagamento ([BOM.md](BOM.md)) | Para o recebimento/liquidação de um Invoice | Não usar como sinônimo de `Revenue` (Sales) — Payment é o evento financeiro, Revenue é o reconhecimento contábil | TODO | Invoice | TODO | TODO |

`Subscription` já coberto em Workspace (acima) — `DOMAIN_MODEL.md` o lista também aqui; não duplicado. `Billing`, `Commission` — nomeados em `DOMAIN_MODEL.md § FINANCIAL DOMAIN`, não são objetos do BOM.

## Domínio: Analytics

Responsabilidade do domínio: KPIs, métricas, dashboards, forecast.

| Nome Oficial | Definição | Quando Utilizar | Quando Não Utilizar | Sinônimos Proibidos | Objetos Relacionados | Eventos Relacionados | APIs Relacionadas |
|---|---|---|---|---|---|---|---|
| **Dashboard** | Painel ([BOM.md](BOM.md)) | Para composição visual de Widgets | TODO | TODO | Widget | TODO | TODO |
| **Widget** | Componente visual ([BOM.md](BOM.md)) | Para elemento individual dentro de um Dashboard | Não usar isolado de um Dashboard | TODO | Dashboard, Metric | TODO | TODO |
| **Metric** | Métrica individual ([BOM.md](BOM.md)) | Para valor quantitativo mensurável | Não usar como sinônimo de `KPI` (Business Object, sem domínio atribuído — ver abaixo) sem checar se é o mesmo conceito | TODO | Widget | TODO | TODO |
| **Report** | Relatório ([BOM.md](BOM.md)) | Para documento consolidado, geralmente exportável | TODO | TODO | TODO | TODO | TODO |
| **Snapshot** | Estado consolidado em determinado momento ([BOM.md](BOM.md)) | Para captura pontual de dados para histórico/auditoria analítica | TODO | TODO | TODO | TODO | TODO |
| **Forecast** | Projeção ([BOM.md](BOM.md)) | Para estimativa de valor futuro | TODO | TODO | TODO | TODO | TODO |
| **Benchmark** | Comparação de desempenho ([BOM.md](BOM.md)) | Para comparação entre organizações/períodos | TODO | TODO | TODO | TODO | TODO |

## Domínio: System

Responsabilidade do domínio: logs, integrações, eventos, deploy, observabilidade.

| Nome Oficial | Definição | Quando Utilizar | Quando Não Utilizar | Sinônimos Proibidos | Objetos Relacionados | Eventos Relacionados | APIs Relacionadas |
|---|---|---|---|---|---|---|---|
| **Audit Log** | Registro imutável de auditoria ([BOM.md](BOM.md)) | Para toda alteração relevante, conforme [DATABASE_ARCHITECTURE.md § 5](DATABASE_ARCHITECTURE.md) | Não usar como sinônimo de `Event Log` (Audit Log é sobre "quem mudou o quê"; Event Log é sobre "o que aconteceu no sistema") | TODO | TODO | TODO | [services/kernel/audit/CONTRACT.md](../../services/kernel/audit/CONTRACT.md) |
| **Event Log** | Histórico de eventos ([BOM.md](BOM.md)) | Para o registro cru de eventos publicados no Event Bus | TODO | TODO | TODO | Todos os eventos do sistema | [services/kernel/event-bus/CONTRACT.md](../../services/kernel/event-bus/CONTRACT.md) |
| **Integration** | Integração com sistemas terceiros ([BOM.md](BOM.md)) | Para conexão configurada com sistema externo | TODO | TODO | TODO | TODO | TODO — ver `services/kernel/integration-hub/README.md` |
| **Webhook** | Evento externo ([BOM.md](BOM.md)) | Para notificação recebida de/enviada a sistema externo | Não usar como sinônimo de `Event` interno (Webhook cruza a fronteira da plataforma) | TODO | Integration | TODO | TODO |
| **Job** | Execução assíncrona ([BOM.md](BOM.md)) | Para unidade de trabalho em background | TODO | TODO | Queue | TODO | TODO |
| **Migration** | Registro de evolução do banco ([BOM.md](BOM.md)) | Ver [DATABASE_ARCHITECTURE.md § 17](DATABASE_ARCHITECTURE.md) | TODO | TODO | TODO | TODO | TODO |
| **Feature Flag** | Controle de funcionalidades ([BOM.md](BOM.md)) | Para habilitar/desabilitar funcionalidade por Organization/plano | TODO | TODO | Organization | TODO | TODO |

`Queue` já coberto em Automation (acima); `Release` já coberto em Projects (acima) — `DOMAIN_MODEL.md` os lista também aqui; não duplicados. `Health Check` — nomeado em `DOMAIN_MODEL.md § SYSTEM DOMAIN`, não é objeto do BOM.

---

## Sem Domínio Atribuído

Objetos oficiais do BOM que `DOMAIN_MODEL.md` não atribui a nenhum dos 13 domínios. Não inventei domínio para eles.

| Nome Oficial | Definição | Categoria BOM |
|---|---|---|
| **Document** | Documento de negócio ([BOM.md](BOM.md)) | Core Objects |
| **File** | Arquivo armazenado ([BOM.md](BOM.md)) | Core Objects |
| **Tag** | Etiqueta reutilizável ([BOM.md](BOM.md)) | Core Objects |
| **CustomField** | Campo personalizado ([BOM.md](BOM.md)) | Core Objects |
| **Notification** | Mensagem enviada ao usuário ([BOM.md](BOM.md)) | Core Objects |
| **Goal** | Meta ([BOM.md](BOM.md)) | Business Objects |
| **KPI** | Indicador ([BOM.md](BOM.md)) | Business Objects |
| **Ticket** | Chamado ou solicitação ([BOM.md](BOM.md)) | Business Objects |
| **Knowledge Base** | Base de conhecimento ([BOM.md](BOM.md)) | Intelligence Objects |
| **Agent Execution** | Histórico de execução de um agente ([BOM.md](BOM.md)) | Intelligence Objects |
| **Secret** | Segredo criptografado ([BOM.md](BOM.md)) | System Objects |
| **Schedule** | Agendamento ([BOM.md](BOM.md)) | System Objects |

Todos os demais campos (Responsabilidade, Quando Utilizar, etc.) ficam `TODO` para estes 12 termos, além do próprio domínio.

---

## Relação com Outros Módulos

- [BOM.md](BOM.md) — catálogo de origem de todo termo aqui
- [DOMAIN_MODEL.md](DOMAIN_MODEL.md) — organização por domínio; ver notas de duplicata e de objetos não mapeados
- [objects/](objects/README.md) — especificação individual completa, quando existir, de cada termo
- [services/domains/](../../services/domains/README.md) — bounded contexts técnicos; "Domínio: Relationship" abaixo corresponde a `services/domains/customer/` (nome de bounded context, ver [ADR-0007](../../adr/ADR-0007-domain-boundaries.md))
- [PROJECT_RULES.md](../../PROJECT_RULES.md) — registro desta missão e das lacunas encontradas

## Status

🟢 Oficial (v1.0). 57 termos cobertos (dos ~69 do BOM), organizados em 13 domínios (1 vazio — Knowledge) + 12 sem domínio atribuído. Campos `Quando Utilizar`/`Quando Não Utilizar`/`Sinônimos Proibidos` majoritariamente `TODO` — nenhuma convenção de uso foi inventada sem base em documento já oficial.
