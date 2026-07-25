# Kernel Domain Lifecycle v2

Versão: 2.0.0

Status: 🟢 OFFICIAL ENGINEERING STANDARD — rege todos os futuros EPICs de domínio do Kernel

Missão: `ENG-0000.5` ("Kernel Domain Lifecycle v2"), conforme recebida na ordem de missão

Escopo: consolidar, num único padrão de processo, a experiência real do EPIC-003 (Organization Domain — `ENG-0003.1` a `ENG-0003.14`), substituindo o fluxo usado experimentalmente ali por um ciclo de vida oficial, com o mesmo rigor arquitetural e menos etapas redundantes. **Esta missão não cria arquitetura de domínio, ADR, código ou Aggregate** — cria exclusivamente um padrão de processo de engenharia.

---

## ⚠️ Duas Correções Registradas Antes do Conteúdo

Esta seção documenta dois achados encontrados ao ler as fontes obrigatórias, resolvidos por precedente já estabelecido nesta engenharia (mesma disciplina de `ORGANIZATION_DOMAIN_DISCOVERY.md`, ENG-0003.1, que redirecionou `organization/` para `organizations/`) — nenhum dos dois foi corrigido nos documentos-fonte, apenas registrado aqui e refletido na localização final deste arquivo.

**1. Localização do arquivo redirecionada.** A ordem de missão pediu `knowledge/core/engineering/KERNEL_DOMAIN_LIFECYCLE_V2.md`. Esse caminho não existe e contraria três fontes já oficiais:
- `PROJECT_RULES.md § Matriz de Autoridade Documental`: "Padrões de implementação por tipo de componente (ENS) → `knowledge/engineering/standards/`" — já a localização canônica declarada para exatamente este tipo de documento.
- `knowledge/engineering/standards/README.md`: descreve seu próprio propósito como "documentos obrigatórios que definem **como** fazer algo... ou executar um **processo de engenharia**" — descrição literal do que este documento é.
- `README.md` (raiz), diagrama de estrutura: `knowledge/` é "memória institucional (**core imutável**, technical, engineering, ...)" — `knowledge/core/` é declarado imutável; um padrão de processo de engenharia, que este próprio documento prevê ser revisado (v3, v4...), não pertence a uma pasta imutável.

Este documento foi criado em **`knowledge/engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md`** — mesmo nome de arquivo exigido pela ordem, pasta corrigida para a já estabelecida como autoridade para Padrões de Engenharia (ENS).

**2. Colisão de Mission ID.** Esta ordem de missão se autodenomina `ENG-0000.5`. Esse ID já foi usado, nesta mesma sessão de engenharia, pela missão **"Foundation Freeze & Governance Integration"** (2026-07-14), que produziu `ADR-0008` e `FOUNDATION_STATUS.md` — documentado em `PROJECT_RULES.md § Nota sobre ENG-0000.5` e `§ Histórico de Emendas`. As duas missões são completamente distintas em conteúdo. Este documento **não resolve** a colisão (fora do escopo desta missão renomear ou reatribuir IDs, e nenhum documento existente pode ser alterado) — apenas a registra como fato, e propõe, em § 2 e § 4 abaixo, uma checagem de unicidade de Mission ID como precondição obrigatória de toda futura missão, exatamente para prevenir recorrência.

---

## 1. Objetivo

O EPIC-003 (Organization Domain) validou, na prática, que o processo de engenharia desenhado originalmente para o Identity Domain (EPIC-002) generaliza para um segundo domínio sem modificação estrutural — mesma sequência de Discovery→Model→Design→Decisions→Freeze→Blueprint→Implementation, mesmo padrão de Aggregate (ENS-0001), mesmo Repository Contract (zero métodos próprios), mesmos relatórios obrigatórios (Self Review, DMV, ACR, ARG).

Ao mesmo tempo, a execução real de 14 missões (`ENG-0003.1` a `.14`) expôs **três problemas concretos** que este Lifecycle v2 resolve:

1. **Documentos de Blueprint redundantes**: `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md` (ENG-0003.10.5) e `ORGANIZATION_MAPPER_BLUEPRINT.md` (ENG-0003.11) especificam a mesma fronteira conceitual (tradução Aggregate ↔ persistência) em dois documentos separados, com citação cruzada extensa e a mesma tabela de campos reafirmada duas vezes.
2. **Missões de auditoria redundantes**: `ORGANIZATION_IMPLEMENTATION_READINESS.md` (ENG-0003.12), a verificação de `ENG-0003.13` e `ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md` (ENG-0003.14) leram as mesmas 10-13 fontes três vezes e chegaram à mesma conclusão de conformidade três vezes — `ENG-0003.13`, em particular, descobriu que seu próprio objetivo ("implementar `create`/`reconstitute`/`updateProfile`") já havia sido cumprido integralmente em `ENG-0003.7`, tornando a missão inteira uma reverificação, não uma implementação nova.
3. **Ausência de checagem de unicidade de Mission ID**: esta própria missão colidiu com um ID já usado (ver seção anterior) — nenhuma etapa do processo anterior verificava isso antes de abrir uma nova missão.

**Aprendizados incorporados**: a disciplina "nunca inventar, sempre marcar bloqueio" (usada de forma consistente em todas as 14 missões) é o único elemento do processo antigo que não deve ser alterado — é reafirmada como Princípio (§ 2), não apenas hábito. A sequência de modelagem pré-código (Discovery→Blueprint) provou-se genuinamente necessária — nenhuma etapa dela é eliminada. O que se reduz é a duplicação de documentos com o mesmo conteúdo conceitual e a duplicação de auditorias de encerramento.

## 2. Princípios

| Princípio | Definição |
|---|---|
| **Architecture First** | Nenhuma linha de Infrastructure/Application é escrita antes de o Domain Layer (Aggregate + Freeze) existir. |
| **Shared Kernel First** | Nenhum domínio reimplementa o que já existe em `packages/shared-kernel/` (`AggregateRoot`, `Result`, `Option`, hierarquia de erros, `Repository`/`ReadRepository`/`WriteRepository`). |
| **No Infrastructure Before Domain** | Repository e Mapper permanecem contrato/blueprint conceitual até o Aggregate estar congelado (Freeze) — implementação real de Infrastructure é sempre a última fase. |
| **No Hidden Decisions** | Toda regra de negócio cita sua fonte exata; o que não tem fonte é marcado "requer decisão" ou "BLOQUEADO POR AUSÊNCIA DE DECISÃO DE DOMÍNIO" — nunca inferido. |
| **ADR Before Divergence** | Toda decisão que resolve contradição entre fontes oficiais, ou que estabelece um mecanismo vinculante para toda a plataforma, exige ADR antes de ser tratada como definitiva (`DEC-ORG-001`→`ADR-ORG-001`; `ADR-0010`, mesmo critério). |
| **Single Source of Truth** | Um documento canônico por assunto (`PROJECT_RULES.md § Matriz de Autoridade Documental`); qualquer sobreposição de conteúdo é registrada e resolvida, nunca deixada como dois documentos concorrentes silenciosos. |
| **Traceability First** | Toda afirmação, em todo documento, cita a seção exata de sua fonte — código, Freeze, Blueprint ou ADR. |
| **Implementation Only After Approval** | Nenhuma missão `ENG-` de implementação abre sem aprovação explícita do CTO sobre o Freeze/Blueprint que a precede. |
| **Verify Before Reimplementing** *(novo, aprendido em `ENG-0003.13`)* | Antes de abrir qualquer missão de implementação, verificar se o alvo já existe em código. Uma missão que conclui "já implementado, sem divergência" é um resultado completo e válido — não uma falha em encontrar trabalho real. |
| **Mission ID Uniqueness** *(novo, aprendido nesta própria missão)* | Antes de abrir qualquer missão, confirmar que seu ID nunca foi usado por outra missão, em qualquer Epic. |

## 3. Novo Lifecycle

```
FASE 1 — Domain Definition
  Domain Discovery
    ↓
  Domain Model
    ↓
  Aggregate Design (rascunho, não congelado)
    ↓
  Domain Decisions (+ ADR, se ADR Before Divergence se aplicar)
    ↓
  Aggregate Design Freeze
    ↓
  Technical Blueprint
    ↓
  [GATE: Architecture Approval — CTO]

FASE 2 — Aggregate & Contract Implementation
  Aggregate Implementation
    ↓
  Value Objects Review (implementar os definidos; bloquear os demais, sem inventar)
    ↓
  Repository Contract
    ↓
  Repository Contract Tests
    ↓
  [GATE: Architecture Review — ARG, ENS-0002]

FASE 3 — Persistence Design
  Persistence & Mapper Blueprint (documento único — ver § 4, unificação)
    ↓
  Implementation Readiness Audit
    ↓
  [GATE: CTO Readiness Approval]

FASE 4 — Infrastructure Implementation
  Infrastructure (Mapper real + Repository concreto + Schema/Migration)
    ↓
  Application Layer
    ↓
  Integration
    ↓
  Production Readiness
    ↓
  [GATE: Architecture Review — ARG, ENS-0002]

FASE 5 — Domain Closure
  Domain Closure Review (documento único — ver § 4, unificação)
    ↓
  [GATE: CTO Final Approval]
    ↓
  EPIC encerrado
```

## 4. Gates Obrigatórios

**Obrigatórios, sem exceção**:
- **Architecture Approval** (fim da Fase 1) — nenhum código antes do Domain Layer congelado; validado em Identity (EPIC-002) e Organization (EPIC-003), nenhuma exceção observada.
- **Architecture Review Gate (ARG)** — obrigatório para toda missão `ENG-` de implementação (Fases 2 e 4), sem mudança em relação a `ARCHITECTURE_REVIEW_GATE_STANDARD.md` (ENS-0002).
- **CTO Readiness Approval** (fim da Fase 3) — nenhuma Infrastructure real antes de uma auditoria de prontidão explícita.
- **CTO Final Approval** (fim da Fase 5) — nenhum Epic é considerado encerrado sem esta aprovação.

**Opcionais / condicionais**:
- **DMV (Domain Model Validation)** — obrigatório só para missões que modelam domínio (Discovery, Model, Design, Decisions, Freeze); **não aplicável** a missões puramente de Infrastructure ou de auditoria de documentação (já praticado informalmente em `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md`/`ORGANIZATION_MAPPER_BLUEPRINT.md`/`ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md`, tornado regra explícita aqui).
- **ACR (Architecture Compliance Report)** — mantido para toda missão, mas pode ser uma tabela curta (não narrativa completa) em missões sem código.

**Unificados** (justificativa em § 7):
- **Persistence Mapping Blueprint + Mapper Blueprint → "Persistence & Mapper Blueprint"** (documento único). Os dois documentos de EPIC-003 especificavam a mesma fronteira Aggregate↔Persistência; a divisão em dois arquivos gerou citação cruzada redundante sem separar responsabilidades genuinamente distintas.
- **Implementation Readiness Audit + Aggregate Implementation Verification + Final Architecture Review → "Domain Closure Review"** (documento único). As três auditorias de EPIC-003 leram as mesmas fontes e produziram a mesma conclusão de conformidade três vezes; uma única revisão de encerramento, executada quando a Fase 4 estiver completa, cobre o mesmo terreno sem repetição.

**Não eliminados** — cada um produziu artefato genuinamente distinto em EPIC-003, sem sobreposição de conteúdo com outro: Domain Discovery, Domain Model, Aggregate Design (rascunho), Domain Decisions, ADR (quando aplicável), Aggregate Design Freeze, Technical Blueprint, Aggregate Implementation, Value Objects Review, Repository Contract, Repository Contract Tests.

## 5. Artefatos Obrigatórios

| Fase | Documento Obrigatório | Documento Opcional | Código Permitido | Código Proibido |
|---|---|---|---|---|
| 1 — Domain Definition | Discovery, Model, Aggregate Design, Decisions, Freeze, Blueprint | ADR (se § 2 "ADR Before Divergence" se aplicar) | Nenhum | Entity, Value Object, Aggregate, Repository, Domain Service, Mapper, teste, Infrastructure |
| 2 — Aggregate & Contract | Self Review + ACR + ARG por missão | Nota de Value Objects Review (se algum VO tiver definição suficiente) | Aggregate (ENS-0001), Value Objects já definidos, Repository Contract (interface, zero método próprio), testes | Domain Service (a menos que já identificado via missão própria, ENS-0003 § 2), Mapper real, Infrastructure, Application Layer, Controller, DTO |
| 3 — Persistence Design | Persistence & Mapper Blueprint (único), Implementation Readiness Audit | Nenhum | Nenhum | Qualquer código real de Mapper/Repository/Prisma/SQL |
| 4 — Infrastructure | Self Review + ACR + ARG | DMV (normalmente N/A — sem modelagem de domínio nova) | Mapper, Repository concreto, Migration, Schema, Application Layer, Controller, DTO — exatamente o já definido nas Fases 1/3, nada além | Qualquer campo/comportamento não definido nas Blueprints |
| 5 — Domain Closure | Domain Closure Review (único) | Nenhum | Nenhum — é revisão, não implementação | Qualquer código, correção ou nova decisão (inconsistências só são registradas, nunca corrigidas dentro da própria revisão) |

## 6. Critérios para Encerramento do EPIC

**Pode ser encerrado quando**:
- O Domain Closure Review (Fase 5) resultar em `APPROVED` ou `APPROVED WITH RESTRICTIONS`, com toda restrição explicitamente listada e aceita pelo CTO.
- Nenhuma contradição de **conteúdo** (não apenas documentação desatualizada) for encontrada entre código e documentação.
- Todo Gate obrigatório de § 4 tiver sido executado e aprovado.

**Deve continuar quando**:
- O Domain Closure Review resultar em `NOT APPROVED`.
- Existir uma decisão marcada "Recomendado"/"Obrigatório para ADR" (mesmo critério de análise usado em `ORGANIZATION_IMPLEMENTATION_READINESS.md § 8`) que seja pré-requisito de algo já implementado.

**Exige ADR quando**:
- Resolve contradição entre fontes oficiais (critério já usado em `DEC-ORG-001` → `ADR-ORG-001`).
- Estabelece mecanismo de infraestrutura vinculante para toda a plataforma (critério já usado em `ADR-0010`).
- Altera algo já congelado em um Freeze ou Blueprint anterior.
- Altera o escopo deste próprio Lifecycle Standard.

## 7. Lições Aprendidas

**Deixaram de ser missões separadas (unificadas ou eliminadas)**:
- `ORGANIZATION_PERSISTENCE_MAPPING_BLUEPRINT.md` + `ORGANIZATION_MAPPER_BLUEPRINT.md` → um único "Persistence & Mapper Blueprint" (§ 4). Motivo: mesma fronteira conceitual, mesma tabela de campos citada duas vezes, sem separação real de responsabilidade entre os dois documentos.
- `ORGANIZATION_IMPLEMENTATION_READINESS.md` + verificação de `ENG-0003.13` + `ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md` → um único "Domain Closure Review" (§ 4). Motivo: as três leram as mesmas fontes, produziram a mesma conclusão de conformidade três vezes; `ENG-0003.13` especificamente descobriu que seu alvo já estava implementado desde `ENG-0003.7`, tornando-se uma reverificação, não uma missão de implementação genuína.

**Permanecem obrigatórias, valor comprovado**:
- A sequência Discovery→Model→Design→Decisions→Freeze→Blueprint antes de qualquer código — encontrou e resolveu 5 decisões reais (`DEC-ORG-001..005`) e produziu 1 ADR (`ADR-ORG-001`) antes de qualquer linha de `organization.ts`.
- Value Objects Review como gate explícito "implementar ou bloquear" (`ENG-0003.8`) — impediu inventar validação de formato para `Slug`/`Document`/`Address`/`BrandingTheme` sem fonte.
- Repository Contract Tests como verificação estrutural/de tipo pura, quando Fake/Mock não é autorizado (`ENG-0003.10`) — técnica nova e reutilizável, agora documentada como padrão aceito, não mais um workaround isolado.
- Self Review + ACR + ARG para toda missão com código — sem alteração (`ENS-0002`).
- "Nunca inventar, sempre marcar bloqueio" — a disciplina central de toda a experiência de EPIC-003, elevada a Princípio (§ 2).

**Achado novo desta própria missão**: colisão de Mission ID (`ENG-0000.5` reutilizado — ver "⚠️ Duas Correções Registradas" acima) e desalinhamento de localização de arquivo pedida vs. já oficial. Ambos incorporados como prevenção ativa: "Mission ID Uniqueness" (§ 2) e a recomendação implícita de sempre verificar a Matriz de Autoridade Documental (`PROJECT_RULES.md`) antes de criar um documento em local não convencional.

## 8. Fluxo Oficial

```
INÍCIO DO EPIC
  │
  ├─ Verificar unicidade do Mission ID (novo, § 2)
  │
  ▼
FASE 1 (Domain Definition) ── [GATE: Architecture Approval] ──┐
                                                                │
  ▼                                                            │
FASE 2 (Aggregate & Contract) ── [GATE: ARG] ──┐              │
                                                 │              │
  ▼                                             │              │
FASE 3 (Persistence Design) ── [GATE: CTO Readiness Approval] ┤
                                                 │              │
  ▼                                             │              │
FASE 4 (Infrastructure) ── [GATE: ARG] ─────────┤              │
                                                 │              │
  ▼                                             │              │
FASE 5 (Domain Closure Review) ── [GATE: CTO Final Approval] ─┘
  │
  ▼
EPIC ENCERRADO — próximo Epic pode abrir
```

Qualquer reprovação em um Gate retorna o fluxo à fase correspondente (mesmo padrão já em vigor em `ARCHITECTURE_REVIEW_GATE_STANDARD.md § Formato do Relatório`, "Gate: ❌ FAIL — missão retorna à Fase 7/8 até resolução") — nunca avança para a fase seguinte com uma pendência de Gate obrigatório em aberto.

## 9. Checklist do CTO

Checklist operacional, a ser usado antes de qualquer aprovação final de domínio:

- [ ] Mission ID desta e de toda missão do Epic verificado como único (nunca reutilizado).
- [ ] Fase 1 completa: Discovery, Model, Design, Decisions, Freeze e Blueprint existem e não se contradizem.
- [ ] Toda decisão que exigia ADR (`ADR Before Divergence`, § 2) tem uma ADR real, não apenas uma recomendação registrada.
- [ ] Nenhuma implementação diverge do Freeze/Blueprint sem uma ADR justificando a divergência.
- [ ] Aggregate implementado (Fase 2) passa em build/lint/test — evidência anexada, não apenas alegada.
- [ ] Repository Contract implementado sem nenhum método de conveniência não autorizado.
- [ ] Persistence & Mapper Blueprint (Fase 3) não define tecnologia, ORM ou banco.
- [ ] Implementation Readiness Audit (Fase 3) classificou o domínio como `READY`, `READY WITH CONDITIONS` ou `BLOCKED` — nunca ambíguo.
- [ ] Toda lacuna de domínio está marcada "requer decisão"/"BLOQUEADO", nunca preenchida por inferência, em toda a cadeia documental.
- [ ] Dívida técnica (equivalente ao Technical Debt Register de `ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md § 7`) está listada por severidade, não omitida.
- [ ] Domain Closure Review (Fase 5) produziu uma Decisão Final única (`APPROVED`/`APPROVED WITH RESTRICTIONS`/`NOT APPROVED`), com justificativa técnica.
- [ ] Link Checker executado após o lote de mudanças, com `-Root` explícito, 0 links quebrados.
- [ ] Nenhum documento existente foi alterado por uma missão cujo escopo não autorizava alteração.

## 10. Status

🟢 **OFFICIAL ENGINEERING STANDARD**. A partir desta missão, este documento rege o ciclo de vida de todo futuro EPIC de domínio do Kernel da NOVARIS, substituindo o fluxo experimental usado em EPIC-003 como referência de processo (o conteúdo e as aprovações já obtidas pelo Organization Domain, incluindo `ORGANIZATION_FINAL_ARCHITECTURE_REVIEW.md § 10` — `APPROVED WITH RESTRICTIONS` —, permanecem válidas e não são reabertas por este documento). Mudar este Standard exige ADR, mesmo padrão já vigente para `AGGREGATE_IMPLEMENTATION_STANDARD.md` e `ARCHITECTURE_REVIEW_GATE_STANDARD.md`.

---

## Relação com Outros Módulos

- [knowledge/engineering/standards/README.md](README.md) — índice de Standards (ENS); este documento não altera esse arquivo (fora do escopo desta missão), mas pertence estruturalmente ao mesmo grupo de `AGGREGATE_IMPLEMENTATION_STANDARD.md`, `ARCHITECTURE_REVIEW_GATE_STANDARD.md`, `DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md`
- [PROJECT_RULES.md § Matriz de Autoridade Documental](../../../PROJECT_RULES.md) — fonte da localização correta deste documento
- [services/kernel/organizations/](../../../services/kernel/organizations/README.md) — domínio de origem de toda a experiência consolidada aqui (`ORGANIZATION_*`, EPIC-003)
- [services/kernel/identity/](../../../services/kernel/identity/README.md) — primeiro domínio a validar o processo original (EPIC-002), citado por comparação

## Status do Arquivo

🟢 Documento criado (Missão `ENG-0000.5`, conforme ID recebido — colisão registrada acima, não resolvida). Nenhum código, ADR, Aggregate, Repository, Mapper, teste ou Domain Service criado. Nenhum documento existente alterado. Aguardando aprovação formal do CTO.
