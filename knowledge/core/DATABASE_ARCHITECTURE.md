# DATABASE_ARCHITECTURE.md

Versão: 1.0

Status: Oficial

Autoridade: Chief System Architect

Escopo: convenções e políticas de persistência da plataforma — não schema, não tabelas, não migrations. Nenhuma entidade específica é criada por este documento.

---

## Nota de Origem

Este documento consolida, sob um único lugar, regras que já existiam espalhadas (não inventa a maior parte delas): [CONSTITUTION.md § Artigo 10 — Banco de Dados](CONSTITUTION.md#artigo-10--banco-de-dados), [NOVARIS_CONSTITUTION.md Article VIII/IX](NOVARIS_CONSTITUTION.md), [BOM.md § 9 — Regras Gerais](BOM.md), e o exemplo real já construído em [objects/Organization.md](objects/Organization.md). Onde nenhuma fonte anterior definia a regra, isso está marcado explicitamente como **requer decisão** — não inventei parâmetros operacionais (prazos, limites numéricos) que dependem de decisão de negócio ainda não tomada, seguindo a mesma disciplina desta sessão inteira.

A ordem de missão cita `PLATFORM_KERNEL.md` e `BUSINESS_OBJECT_MODEL.md`; os arquivos reais são [services/kernel/README.md](../../services/kernel/README.md) (mais [SYSTEM_ARCHITECTURE.md § 4](SYSTEM_ARCHITECTURE.md)) e [BOM.md](BOM.md), respectivamente — este documento trata a ordem como referindo-se a eles.

---

## 1. Convenções de Tabelas

- Nome em `snake_case`, plural (`organizations`, `users`).
- Toda tabela pertence a exatamente um domínio/módulo — nenhuma tabela é compartilhada entre domínios por acesso direto ([DOMAIN_MODEL.md § REGRAS](DOMAIN_MODEL.md), [NOVARIS_CONSTITUTION.md Article IV](NOVARIS_CONSTITUTION.md)).
- Toda tabela exige uma Object Specification em [objects/](objects/README.md) antes de existir ([BOM.md § 1](BOM.md), [NOVARIS_CONSTITUTION.md Article V](NOVARIS_CONSTITUTION.md)) — este documento não cria nenhuma.
- Toda tabela é documentada: objetivo, relacionamentos, permissões, RLS, auditoria, migrations, índices, comentários ([CONSTITUTION.md § Artigo 10](CONSTITUTION.md#artigo-10--banco-de-dados)).

## 2. Convenções de Colunas

- `snake_case` em toda coluna.
- Booleans prefixados `is_`/`has_` (ex.: `is_active`).
- Chaves estrangeiras nomeadas `<entidade>_id` (ex.: `organization_id`, `user_id`).
- Timestamps sufixados `_at` (`created_at`, `updated_at`, `deleted_at`).
- Dados semi-estruturados (configurações, metadados) em coluna `JSONB` nomeada no singular (`settings`, `metadata`) — já usado em [objects/Organization.md](objects/Organization.md).
- **Requer decisão**: enum via `CHECK` constraint vs. tabela de lookup própria — nenhuma fonte anterior decidiu isso; ambos são válidos em Postgres, a escolha depende do caso (poucos valores estáveis → `CHECK`; valores geridos por admin → tabela).

## 3. UUID

Toda chave primária é `UUID` (v4), nunca inteiro autoincremental — já exigido por [NOVARIS_CONSTITUTION.md Article VIII](NOVARIS_CONSTITUTION.md) e [objects/Organization.md](objects/Organization.md). Motivo: evita enumeração sequencial de registros, permite geração client-side antes do insert, e é o padrão nativo do Supabase/PostgreSQL já adotados pela stack fixa.

## 4. Soft Delete

- Toda tabela relevante tem `deleted_at TIMESTAMPTZ NULL` — `NULL` significa ativo.
- Leitura padrão da aplicação filtra `deleted_at IS NULL`; o Kernel (`services/`) é responsável por aplicar esse filtro de forma consistente, não cada domínio individualmente.
- Hard delete (remoção física) só ocorre por processo administrativo explícito, fora do fluxo normal de aplicação — não definido por nenhum endpoint padrão.
- Já exigido por [objects/Organization.md § RN005](objects/Organization.md).

## 5. Auditoria

- Toda alteração relevante gera uma entrada de auditoria através de `services/kernel/audit/` — schema já definido em [objects/Organization.md § Auditoria](objects/Organization.md): usuário, data, IP, origem, evento, valores antigos, valores novos.
- A tabela de auditoria é **append-only**: nenhuma linha é alterada ou removida após escrita.
- Obrigatória por [NOVARIS_CONSTITUTION.md Article XVIII](NOVARIS_CONSTITUTION.md) e [CONSTITUTION.md § Artigo 10](CONSTITUTION.md#artigo-10--banco-de-dados).

## 6. Multi-Tenant

- Toda tabela com dado pertencente a uma organização tem `organization_id NOT NULL`, exceto objetos globais explicitamente definidos pelo Kernel ([NOVARIS_CONSTITUTION.md Article III](NOVARIS_CONSTITUTION.md)).
- Nenhuma consulta de aplicação pode retornar dado de mais de uma organização ao mesmo tempo — reforçado estruturalmente por RLS (§ 7), não apenas por convenção de código.

## 7. Row Level Security (RLS)

- RLS habilitado por padrão em toda tabela multi-tenant — já exigido em `PROJECT_RULES.md § Regras de Banco de Dados` ("não existe exceção implícita").
- Policy base: `organization_id = auth.organization_id`, já usada em [objects/Organization.md § RLS](objects/Organization.md).
- Nenhuma policy é desabilitada ou contornada (`service_role` bypass) fora de processos administrativos explicitamente documentados — desabilitar RLS em qualquer tabela nova exige ADR ([NOVARIS_CONSTITUTION.md Article IX](NOVARIS_CONSTITUTION.md)).

> **⚠️ Incidente Real (`ENG-0125`, Customer Domain)**: `prisma migrate diff --from-migrations ... --shadow-database-url "$DIRECT_URL"` foi executado apontando `--shadow-database-url` para a **URL real de produção/dev** (a mesma usada por `DATABASE_URL`/`DIRECT_URL` em todo o resto desta engenharia), em vez de uma URL de banco genuinamente descartável. O mecanismo de shadow database do Prisma trata a URL fornecida como algo que pode recriar e **derrubar** ao final da operação — resultado real observado: o schema `public` inteiro foi esvaziado (todas as tabelas de `opportunities` a `credentials`, zero linhas, zero tabelas). Recuperado integralmente nesta mesma missão via `prisma migrate deploy` (re-aplicando as migrations já existentes do zero) + reexecução do seed de bootstrap (`apps/api/src/seed.ts`) — nenhum dado real de cliente existia ainda (só dados de desenvolvimento desta própria sessão), então a recuperação foi completa e sem perda residual. **Regra permanente daqui em diante**: `--shadow-database-url` nunca deve apontar para `DATABASE_URL`/`DIRECT_URL` reais — migrations futuras devem ser escritas manualmente (extrapolando do `schema.prisma`) ou usar um banco Postgres efêmero genuinamente separado (ex.: um container local), nunca a mesma URL de produção. **Achado secundário, corrigido na mesma recuperação**: a pasta de migration `identity_organization_domain` tinha timestamp (`20260722143612`) **anterior** ao de `init_sales_domain` (`20260722164825`) — ordem invertida por erro de geração de timestamp em `ENG-0122`, nunca detectada antes porque `migrate deploy` incremental não reordena migrations já aplicadas. Corrigido renomeando a pasta para `20260722170000_identity_organization_domain` (depois de `init_sales_domain`), evitando que qualquer setup futuro do zero falhe ao referenciar `public.organization_id()` antes dela existir.
>
> **Nota de Resolução (`ENG-0122`, Identity/Auth MVP)**: achado real, confirmado por `SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user` contra o Postgres real (Supabase) — o role `postgres`, usado pela conexão Prisma de `apps/api` (`DATABASE_URL`/`DIRECT_URL`, `packages/database/.env`) para **todo** tráfego desta API, tem `rolbypassrls = true`. Por padrão do Postgres, RLS nunca se aplica ao dono/superusuário da tabela — não é uma falha de configuração desta engenharia, é o comportamento padrão de um role administrativo do Supabase. Na prática, isso significa que as policies já escritas (`init_sales_domain`, `identity_organization_domain`) **não protegem nenhuma query feita por esta API** — só protegeriam um acesso direto ao Postgres via um role sem esse bypass (ex.: `anon`/`authenticated` do PostgREST do Supabase), caminho que esta arquitetura não usa (a API fala com o Postgres diretamente via Prisma, nunca via PostgREST).
>
> Isso não é, em si, a violação da regra acima ("nenhuma policy é desabilitada ou contornada fora de processo administrativo documentado") — é a descoberta de que o bypass já existia estruturalmente, nunca decidido nem documentado antes desta missão. A mitigação adotada (`OpportunityController.loadAndAssertOwnership()`, `apps/api/src/sales/opportunity.controller.ts`): toda rota que opera sobre uma entidade já existente confirma explicitamente, em código de Application/API, que `entity.organizationId` corresponde ao `organizationId` do JWT autenticado, devolvendo 403 (mascarado como `NOT_FOUND_ERROR`, para não revelar a existência de dados de outra Organization) em caso de divergência. **Esta mitigação precisa ser replicada em todo Controller futuro de qualquer domínio** — RLS permanece como defesa em profundidade para um eventual acesso direto futuro (ex.: um cliente usando `supabase-js` com um role restrito), mas não é, hoje, a barreira real de isolamento desta API.

## 8. Índices

- Índice obrigatório em toda chave estrangeira.
- Índice obrigatório em `organization_id` em toda tabela multi-tenant (é o filtro mais frequente do sistema, por § 6-7).
- Índices adicionais (colunas de `WHERE`/`ORDER BY` frequentes) são decididos por tabela, no momento em que a tabela é criada — não antecipados aqui sem dado real de uso.
- **Requer decisão**: processo/ferramenta de monitoramento de queries lentas para orientar novos índices ao longo do tempo (relaciona-se com `services/kernel/monitoring/`, hoje sem contrato definido).

## 9. Constraints

- `NOT NULL` em toda coluna semanticamente obrigatória — não usar valor default como substituto de obrigatoriedade.
- Toda FK declara `ON DELETE` explícito: `RESTRICT` como padrão (impede deleção que quebraria integridade); `CASCADE` apenas quando o relacionamento for de posse exclusiva e comprovadamente seguro (ex.: um objeto que só existe em função do pai).
- `CHECK` para enums simples (§ 2).
- `UNIQUE` onde há identificador de negócio (ex.: `slug` de `organizations`).

## 10. Views

Views para leitura consolidada multi-tabela (ex.: uma view que já aplica `deleted_at IS NULL`, evitando repetir o filtro em toda query). Uma view herda o RLS das tabelas base — não é um mecanismo para contornar isolamento multi-tenant.

## 11. Materialized Views

**Requer decisão** — nenhum documento anterior a esta missão menciona materialized views. Proposta (não decisão final): reservadas para agregações custosas de leitura (dashboards, analytics — ver `services/kernel/monitoring/`, `SYSTEM_ARCHITECTURE.md § Analytics Objects` equivalente em `BOM.md`), com refresh agendado via `services/kernel/scheduler/`. Não usar para dado transacional que precisa estar sempre atualizado.

## 12. RPC

Funções Postgres expostas via Supabase RPC para operações atômicas que envolvem mais de uma tabela e não cabem em um único INSERT/UPDATE REST (ex.: ativar uma organização, que grava em várias tabelas e emite evento na mesma transação). Toda RPC é documentada no `CONTRACT.md` do módulo de Kernel ou domínio correspondente ([services/kernel/README.md](../../services/kernel/README.md)).

## 13. Functions

Funções Postgres puras (sem chamada de rede) para lógica reutilizável dentro do banco — validações e cálculos que não dependem de sistemas externos. Lógica que precisa chamar uma Edge Function, publicar um evento ou acessar um serviço externo **não** vai em function de banco — vai na camada de aplicação/Kernel, para manter observabilidade e testabilidade (`services/kernel/event-bus/`, `services/kernel/integration-hub/`).

## 14. Triggers

**Requer decisão** quanto ao escopo exato — proposta: uso restrito a invariantes que a aplicação não pode garantir de outra forma (ex.: `updated_at` atualizado automaticamente). Lógica de negócio (validações de regra, side-effects) não vai em trigger — vai na camada de aplicação, para não ficar invisível a testes e logs.

## 15. Particionamento

**Requer decisão** — nenhuma tabela existe ainda para avaliar necessidade real, e nenhum documento definiu limiar de volume. Proposta: particionar (por `organization_id` ou por data, conforme o padrão de acesso da tabela) apenas quando uma tabela específica ultrapassar um volume que degrade performance **medida em produção** — não antecipar com número arbitrário sem dado real, o que seria inventar um parâmetro operacional sem base.

## 16. Naming Convention

| Elemento | Convenção | Exemplo |
|---|---|---|
| Tabela | `snake_case`, plural | `organizations` |
| Coluna | `snake_case` | `organization_id` |
| Índice | `idx_<tabela>_<coluna(s)>` | `idx_users_organization_id` |
| Foreign key constraint | `fk_<tabela>_<coluna>` | `fk_users_organization_id` |
| Unique constraint | `uq_<tabela>_<coluna>` | `uq_organizations_slug` |
| Check constraint | `ck_<tabela>_<regra>` | `ck_organizations_plan` |
| Migration | `NNNN_descricao_curta.sql` | `0001_create_organizations.sql` |

Consistente com a convenção sequencial já usada em `adr/` (`ADR-NNNN-titulo.md`) e `specifications/` (`NNNN-nome-da-feature.md`).

## 17. Versionamento de Migrations

- Ferramenta: Supabase CLI migrations (já citado, ainda `TODO` de detalhamento, em [docs/05-backend/diretrizes-de-banco-de-dados.md](../../docs/05-backend/diretrizes-de-banco-de-dados.md)).
- Numeração sequencial crescente, nunca reordenada e nunca editada após ter sido aplicada em qualquer ambiente compartilhado (mesma regra de ADRs — [adr/README.md](../../adr/README.md)).
- Toda migration com potencial destrutivo (`DROP`, `ALTER` que perde dado) exige revisão explícita antes de aplicar — mudança estrutural exige ADR ([CONSTITUTION.md § Artigo 22](CONSTITUTION.md#artigo-22--alterações)).

## 18. Estratégia de Backup

Base: backup automático diário + point-in-time recovery, já oferecido pela plataforma Supabase (parte da stack fixa). **Requer decisão**: período de retenção e frequência além do padrão da plataforma dependem do plano contratado e de exigência de compliance (LGPD/GDPR) ainda não definida em `BUSINESS_MODEL.md` (`TODO`) nem em `docs/14-legal/` — não inventado aqui.

## 19. Estratégia de Restore

Restore deve ser testado periodicamente em ambiente isolado, não em produção. **Requer decisão**: cadência do teste, e metas de RTO (tempo de recuperação) e RPO (perda de dado aceitável) — nenhum documento definiu esses números; são decisões operacionais, não técnicas, e não foram inventadas aqui.

## 20. Estratégia de Performance

- Índices conforme § 8; connection pooling via Supabase (nativo da stack).
- Queries N+1 são proibidas na camada de aplicação — o Kernel deve expor operações em lote/join, não forçar N chamadas sequenciais por item.
- **Requer decisão**: metas numéricas de latência (SLA) por endpoint — não definidas em nenhum documento.

## 21. Estratégia de Escalabilidade

Herda a meta já real em [SYSTEM_ARCHITECTURE.md § 22 — Escalabilidade](SYSTEM_ARCHITECTURE.md): suportar 100, 1.000, 10.000 e 100.000 empresas sem reescrita estrutural. Estratégia até que um gatilho real de § 15 (Particionamento) exija isolamento físico: multi-tenancy lógico — banco único, isolamento por `organization_id` + RLS (§ 6-7) — que é o padrão adotado por esta arquitetura enquanto o volume não justificar outra coisa.

---

## Relação com Outros Módulos

- [architecture/modelagem-de-dados.md](../../architecture/modelagem-de-dados.md) — hoje `TODO`; este documento passa a ser a fonte substantiva de convenções de banco, o que antes vivia lá como esqueleto
- [docs/05-backend/diretrizes-de-banco-de-dados.md](../../docs/05-backend/diretrizes-de-banco-de-dados.md) — hoje `TODO`; mesma relação
- [CONSTITUTION.md § Artigo 10](CONSTITUTION.md#artigo-10--banco-de-dados), [NOVARIS_CONSTITUTION.md Article VIII/IX](NOVARIS_CONSTITUTION.md) — regras constitucionais que este documento operacionaliza em detalhe
- [BOM.md](BOM.md) / [objects/](objects/README.md) — toda tabela nasce de uma Object Specification, não deste documento
- [services/kernel/](../../services/kernel/README.md) — módulos de Kernel (`audit`, `storage`, `search`, `scheduler`) que implementam partes destas convenções

## Status

🟢 Oficial (v1.0). Convenções técnicas com base em regras e exemplos já oficiais. Seis pontos marcados explicitamente **requer decisão** (§ 2 enum, § 8 monitoramento, § 11 materialized views, § 14 triggers, § 15 particionamento, § 18-20 parâmetros operacionais de backup/restore/performance) — não preenchidos com números ou políticas inventadas.
