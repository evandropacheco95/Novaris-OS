# NOVARIS Engineering Handbook

Versão: 1.0.0

Status: 🟢 Oficial

Missão: NEP-0001 (NOVARIS Engineering Handbook)

Audiência: Desenvolvedores, Arquitetos, Agentes de IA, Claude Code, Revisores.

---

## Objetivo

Guia único, de leitura linear, que orienta qualquer pessoa ou agente a entender **como a engenharia da NOVARIS funciona** — do princípio arquitetural até o processo de release — sem precisar navegar pelos ~20 documentos de governança já existentes para montar o quadro completo. **Este documento não substitui nenhum deles** — cada seção abaixo é um resumo real com link para a fonte canônica, que continua sendo a autoridade em caso de dúvida ou conflito de detalhe.

## ⚠️ Nota de Sobreposição (resolvida por ADR-0009 — Missão DOC-0001)

Este documento chegou a coexistir com outros dois que também se autodeclaravam ou eram pedidos como "documento mestre" da engenharia NOVARIS:

- [NES/README.md](../../NES/README.md) — "NOVARIS Engineering System", autodeclarado "Documento Mestre de Engenharia" (Missão NES-001).
- [NEF/README.md](../../NEF/README.md) — "NOVARIS Engineering Framework", 10 pilares regendo "todo o ciclo de vida do software" (Missão NEF-001).

[ADR-0009](../../adr/ADR-0009-engineering-entry-point-authority.md) (Missão DOC-0001) resolveu a ambiguidade atribuindo papéis distintos, não sobrepostos: **este Handbook é a fonte canônica de onboarding em leitura linear** (um único arquivo, do início ao fim, "como tudo se encaixa"); **NEF é a fonte canônica de referência estrutural** ("onde está a regra vigente de X", 10 pastas, não leitura corrida); **NES é histórico**, redirecionado para ambos. `PROJECT_RULES.md` / `CONSTITUTION.md` seguem como autoridade normativa vigente (Artigo 1), papel que nenhum dos três nunca disputou. Onde este Handbook divergir em detalhe de NEF ou de qualquer fonte primária, a fonte primária prevalece — este documento deve ser corrigido para bater com ela, nunca o contrário.

**Prefixo de Mission ID `NEP-`**: esta missão usou `NEP-0001`. **Resolvido por `ADM-0002`**: `NEP-` significa "NOVARIS Engineering Playbook" — documento-guia operacional de leitura linear, documentação pura (par funcional de `DOC-`) — e entrou formalmente na taxonomia de `NEF/PLANNING_MODEL.md`. Decisão do CTO, confirmando o que já era usado operacionalmente (`ARCHITECTURE_REVIEW_GATE_STANDARD.md` já tratava `NEP-` como documentação pura antes mesmo da formalização).

---

## 1. Filosofia de Engenharia

Clean Architecture (dependências sempre apontam para dentro), DDD (o modelo de domínio é o centro do design), SOLID (Dependency Inversion em particular), Ports & Adapters, Event-Driven, Modular Monolith Ready, Microservice Ready, AI First Development. Fonte completa: [ENGINEERING_PLAYBOOK.md § 1](ENGINEERING_PLAYBOOK.md#1-filosofia-da-engenharia).

## 2. Estrutura do Repositório

Árvore de topo fixada por [ADR-0002](../../adr/ADR-0002-reestruturar-arvore-do-repositorio.md): `docs/`, `architecture/`, `adr/`, `engineering/`, `specifications/`, `business/`, `playbooks/`, `knowledge/`, `agents/`, `apps/`, `packages/`, `services/`, `infrastructure/`, `.claude/`, `.command-center/`, `NEF/`. Mapa completo e atualizado: [README.md raiz § Estrutura do Repositório](../../README.md).

## 3. Fluxo Oficial de Desenvolvimento

11 fases obrigatórias, em ordem, antes de qualquer implementação: Entendimento → Leitura da Documentação → Leitura dos ADRs → Análise de Impacto → Plano Técnico → Validação (aprovação explícita) → Implementação → Testes → Atualização da Documentação → Atualização do CHANGELOG → Conclusão. Fonte completa: [.command-center/EXECUTION_PROTOCOL.md](../../.command-center/EXECUTION_PROTOCOL.md).

## 4. Tipos de Missão

Hierarquia de planejamento: `PROGRAM → EPIC → MISSION → TASK → CHECKLIST`. Prefixo de Mission ID indica o tipo:

| Prefixo | Tipo |
|---|---|
| `ADR-` | Decisão arquitetural individual |
| `ADM-` | Índice/consolidação de decisões já tomadas |
| `ENS-` | Padrão de engenharia (como implementar um tipo de componente ou executar um processo de engenharia) |
| `ENG-` | Implementação técnica (código ou modelagem de domínio) |
| `NEP-` | NOVARIS Engineering Playbook — documento-guia operacional de leitura linear, documentação pura (par funcional de `DOC-`, formalizado por `ADM-0002`) |

`ACR`/`DMV`/`ARG` não são prefixos de missão — são relatórios obrigatórios dentro de uma missão (ACR: sempre; DMV: quando há modelagem de domínio; ARG: quando a missão é `ENG-`, [ARCHITECTURE_REVIEW_GATE_STANDARD.md](standards/ARCHITECTURE_REVIEW_GATE_STANDARD.md), Missão ENS-0002). Fonte completa: [NEF/PLANNING_MODEL.md](../../NEF/PLANNING_MODEL.md).

## 5. Processo de Aprovação

Toda missão termina aguardando aprovação explícita do CTO — silêncio, ou uma mensagem sobre outro assunto, não constitui aprovação (`EXECUTION_PROTOCOL.md § Fase 6`). Nenhuma missão inicia a próxima automaticamente. Esse padrão foi seguido em toda missão desde ENG-0000.

## 6. Governança Arquitetural

Hierarquia de autoridade: `CONSTITUTION.md` → `PROJECT_RULES.md` → `adr/` → documentação de referência ([PROJECT_RULES.md § Artigo 1](../../PROJECT_RULES.md)). Foundation congelada desde [ADR-0008](../../adr/ADR-0008-foundation-freeze.md) — mudança estrutural na árvore de governança exige ADR ([FOUNDATION_STATUS.md](../../FOUNDATION_STATUS.md)). Índice executivo de toda decisão já tomada: [architecture/ADM/ARCHITECTURE_DECISION_MATRIX.md](../../architecture/ADM/ARCHITECTURE_DECISION_MATRIX.md).

## 7. Padrões Obrigatórios

Padrão geral de arquitetura de serviço (camadas, error handling, logging, testes, eventos, APIs): [ENGINEERING_PLAYBOOK.md](ENGINEERING_PLAYBOOK.md), 20 capítulos. Padrões específicos (Engineering Standards, ENS): [standards/](standards/README.md) — [AGGREGATE_IMPLEMENTATION_STANDARD.md](standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (como implementar um Aggregate, ENS-0001), [ARCHITECTURE_REVIEW_GATE_STANDARD.md](standards/ARCHITECTURE_REVIEW_GATE_STANDARD.md) (gate PASS/FAIL obrigatório ao final de toda missão `ENG-`, ENS-0002), [DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md](standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) (como implementar um Domain Service, genérico para qualquer domínio, ENS-0003).

## 8. Fluxo para Criação de Novos Domínios

Nenhum documento anterior definia este fluxo explicitamente — formalizado aqui a partir do padrão real já seguido para o domínio Identity (EPIC-002), a única sequência completa executada até hoje:

1. **Ubiquitous Language** — glossário do domínio, Bounded Context, Aggregates/Entities/VOs/Eventos/Casos de Uso/Regras propostos, restrito a objetos já em [BOM.md](../core/BOM.md) (padrão: `IDENTITY_DOMAIN_MODEL.md`, Missão-tipo `ENG-000X.1`).
2. **Technical Blueprint** — modelo técnico completo reutilizando o Shared Kernel: Aggregate Roots, Entities, Value Objects, Domain Services, Repository Contracts, Specifications, Domain Events, invariantes, regras transacionais, fluxos, limites de Aggregate, ciclo de vida (padrão: `IDENTITY_TECHNICAL_BLUEPRINT.md`, `ENG-000X.2`).
3. **Value Objects** — primeira implementação real, só os Value Objects já modelados no Blueprint (`ENG-000X.3`).
4. **Domain Policies** — avaliação: só implementar Policies **já modeladas** no Blueprint; nunca fabricar preventivamente (`ENG-000X.4`).
5. **Aggregate Design Freeze** — consolidação definitiva de Ownership, limites transacionais, invariantes, navegação, relações permitidas/proibidas, regras de consistência, ciclo de vida, Matriz Aggregate × Componentes; a partir daqui, mudança estrutural exige ADR (`ENG-000X.5`).
6. **Implementação de Aggregates** — seguindo [AGGREGATE_IMPLEMENTATION_STANDARD.md](standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001), com [ARCHITECTURE_REVIEW_GATE_STANDARD.md](standards/ARCHITECTURE_REVIEW_GATE_STANDARD.md) (ENS-0002) como gate final antes do Relatório Final. Executada para os 2 Aggregate Roots do Identity Domain: `User` (`ENG-0002.7`) e `Role` (`ENG-0002.8`), ambos usando `User` como referência estrutural para `Role` (requisito explícito de ENG-0002.8).
7. **Repository Contracts** — contratos de persistência refletindo exclusivamente as necessidades do domínio, nunca um banco de dados; reutilizam `ReadRepository<T>`/`WriteRepository<T>` do Shared Kernel, nenhum método por conveniência técnica ou padrão CRUD sem justificativa (`ENG-0002.9`).
8. **Domain Service Identification** — identificar, classificar (Aggregate Rule / Domain Service Rule / Application Orchestration / Infrastructure Concern) e congelar quais Domain Services realmente existem, segundo os 4 critérios oficiais de existência (envolver mais de um Aggregate, depender de Repository, depender de consulta que o Aggregate não pode realizar, exigir colaboração entre múltiplos objetos) — nenhuma implementação (`ENG-0002.10A`, padrão: `DOMAIN_SERVICE_IDENTIFICATION.md`).
9. **Implementação de Domain Services** — seguindo [DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md](standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) (ENS-0003, genérico para qualquer domínio), com ARG como gate final. Ainda não executada para nenhum domínio — próxima etapa prevista para o Identity Domain é `ENG-0002.10B`, aguardando aprovação do CTO.

Referência viva: [services/kernel/identity/](../../services/kernel/identity/README.md).

## 9. Fluxo para Implementação

Depois do Aggregate Design Freeze (§ 8.5): implementar seguindo [AGGREGATE_IMPLEMENTATION_STANDARD.md](standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) — construtor privado, Factory Methods `create`/`reconstitute` via `Result`, invariantes verificadas em criação e mutação, Domain Events, `organizationId` obrigatório, localização `src/domain/aggregates/<nome>/`. Corresponde à Fase 7 de `EXECUTION_PROTOCOL.md`.

## 10. Fluxo para Validação

Corresponde à Fase 8 de `EXECUTION_PROTOCOL.md` (Constituição, Artigo 19 — nenhuma implementação é considerada concluída sem testes). Checklist de qualidade: [.command-center/ENGINEERING_CHECKLIST.md](../../.command-center/ENGINEERING_CHECKLIST.md). Na Fase 11 (Conclusão), toda missão exige **Self Review + Architecture Compliance Report (ACR)** (desde ENG-0002.A); **Domain Model Validation (DMV)** obrigatório quando a missão envolve modelagem de domínio (desde ENG-0002.4/ENG-0002.5); **Architecture Review Gate (ARG)** obrigatório para toda missão de implementação (`ENG-`) — gate binário PASS/FAIL de 12 critérios, último passo antes do Relatório Final e da aprovação do CTO (desde ENS-0002, [ARCHITECTURE_REVIEW_GATE_STANDARD.md](standards/ARCHITECTURE_REVIEW_GATE_STANDARD.md)).

## 11. Processo de Merge

Checklist de Pull Request já definido: [ENGINEERING_PLAYBOOK.md § 18](ENGINEERING_PLAYBOOK.md#18-pull-request-checklist) (estrutura de camadas respeitada, Object Specification presente, testes, logging, documentação atualizada no mesmo PR, ADR se houve decisão arquitetural). Formato de revisão: [.command-center/CODE_REVIEW.md](../../.command-center/CODE_REVIEW.md). **Requer decisão, não inventado aqui**: número mínimo de aprovações, se CI bloqueia merge automaticamente, política de branch protection — nenhuma fonte anterior define esses parâmetros.

## 12. Processo de Release

[.command-center/RELEASE_CHECKLIST.md](../../.command-center/RELEASE_CHECKLIST.md) — o que precisa ser verdade antes de lançar uma versão. Versionamento segue [CHANGELOG.md](../../CHANGELOG.md) (Keep a Changelog + SemVer).

## 13. Roadmap Macro da Plataforma

Roadmap mestre único, confirmado por [ADR-0008](../../adr/ADR-0008-foundation-freeze.md): [NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md](../../NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md) — 12 fases (Foundation → Core Platform → CRM → AI → Automation → Financial → Projects → Analytics → Marketplace → Public API → White Label → Developer Platform). Foundation concluída; Core Platform (EPIC-002 — Identity Service) em andamento.

## 14. Responsabilidades dos Agentes de IA

5 papéis de IA já definidos em [NEF/ROLES.md](../../NEF/ROLES.md): **Architect AI** (propõe estrutura/impacto, não aprova sozinha), **Engineer AI** (implementa seguindo o Playbook/Standards, nunca sem plano aprovado), **Reviewer AI** (aplica o checklist de PR e o Architecture Review Gate — ENS-0002 — sinaliza, não aprova sozinha), **QA AI** (gera/executa casos de teste, não substitui validação humana de negócio), **Documentation AI** (mantém documentação/CHANGELOG/referências cruzadas atualizadas, nunca inventa conteúdo de negócio sem base documental). Regras de operação de IA: [CONSTITUTION.md § Artigo 13](../core/CONSTITUTION.md), [NOVARIS_CONSTITUTION.md Article XII](../core/NOVARIS_CONSTITUTION.md), [.claude/rules.md](../../.claude/rules.md).

---

## Vigência

A partir desta missão, este Handbook é a porta de entrada recomendada para qualquer novo colaborador ou agente entender o processo de engenharia da NOVARIS de ponta a ponta. Não substitui nenhuma fonte canônica citada — mudanças de **processo** aqui descrito devem ser refletidas primeiro na fonte original, depois aqui.

## Relação com Outros Módulos

- [NES/README.md](../../NES/README.md), [NEF/README.md](../../NEF/README.md) — sobreposição registrada, não resolvida (ver Nota acima)
- [ENGINEERING_PLAYBOOK.md](ENGINEERING_PLAYBOOK.md), [standards/](standards/README.md) — padrões técnicos detalhados
- [PROJECT_RULES.md](../../PROJECT_RULES.md), [architecture/ADM/](../../architecture/ADM/README.md) — governança e índice de decisões
- [services/kernel/identity/](../../services/kernel/identity/README.md) — referência viva do fluxo de criação de domínio (§ 8)

## Status

🟢 Oficial (v1.0.0). Nenhum código alterado, nenhum ADR modificado, nenhuma regra de negócio nova. Sobreposição com NES/NEF resolvida por [ADR-0009](../../adr/ADR-0009-engineering-entry-point-authority.md) (Missão DOC-0001) — ver Nota de Sobreposição acima. Fluxo de validação (§ 10) e Padrões Obrigatórios (§ 7) atualizados para incluir o Architecture Review Gate (Missão ENS-0002). § 7 e § 8 (Fluxo para Criação de Novos Domínios) atualizados para incluir Repository Contracts, Domain Service Identification e o Domain Service Implementation Standard (Missão ENS-0003).
