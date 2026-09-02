# ADR-0058 - NOVARIS Performance Intelligence como 10º Produto

## Problema

O usuário forneceu nesta sessão um master-context doc completo ("NOVARIS PERFORMANCE INTELLIGENCE — Master Context, Product Vision & Development Strategy v1.0") propondo uma plataforma de análise, diagnóstico por IA e recomendação de ação para mídia paga (Google Ads inicialmente), para as contas de Winnet Metais e Allbinox Metais, com pedido explícito de "iniciar um projeto do zero". `PRODUCTS.md` já é lista oficial e vinculante de 9 produtos por decisão explícita do CTO (`ADR-0024`) — era preciso decidir se este novo escopo (a) vira um projeto isolado fora do monorepo, (b) vira um domínio técnico novo em `services/domains/`, ou (c) é um 10º produto composto de domínios já existentes.

## Contexto

- `novaris` já implementa a maior parte da infraestrutura que o master doc pede do zero: multi-tenancy real (`services/kernel/organizations`), `Campaign`/`Asset` já existentes em `services/domains/marketing` (`CreateCampaignHandler`, `AddAssetToCampaignHandler`, `CampaignController`), um `GoogleAdsProvider` (port) + `ConsoleGoogleAdsProvider` (adapter estrutural) já em `services/kernel/integration-hub` (`ADR-0040`), `ai-runtime` com Port pronto (`ADR-0041`), e o objeto `Snapshot` já previsto (não implementado) em `DOMAIN_MODEL.md § ANALYTICS DOMAIN`. Construir um projeto isolado do zero duplicaria tudo isso — o próprio master doc do usuário proíbe duplicar capacidade existente (seção 50, regra 9).
- `ADR-0007` já resolveu exatamente este tipo de decisão para `NOVARIS Growth`: um produto (Product Layer, `PRODUCTS.md`) não é, por si só, um domínio técnico (Domain Layer, `DOMAIN_MODEL.md`) — é entregue pela composição de um ou mais bounded contexts existentes. `Growth` foi criado por engano como `services/domains/growth/` (`ENG-0000.1`) e corrigido (`ENG-0000.2`) para existir só como produto, sem pasta de domínio própria.
- Existe um protótipo real e funcional, `Desktop/Winnet/google-ads-analyzer` (Python/Streamlit/Gemini), com developer token real da Google Ads API para Winnet (nível "Conta de Teste") e queries GAQL já validadas — mas com fallback silencioso para dado simulado quando a API falha, o que contradiz diretamente o princípio "nunca inventar dado" do próprio master doc do usuário.
- `ADR-0008` (Foundation Freeze) exige um novo ADR para qualquer mudança estrutural nos documentos canônicos de governança (incluindo `PRODUCTS.md`), mas libera explicitamente `services/`, `packages/`, `apps/` (código) dessa trava — nenhum código é alterado por este ADR.
- O usuário confirmou explicitamente, em resposta a uma pergunta direta desta sessão, que o produto deve morar dentro do `novaris` (não como projeto isolado) e que o escopo de hoje é só fundação (governança/estrutura, sem lógica de negócio).

## Alternativas

| Opção | Descrição | Avaliação |
|---|---|---|
| A. Projeto novo, isolado, fora do monorepo `novaris` | Pasta própria, stack própria, do jeito pedido literalmente | Rejeitada — duplicaria multi-tenancy, auth, `Campaign`/`Asset`, `GoogleAdsProvider` e `ai-runtime` já existentes; violaria a regra do próprio master doc de não duplicar capacidade existente |
| B. Novo domínio técnico `services/domains/performance-intelligence/` | Pasta de Domain Layer nova | Rejeitada pelo mesmo teste do `ADR-0007`: os objetos propostos (Campaign/Keyword/SearchTerm, Snapshot, Recommendation) já pertencem ou estendem domínios existentes (`Marketing`, `Analytics`) — não há um bounded context genuinamente novo, sem dono, a justificar uma 14ª entrada em `DOMAIN_MODEL.md` |
| C. 10º produto em `PRODUCTS.md`, composição de `Marketing` + `Analytics` + `kernel/ai-runtime` + `kernel/integration-hub` + `kernel/organizations`, especificado em `specifications/performance-intelligence/` | Segue exatamente o precedente de `Growth` | Escolhida |

## Escolha

**Opção C.**

- Novo produto **NOVARIS Performance Intelligence** registrado em `knowledge/core/PRODUCTS.md` (10º produto, ampliando a lista de 9 fixada por `ADR-0024`) e em `specifications/README.md`.
- Especificação funcional completa criada em `specifications/performance-intelligence/` (`README.md`, `overview.md`, `features.md`, `database.md`, `api.md`, `events.md`, `integrations.md`, `permissions.md`, `roadmap.md`, `screens.md`), seguindo o template de 9 arquivos + README já usado por `growth/`.
- `overview.md` preserva os não-negociáveis do master doc do usuário (fato/sinal/hipótese/recomendação; nunca inventar dado; nunca otimizar por métrica isolada; autonomia conquistada por evidência, nunca assumida) como constituição do produto — qualquer implementação futura que os violar precisa de um novo ADR.
- `database.md` mapeia os objetos do master doc para os domínios existentes: `Campaign`/`AdGroup`/`Keyword`/`SearchTerm` → `Marketing`; `PerformanceSnapshot`/detecção → `Analytics` (reaproveitando o objeto `Snapshot` já previsto, não implementado); diagnóstico por IA → `kernel/ai-runtime`; conexão/sincronização Google Ads → `kernel/integration-hub`. Marca como `TODO` de fronteira, sem decidir agora: (1) `Company`/`Business Profile` como sub-tenant de `Organization` ou aggregate próprio; (2) `Recommendation` como objeto de `Marketing` ou de `Analytics` — mesma disciplina já aplicada à fronteira `Revenue` (CRM vs. Financial) em `PRODUCTS.md`.
- **Nenhum código é criado por este ADR** — nenhum schema Prisma, nenhuma pasta em `services/domains/` ou `apps/api/src/`, nenhuma chamada real à Google Ads API. Fica para quando o usuário aprovar a Fase 01 (`roadmap.md`).
- Protótipo `Desktop/Winnet/google-ads-analyzer` (Python/Streamlit/Gemini) é aposentado: recebe um `DEPRECATED.md` apontando para este produto, preservado como referência histórica das queries GAQL validadas, **não apagado** (nenhum dado ou credencial é excluído).
- Extensão do port `GoogleAdsProvider` (hoje só `createCampaign`) e o schema Prisma real de `PerformanceSnapshot`/`Recommendation` ficam para ADRs próprios nas Fases 02/03/09 — não decididos aqui.

## Consequências

- `novaris` passa a ter 10 produtos oficiais em vez de 9 — primeira ampliação da lista fixada por `ADR-0024` desde então.
- Toda a inteligência de mídia paga da NOVARIS reaproveita `organizations`, `marketing`, `analytics`, `ai-runtime` e `integration-hub` já existentes, em vez de recriar multi-tenancy/auth/campanha do zero — reduz drasticamente o trabalho da Fase 01 em diante.
- Duas decisões de fronteira ficam explicitamente em aberto (`Company`/`Business Profile`; `Recommendation`) e não devem ser resolvidas por implementação silenciosa — exigem ADR próprio quando a Fase 01/09 chegar.
- O protótipo Python de Winnet deixa de ser evoluído; suas queries GAQL continuam disponíveis como referência para a Fase 02, mas seu fallback de dado simulado não deve ser replicado na plataforma real.

## Responsável

Decisão de arquitetura direta (Claude Code / Principal Engineer), aplicando o teste já estabelecido pelo CTO em `ADR-0007`/`ADR-0024` — localização do produto (dentro do `novaris` vs. isolado) e escopo do dia (só fundação) confirmados por pergunta direta ao usuário nesta sessão.

## Data

2026-09-01

## Impactos

- `novaris/knowledge/core/PRODUCTS.md` — nova seção `## NOVARIS Performance Intelligence` (10º produto).
- `novaris/specifications/README.md` — novo item na lista de domínios/produtos.
- `novaris/specifications/performance-intelligence/` (novo) — 10 arquivos.
- `novaris/adr/README.md` — nova linha para este ADR.
- `Desktop/Winnet/google-ads-analyzer/DEPRECATED.md` (novo) — sem exclusão de código/credencial.

## Plano de Migração

Nenhuma migração de dado ou código — mudança de governança/especificação. Nenhum arquivo do protótipo Python é removido, só sinalizado como descontinuado.

## Status

Aceito
