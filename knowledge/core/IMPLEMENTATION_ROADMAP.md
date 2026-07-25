# IMPLEMENTATION_ROADMAP.md

Versão: 1.1

Status: Oficial

Autoridade: Chief System Architect

⚠️ **Nota de Atualização (ENG-0026, `ADR-0015`)**: Risco R5 resolvido, marco M12 encerrado, cadeia de dependências (§ 2) e diagrama (§ 3) atualizados para remover `Knowledge`/`AI`/`Automation` — todos reclassificados como não-domínios (`ADR-0013`/`ADR-0014`/`ADR-0015`, sincronizados em `DOMAIN_MODEL.md` por `ENG-0024`/`ENG-0026`). Renumeração completa dos marcos M3-M13 não executada — fora de escopo, registrada como item futuro.

Escopo: organização de execução. Nenhuma arquitetura é alterada por este documento — ele sequencia o que já foi definido em `SYSTEM_ARCHITECTURE.md`, `DOMAIN_MODEL.md`, `BOM.md`, `CANONICAL_DATA_MODEL.md` e `services/`.

> 🗺️ **Roadmap especializado** ([ADR-0008](../../adr/ADR-0008-foundation-freeze.md), Missão ENG-0000.5): este documento cobre o sequenciamento interno Kernel→Domínios da fase **Foundation**. O roadmap mestre único da plataforma (todas as 12 fases) é [NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md](../../NEF/06-evolution/MASTER_ENGINEERING_ROADMAP.md).

---

## 1. Visão Geral do Programa

A NOVARIS está sendo construída de baixo para cima: **Kernel** (infraestrutura compartilhada, `services/`, Missão ARCH-001) → **Domínios de negócio** (originalmente 13 domínios de `DOMAIN_MODEL.md`, **10 ativos após `ENG-0024`/`ENG-0026`** — `AI`/`Automation`/`Knowledge` reclassificados como não-domínios, `ADR-0013`/`ADR-0014`/`ADR-0015`) → **Produtos** (camada voltada ao cliente, `PRODUCTS.md`/`specifications/`). Essa ordem corresponde às camadas já definidas em [SYSTEM_ARCHITECTURE.md § 3](SYSTEM_ARCHITECTURE.md): Kernel → Business Domains → Integration Layer → Infrastructure.

Estado real hoje: Kernel estruturado (20 módulos, `README.md`/`CONTRACT.md` de referência, nenhuma implementação de código); 4 de ~69 entidades do BOM com Object Specification completa; nenhum domínio de negócio iniciado; nenhum produto implementado. Este roadmap organiza o caminho daqui até a plataforma funcional — não descreve um estado hipotético diferente do que já existe.

## 2. Dependências entre Fases

- **Kernel bloqueia Domínios**: nenhum domínio de negócio pode ser implementado antes do Kernel, porque todo domínio consome o Kernel ([SYSTEM_ARCHITECTURE.md § 4](SYSTEM_ARCHITECTURE.md), [NOVARIS_CONSTITUTION.md Article IV](NOVARIS_CONSTITUTION.md)).
- **Dentro do Kernel**: fases A→G já definidas em [services/kernel/README.md](../../services/kernel/README.md) (Fundação → Identidade → Governança → Dados → Comunicação → Inteligência/Automação → Observabilidade/Integração).
- **Entre Domínios**: ordem já definida em [DOMAIN_MODEL.md § DEPENDÊNCIAS](DOMAIN_MODEL.md) — Identity → Workspace → Relationship → Sales → Activity → Project → Marketing → Financial → Analytics → System, com a regra "nenhum domínio pode depender de um domínio abaixo dele". **Atualizado (ENG-0026)**: `Knowledge`, `AI` e `Automation` removidos desta cadeia — `DOMAIN_MODEL.md` os reclassificou como não-domínios (`ADR-0013`/`ADR-0014`/`ADR-0015`); esta linha refletia a cadeia original antes das reconciliações `ENG-0024`/`ENG-0026`.
- ⚠️ **Nota, não resolvida aqui**: `DOMAIN_MODEL.md` trata "Identity" como Domain; o Kernel já entrega os módulos `identity/`, `users/`, `roles/`, `permissions/` na Fase B. Este roadmap trata a Fase B do Kernel como o que satisfaz a posição "Identity" da cadeia de domínios, para não reconstruir a mesma coisa duas vezes — é uma leitura prática, não uma resolução formal da tensão já registrada em `PROJECT_RULES.md`.

## 3. Ordem Obrigatória de Implementação

```
Kernel Fase A (Logging, Event Bus)
  ↓
Kernel Fase B (Identity, Organizations, Users, Roles, Permissions)  ── satisfaz "Identity Domain"
  ↓
Kernel Fase C (Audit, Configuration, Feature Flags)
  ↓
Kernel Fase D (Storage, Files)
  ↓
Kernel Fase E (Notifications, Realtime)
  ↓
Kernel Fase F (AI Runtime, Automation Runtime, Scheduler)
  ↓
Kernel Fase G (Search, Monitoring, Integration Hub)
  ↓
Domínio Workspace → Relationship → Sales → Activity → Project → Marketing
  ↓
Domínio Financial → Analytics → System
```

**Atualizado (ENG-0026, `ADR-0015`)**: `Domínio Knowledge` removido deste diagrama — Risco R5 resolvido (`ADR-0015`), `Knowledge` não é mais um domínio a ser implementado, foi absorvido pela AI Transversal Intelligence Layer. `AI`/`Automation` também removidos — já reclassificados como não-domínios por `ADR-0013`/`ADR-0014` (Kernel Fase F acima já cobre `AI Runtime`/`Automation Runtime` como Infrastructure Capability).

Nenhuma fase começa antes da anterior atingir seu Critério de Saída (§ 5).

## 4. Marcos (Milestones)

Sem estimativa de data ou duração — não há dado de equipe/velocidade em nenhum documento (mesma lacuna já registrada em [MASTER_ROADMAP.md](MASTER_ROADMAP.md)). Marcos definidos por entrega, não por calendário:

| Marco | Definição de Conclusão |
|---|---|
| M0 — Kernel Operacional | 20 módulos de `services/` com `CONTRACT.md` completo, implementados e testados |
| M1 — Identidade Real | `objects/User.md`, `Role.md`, `Permission.md` com os 20 campos completos (hoje parciais); tabelas reais criadas conforme `CANONICAL_DATA_MODEL.md` |
| M2 — Primeiro Domínio de Negócio | Domínio Workspace implementado ponta a ponta (Object Specifications, tabelas, API, testes) |
| M3-M11 | Um marco por domínio subsequente, na ordem do § 3 (numeração original preservada, histórica — a lista de domínios em § 3 mudou após `ENG-0024`/`ENG-0026`, ver nota abaixo) |
| ~~M12 — Domínio Knowledge Resolvido~~ | **Resolvido (ENG-0026, `ADR-0015`)**: a decisão explícita que este marco pedia já foi tomada — `Knowledge` foi absorvido pela AI Transversal Intelligence Layer, não é um domínio a implementar. Deixa de ser um marco de implementação pendente; numeração `M12` preservada como histórico, não reutilizada |
| M13 — Primeiro Produto | Primeiro produto de `PRODUCTS.md`/`specifications/` implementado sobre os domínios já prontos. Numeração preservada como no original — renumeração formal de M3-M13 (para refletir que `Knowledge`/`AI`/`Automation` saíram da sequência de domínios a implementar) não executada nesta missão, fora de escopo, registrada como item de manutenção futura |

## 5. Critérios de Entrada e Saída por Fase

Reaproveita o padrão já definido em [.command-center/EXECUTION_PROTOCOL.md](../../.command-center/EXECUTION_PROTOCOL.md):

- **Entrada de qualquer fase de domínio**: fase anterior no Critério de Saída; Object Specification de cada entidade envolvida escrita ([BOM.md § 1](BOM.md), [NOVARIS_CONSTITUTION.md Article V](NOVARIS_CONSTITUTION.md)); Specification funcional escrita (`specifications/<dominio>/` ou `specs/`, conforme a sobreposição entre os dois for resolvida — ver Risco R3).
- **Saída de qualquer fase**: `CONTRACT.md`/API implementados; testes executados (Fase 8 de `EXECUTION_PROTOCOL.md`); documentação e `CHANGELOG.md` atualizados (Fases 9-10); nenhum critério de aceite pendente.
- **Entrada/saída específicas de cada módulo de Kernel**: já tabeladas em [services/kernel/README.md](../../services/kernel/README.md).

## 6. Riscos

Nenhum risco abaixo é novo — todos já estão registrados em [PROJECT_RULES.md](../../PROJECT_RULES.md); este documento os organiza por impacto na execução, não os descobre.

| # | Risco | Impacto na Execução |
|---|---|---|
| R1 | Duas Constituições coexistem (`CONSTITUTION.md` e `NOVARIS_CONSTITUTION.md`) sem hierarquia resolvida | Uma implementação pode seguir a regra errada se as duas divergirem em um caso real |
| R2 | 5 listas de domínio/produto divergentes (`NOVARIS_OS.md` 6, `PRODUCTS.md` 9, `ORGANIZATION.md` 10, `SYSTEM_ARCHITECTURE.md` 15, `DOMAIN_MODEL.md` 13) | Nomear um domínio/produto errado ao criar `apps/`, `specifications/<dominio>/` ou documentação nova |
| R3 | `specs/` e `specifications/` disputam ser a origem de toda feature | Uma feature pode nascer no lugar que depois é descontinuado |
| R4 | `DOMAIN_MODEL.md` contradiz a própria regra (`Task`, `Queue`, `Subscription`, `Release` em dois domínios cada) | Risco de criar a mesma tabela duas vezes, uma por domínio |
| R5 | ~~Domínio Knowledge não tem nenhum objeto do BOM mapeável~~ | **Resolvido (ENG-0026, `ADR-0015`)** — decisão explícita tomada: `Knowledge` não é um domínio, foi absorvido pela AI Transversal Intelligence Layer. Marco M12 encerrado, não mais um bloqueio ativo |
| R6 | 65 de ~69 entidades do BOM sem Object Specification real | **Bloqueia** qualquer tabela dessas entidades por `BOM.md § 1`/`NOVARIS_CONSTITUTION.md Article V` |
| R7 | Stack de `NOVARIS_OS.md § 13` (Gemini, OpenRouter, NVIDIA NIM, Make, Docker) nunca virou ADR | Uso dessas tecnologias sem ADR viola `PROJECT_RULES.md` |
| R8 | `MONOREPO_ARCHITECTURE.md` diverge do scaffolding real (`services/`, `database/`, `infrastructure/` vs. `integrations/`, `supabase/` propostos) | Ambiguidade sobre onde código de integração externa deve viver |

## 7. Estratégia de Paralelização

- **Dentro da Fase A do Kernel**: `logging/` e `event-bus/` não dependem um do outro — paralelizáveis.
- **Dentro da Fase B**: `organizations/`, `users/`, `roles/`, `permissions/` dependem de `identity/`, mas não entre si — paralelizáveis após `identity/` pronto.
- **Entre domínios de negócio**: `DOMAIN_MODEL.md § DEPENDÊNCIAS` declara "nenhum domínio pode depender de um domínio abaixo dele" como cadeia estritamente sequencial — este roadmap **não** propõe paralelizar domínios, porque isso exigiria alterar uma regra de arquitetura já definida, fora do escopo desta missão ("não alterar a arquitetura").
- Dentro de um mesmo domínio, módulos sem dependência declarada entre si (ex.: dois objetos irmãos sem FK um para o outro) podem ser paralelizados — decisão caso a caso no momento da implementação.

## 8. Estratégia de Testes

Base: [NOVARIS_CONSTITUTION.md Article XV](NOVARIS_CONSTITUTION.md) (testes unitários, integração, validação funcional, critérios de aceite atendidos antes de considerar pronto) e [.command-center/EXECUTION_PROTOCOL.md Fase 8](../../.command-center/EXECUTION_PROTOCOL.md). **Requer decisão**: ferramenta/framework de teste — [engineering/estrategia-de-testes.md](../../engineering/estrategia-de-testes.md) continua `TODO`, nenhum documento oficial escolheu uma ferramenta ainda.

## 9. Estratégia de Deploy

Plataforma de deploy já fixa: Vercel ([architecture/stack-tecnologica.md](../../architecture/stack-tecnologica.md), [DATABASE_ARCHITECTURE.md § 18](DATABASE_ARCHITECTURE.md) para o lado de banco via Supabase). **Requer decisão**: pipeline de CI/CD concreto — [engineering/pipeline-ci-cd.md](../../engineering/pipeline-ci-cd.md) continua `TODO`.

## 10. Estratégia de Rollback

Princípio já estabelecido: toda migration com potencial destrutivo exige revisão explícita antes de aplicar ([DATABASE_ARCHITECTURE.md § 17](DATABASE_ARCHITECTURE.md)), e todo `IMPLEMENTATION_PLAN.md` já exige um "Plano de Testes" e critério de aceite antes da aprovação — mas nenhum documento define o mecanismo concreto de rollback (ex.: feature flag para desativar um domínio recém-lançado, ou reversão de migration). **Requer decisão** por fase, no momento em que a fase for planejada em detalhe (`.command-center/IMPLEMENTATION_PLAN.md`).

## 11. Critérios de Aceite

Este roadmap é aceito quando:

- Toda fase do § 3 tem entrada/saída definida (§ 5) — cumprido.
- Todo risco conhecido está listado (§ 6) — cumprido, refletindo o estado atual de `PROJECT_RULES.md`.
- Nenhuma arquitetura foi alterada para produzir este documento — cumprido; nenhuma nota de conflito foi resolvida aqui, todas continuam pendentes onde já estavam.
- Este documento não inventa data, duração ou ferramenta que nenhum documento anterior definiu — cumprido; três pontos (§ 8-10) ficam explicitamente "requer decisão".

---

## Relação com Outros Módulos

- [services/kernel/README.md](../../services/kernel/README.md) — fases A-G detalhadas, que este roadmap referencia sem repetir
- [DOMAIN_MODEL.md](DOMAIN_MODEL.md) — ordem de domínios que este roadmap referencia sem repetir
- [MASTER_ROADMAP.md](MASTER_ROADMAP.md) — roadmap de produto por fase (Fase 1/Fase 2, de `NOVARIS_OS.md`); este documento é o roadmap de execução técnica, camada diferente, mesma disciplina de não inventar datas
- [.command-center/EXECUTION_PROTOCOL.md](../../.command-center/EXECUTION_PROTOCOL.md) — as 11 fases que cada unidade de trabalho dentro deste roadmap deve seguir
- [PROJECT_RULES.md](../../PROJECT_RULES.md) — origem de todos os riscos do § 6

## Status

🟢 Oficial (v1.0). Organiza execução do que já foi definido; não altera arquitetura nem resolve nenhum dos 11 conflitos já registrados em `PROJECT_RULES.md`. 3 pontos (Testes, Deploy, Rollback) marcados "requer decisão" em vez de preenchidos com ferramenta/prazo inventado.
