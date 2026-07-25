# Core — Documentos Imutáveis

## Objetivo

Reunir os documentos que servem como fonte oficial e estável da identidade institucional da NOVARIS — o que muda raramente e, quando muda, muda por decisão deliberada da liderança, nunca como efeito colateral de outra tarefa.

## Escopo

Identidade da empresa, visão de longo prazo, manifesto de convicções, a Constituição detalhada da NOVARIS, cultura e princípios transversais de decisão.

## Responsabilidades

Mantido exclusivamente pela liderança da NOVARIS. Diferente dos demais domínios de `knowledge/`, este não é alimentado por decisões de rotina.

## Relação com Outros Módulos

- [NOVARIS_OS.md](NOVARIS_OS.md) — **fonte oficial da visão da plataforma** (v1.0.0, Oficial, Julho/2026); toda decisão arquitetural deve respeitar este documento
- [CONSTITUTION.md](CONSTITUTION.md) — 🟢 **Oficial (v1.1.0)**. Desde a Emenda nº 1, é a fonte **detalhada e vinculante** das regras da NOVARIS; 23 Artigos com conteúdo real (não é mais esqueleto). Confirmada como a **única autoridade constitucional ativa** da plataforma por [ADR-0008](../../adr/ADR-0008-foundation-freeze.md) (Missão ENG-0000.5, Foundation Freeze). Emendada (Artigos 2, 4, 20) por [ADR-0022](../../adr/ADR-0022-constitution-knowledge-cycle-amendment.md) — identidade oficial do produto, Visão combinada e "Knowledge Driven Engineering"/"Ciclo do Conhecimento".
- [PROJECT_RULES.md](../../PROJECT_RULES.md) — resumo executivo e índice na raiz do repositório; regra vigente enquanto os capítulos de `constitution.md` estiverem `TODO` (ver Cláusula de Transição lá); ver também a nota de conflito com `NOVARIS_OS.md § 13` sobre stack tecnológica
- [docs/00-visao-geral/](../../docs/00-visao-geral/README.md) — camada de documentação/apresentação construída a partir do que está aqui
- [NES/README.md](../../NES/README.md) — NOVARIS Engineering System, "Documento Mestre de Engenharia"; migrou para pasta própria na raiz ("Ordem de Missão NES-001") e não vive mais aqui. Contradiz e sobrepõe documentos de governança já existentes; ver nota de conflitos em [PROJECT_RULES.md](../../PROJECT_RULES.md).

## Conteúdo

- [NOVARIS_OS.md](NOVARIS_OS.md) — 🟢 **Oficial (v1.1.0)**. Documento central com conteúdo real e vinculante — não é esqueleto. §§ 1, 3, 20 anotadas (não reescritas) por [ADR-0023](../../adr/ADR-0023-company-identity-statement-consolidation.md) — `CONSTITUTION.md` prevalece em caso de divergência de identidade/visão. Ver nota de conflitos de governança em [PROJECT_RULES.md](../../PROJECT_RULES.md).
- [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md) — princípios de engenharia (12 tópicos, estrutura criada, conteúdo `TODO`); detalha o que `constitution.md § Regras de Engenharia` resume; ver também `NOVARIS_OS.md § 14`
- [BUSINESS_MODEL.md](BUSINESS_MODEL.md) — modelo de negócio (12 capítulos, estrutura criada, conteúdo `TODO`)
- [PRODUCT_VISION.md](PRODUCT_VISION.md) — visão de produto (11 capítulos, estrutura criada, conteúdo `TODO`)
- [TECH_STACK.md](TECH_STACK.md) — stack tecnológica (12 capítulos, estrutura criada, conteúdo `TODO`)
- [NAMING_CONVENTIONS.md](NAMING_CONVENTIONS.md) — convenções de nomenclatura (12 capítulos, estrutura criada, conteúdo `TODO`)
- [PRODUCTS.md](PRODUCTS.md) — 9 produtos oficiais (Growth, CRM, AI, Automation, Studio, Analytics, Projects, Marketplace, Financial), cada um com Objetivo/Escopo/Funcionalidades/Integrações/KPIs/Roadmap, estrutura criada, conteúdo `TODO`
- [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) — 🟢 **Oficial (v1.1)**. Arquitetura do sistema com conteúdo real (27 capítulos: Kernel, Business Domains, Integration Layer, Infrastructure) — não é esqueleto. § 2 anotada (não reescrita) por [ADR-0023](../../adr/ADR-0023-company-identity-statement-consolidation.md). Contradiz e sobrepõe múltiplos documentos de governança já existentes (contagem de domínios/produtos); ver nota de conflitos em [PROJECT_RULES.md](../../PROJECT_RULES.md).
- [BOM.md](BOM.md) — 🟢 **Oficial (v1.0.0)**. Business Object Model: catálogo de entidades de dados da plataforma (Core/Business/Intelligence/Analytics/System Objects, 11 capítulos) — não é esqueleto. Nenhuma entidade pode ser criada fora deste documento sem ADR (§ 1).
- [NOVARIS_CONSTITUTION.md](NOVARIS_CONSTITUTION.md) — 🟡 **Histórico (v1.0.0)**. Se autodeclarava a Constituição suprema e imutável da NOVARIS (21 Artigos); **redirecionado para `CONSTITUTION.md`** por [ADR-0008](../../adr/ADR-0008-foundation-freeze.md) (Missão ENG-0000.5). Corpo preservado verbatim, não é mais fonte de autoridade ativa.
- [DOMAIN_MODEL.md](DOMAIN_MODEL.md) — 🟢 **Oficial (v1.0)**. Quinta lista de domínios/produtos da sessão (13 domínios, estilo DDD/bounded context); duas violações internas da própria regra do documento (`Task`, `Queue` em dois domínios cada) e catálogo de objetos divergente de `BOM.md`; ver nota em [PROJECT_RULES.md](../../PROJECT_RULES.md).
- [DATABASE_ARCHITECTURE.md](DATABASE_ARCHITECTURE.md) — 🟢 **Oficial (v1.0)**. Convenções e políticas de banco de dados (21 tópicos: tabelas, colunas, UUID, soft delete, auditoria, multi-tenant, RLS, índices, constraints, views, RPC, functions, triggers, particionamento, naming, migrations, backup, restore, performance, escalabilidade) — Missão ARCH-002. 6 pontos marcados explicitamente "requer decisão" (sem números/políticas inventados).
- [UBIQUITOUS_LANGUAGE.md](UBIQUITOUS_LANGUAGE.md) — 🟢 **Oficial (v1.0)**. Dicionário de termos oficiais (Missão ARCH-003), organizado pelos 13 domínios de `DOMAIN_MODEL.md`, restrito a objetos já em `BOM.md`. Expôs 1 domínio sem nenhum termo mapeável (Knowledge) e 12 objetos do BOM sem domínio atribuído; ver nota em [PROJECT_RULES.md](../../PROJECT_RULES.md).
- [CANONICAL_DATA_MODEL.md](CANONICAL_DATA_MODEL.md) — 🟢 **Oficial (v1.0)**. Modelo conceitual de dados (Missão ARCH-004, 18 campos por entidade), restrito a objetos de `BOM.md`. 4 entidades com detalhamento completo (`Organization`, `User`, `Role`, `Permission`); ~65 na tabela-índice com a maioria dos campos `TODO` — nenhum atributo/cardinalidade/lifecycle foi inventado sem fonte.
- [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md) — 🟢 **Oficial (v1.0) — roadmap especializado**. Plano de execução da fase Foundation (Missão ARCH-005): ordem obrigatória Kernel→Domínios, marcos sem data (sem dado de equipe/velocidade), 8 riscos compilados de notas já registradas em `PROJECT_RULES.md`. Testes/Deploy/Rollback marcados "requer decisão". Subordinado ao roadmap mestre [NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md](../../NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md) desde [ADR-0008](../../adr/ADR-0008-foundation-freeze.md).
- [OBJECT_SPECIFICATION_TEMPLATE.md](OBJECT_SPECIFICATION_TEMPLATE.md) — template de detalhamento individual por objeto do BOM (20 capítulos)
- [objects/](objects/README.md) — instâncias reais do template acima, uma por objeto do BOM; 4 de ~65 preenchidas (`Organization.md` completa; `User.md`, `Role.md`, `Permission.md` parciais, escritas para desbloquear a Missão ARCH-001)
- [AI_STRATEGY.md](AI_STRATEGY.md) — estratégia de IA (13 capítulos, estrutura criada, conteúdo `TODO`)
- [MONOREPO_ARCHITECTURE.md](MONOREPO_ARCHITECTURE.md) — proposta de árvore de monorepo (Missão 007); 🟡 parcialmente materializada pela Missão ENG-0000 (`ADR-0004`, `ADR-0005`), com divergências registradas no próprio documento
- [ENGINEERING_GUIDE.md](ENGINEERING_GUIDE.md) — guia prático de engenharia (Missão 008), consolida regras já existentes; seções sem regra definida ficam `TODO`
- [ORGANIZATION.md](ORGANIZATION.md) — 10 domínios da plataforma (Missão 003), estrutura + `TODO`; também preenche referência antes ausente de `NOVARIS_OS.md § 22`
- [MASTER_ROADMAP.md](MASTER_ROADMAP.md) — 🟡 **Histórico**. Roadmap de engenharia por fase (Missão 002); substituído por [NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md](../../NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md) desde [ADR-0008](../../adr/ADR-0008-foundation-freeze.md).
- [MISSING_MODULES.md](MISSING_MODULES.md) — módulos ainda não implementados (Missão 005), estrutura + `TODO`
- [BACKLOG.md](BACKLOG.md) — backlog enterprise Epic→Feature→Story→Task→Subtask (planejamento de **produto**, complementar a [NEF/PLANNING_MODEL.md](../../NEF/PLANNING_MODEL.md) — ver [ADR-0008](../../adr/ADR-0008-foundation-freeze.md)), com template de Dependências/Prioridade/Complexidade/Valor/Sprint/Critério de Aceite; 9 Epics nomeados a partir de `PRODUCTS.md`/`specifications/`, resto `TODO`
- [AI_PLAYBOOK.md](AI_PLAYBOOK.md) — operação prática de IA (Missão 009), estrutura + `TODO`; sobreposição com `AI_STRATEGY.md` ainda não resolvida
- [company.md](company.md)
- [vision.md](vision.md)
- [manifesto.md](manifesto.md) — 🟢 **Oficial**. Convicções da NOVARIS (mercado, tecnologia, forma de trabalhar), expandidas a partir de `NOVARIS_OS.md §§ 4-6` e `CONSTITUTION.md` (Artigos 2, 20, emendados por [ADR-0022](../../adr/ADR-0022-constitution-knowledge-cycle-amendment.md)) — não é mais esqueleto
- [culture.md](culture.md)
- [principles.md](principles.md)

## Campos Reservados para Futuras Expansões

- 🚧 A definir

---
🚧 Estrutura criada — descrição inicial. Conteúdo completo a ser desenvolvido.
