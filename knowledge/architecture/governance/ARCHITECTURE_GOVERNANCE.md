# NOVARIS — Architecture Governance Framework

Versão: 1.0.0

Status: 🟢 Oficial — regras de governança para a evolução arquitetural futura da plataforma

Missão: ENG-0018 (NOVARIS Architecture Governance Framework)

Escopo: consolidar, como regras de governança vinculantes, os princípios, processos e padrões já estabelecidos e validados ao longo desta engenharia (EPIC-001 a EPIC-007). Nenhuma regra nova é inventada — cada uma cita a missão/documento onde já foi decidida ou comprovada na prática. Nenhum código de domínio, serviço, contrato ou Aggregate foi alterado.

---

## 1. Propósito

A NOVARIS está sendo construída como um **Business Operating System**, não um CRM simples — a arquitetura deve permanecer modular, orientada a domínio (DDD), nativa em IA, pronta para multi-tenancy, e escalável como SaaS (contexto desta missão, consistente com `NOVARIS_OS.md`). Este documento formaliza as regras que **controlam a evolução arquitetural futura** — distinto de `NOVARIS_PLATFORM_ARCHITECTURE.md` (ENG-0017), que é uma **fotografia do estado atual**; este é o conjunto de regras que rege o que vem a seguir.

## 2. Princípios Arquiteturais

Reproduzidos de `KERNEL_DOMAIN_LIFECYCLE_V2.md § 2` (já oficial, `knowledge/engineering/standards/`), sem alteração:

| Princípio | Aplicação |
|---|---|
| Architecture First | Nenhuma linha de Infrastructure/Application antes do Domain Layer existir e estar congelado |
| Shared Kernel First | Nenhum domínio reimplementa o que já existe em `packages/shared-kernel/` |
| No Infrastructure Before Domain | Repository/Mapper permanecem conceituais até o Aggregate estar congelado |
| No Hidden Decisions | Toda regra de negócio cita fonte; o que não tem fonte é "requer decisão", nunca inferido |
| ADR Before Divergence | Toda decisão que resolve contradição entre fontes oficiais, ou estabelece mecanismo vinculante para toda a plataforma, exige ADR |
| Single Source of Truth | Um documento canônico por assunto (`PROJECT_RULES.md § Matriz de Autoridade Documental`) |
| Traceability First | Toda afirmação cita a seção exata de sua fonte |
| Implementation Only After Approval | Nenhuma missão `ENG-` de implementação abre sem aprovação do CTO sobre o Freeze/Blueprint anterior |
| Verify Before Reimplementing | Antes de implementar, verificar se o alvo já existe (`ENG-0003.13`) |
| Mission ID Uniqueness | Confirmar que o ID de toda nova missão nunca foi usado (lição de `ENG-0000.5`) |

Adicional a estes 10, formalizado pela prática de `EPIC-007` (`ENG-0009` a `ENG-0017`), nunca antes explicitado como princípio próprio:

| Princípio (novo, consolidado da prática) | Fonte |
|---|---|
| **Evidence Before Freeze** — nenhum domínio prossegue a Design Freeze sem evidência documental (Bounded Context, linguagem ubíqua, ao menos um Aggregate candidato com critério estrutural) | `CRM_DOMAIN_DISCOVERY.md` (ENG-0015), único caso até agora onde um domínio foi formalmente bloqueado por insuficiência de evidência |
| **Product ≠ Domain** — um produto nunca é, em si, uma fronteira de dados; é entregue por 1+ domínios | `ADR-0007`, reafirmado em `PRODUCT_DOMAIN_ARCHITECTURE.md` (ENG-0016) |

## 3. Regras Obrigatórias

- Todo Aggregate segue `AGGREGATE_IMPLEMENTATION_STANDARD.md` (ENS-0001) — construtor privado, `create()`/`reconstitute()`, `Result<T, DomainError>`, nunca lança exceção.
- Todo Domain Service segue `DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md` (ENS-0003) — só existe se envolver múltiplos Aggregates, depender de Repository, ou exigir consulta que o Aggregate não resolve sozinho.
- Toda missão `ENG-` de implementação produz Self Review + ACR + ARG (`ARCHITECTURE_REVIEW_GATE_STANDARD.md`, ENS-0002, 12 critérios) antes de ser considerada concluída.
- Todo Aggregate que representa dado de negócio carrega `organizationId` — multi-tenancy nunca é responsabilidade do próprio Aggregate impor sozinho (RLS é a última barreira, `ENS-0001 § 7`).
- Nenhuma regra de negócio é inventada — toda invariante cita fonte documentada ou é marcada `requer decisão`.
- Todo novo domínio verifica unicidade de Mission ID antes de abrir (lição de `ENG-0000.5`).
- Link Checker (`-Root` explícito) executado após todo lote de mudanças documentais.

## 4. Processo de Criação de Domínio

`KERNEL_DOMAIN_LIFECYCLE_V2.md § 3`, processo oficial e único, reproduzido:

```
FASE 1 — Domain Definition
  Discovery → Model → Aggregate Design (rascunho) → Decisions (+ ADR se necessário)
    → Aggregate Design Freeze → Technical Blueprint → [GATE: Architecture Approval]

FASE 2 — Aggregate & Contract Implementation
  Aggregate Implementation → Value Objects Review → Repository Contract
    → Repository Contract Tests → [GATE: Architecture Review, ARG]

FASE 3 — Persistence Design
  Persistence & Mapper Blueprint (documento único) → Implementation Readiness Audit
    → [GATE: CTO Readiness Approval]

FASE 4 — Infrastructure Implementation
  Infrastructure → Application Layer → Integration → Production Readiness
    → [GATE: Architecture Review, ARG]

FASE 5 — Domain Closure
  Domain Closure Review → [GATE: CTO Final Approval] → Epic encerrado
```

**Gate adicional, antes da Fase 1 começar**, formalizado pela prática (`ENG-0015`): se a Discovery inicial não encontrar evidência suficiente (Bounded Context, ao menos um Aggregate candidato, linguagem ubíqua mínima), o domínio é declarado `Design Freeze Blocked` e a Fase 1 não prossegue até a lacuna ser resolvida — nunca inventada para "destravar" a missão.

## 5. Processo de ADR

Uma ADR é **obrigatória** quando a decisão:
- Resolve contradição entre fontes oficiais já existentes (precedente: `DEC-ORG-001` → `ADR-ORG-001`).
- Estabelece um mecanismo vinculante para **toda** a plataforma, não só um domínio (precedente: `ADR-0010`, estratégia de credencial).
- Altera algo já congelado em um Freeze/Blueprint anterior.
- Redireciona a autoridade de um documento já declarado oficial (precedente: `ADR-0008`, `ADR-0009`).

Uma ADR **não é necessária** quando a decisão é:
- Nomenclatura ou modelagem específica de um domínio isolado (precedente: nomeação de Value Objects como `Email`/`Permission`, nunca exigiu ADR).
- Confirmação de um candidato a Aggregate já sugerido pela evidência (precedente: `Organization`, `AuditEntry`).
- Redirecionamento de scaffolding vazio para conteúdo já real, sem mudar decisão de arquitetura (precedente: `ADR-0008`/`ADR-0009` cobrem isso mesmo sem criar ADR nova a cada redirecionamento subsequente).

Toda ADR segue `adr/TEMPLATE.md` (10 campos: Problema, Contexto, Alternativas, Escolha, Consequências, Responsável, Data, Impactos, Plano de Migração, Status) e nunca é reescrita — decisões supersedidas ganham uma ADR nova que revoga/emenda a anterior (precedente: `ADR-0004` revoga `ADR-0003`; `ADR-0007` emenda `ADR-0006`).

## 6. Modelo de Ownership

Critérios aplicados, nesta ordem, sem exceção (`DOMAIN_OWNERSHIP.md § 2`, ENG-0012):

1. **Implementação real** — Owner é o Bounded Context onde o código vive.
2. **Decisão explícita do CTO** — prevalece sobre citação de fonte mais antiga.
3. **Citação única em `DOMAIN_MODEL.md`** — se citado em exatamente um domínio, esse é o Owner.
4. **Ausência de fonte, ou citação em mais de um domínio sem decisão resolvendo** — `Ownership Pending CTO Decision`, nunca inferido.
5. **Domínio não confirmado como Business Domain** — todo objeto listado sob ele é `Pending`, mesmo citado uma única vez.

**Regra de uso**: nenhum código real pode referenciar um conceito com Owner `Pending` — fazê-lo inventaria uma decisão de domínio (`DOMAIN_OWNERSHIP.md § 6`).

## 7. Regras de Dependência

- Nenhum domínio depende de um domínio posicionado **depois** dele na cadeia de `DOMAIN_MODEL.md § DEPENDÊNCIAS` (`Identity → Organization → Customer → Sales → Activity → Projects → Marketing → Knowledge → Financial → Analytics → System`).
- Toda referência entre Aggregates é por `UniqueEntityId` — nunca por objeto embutido.
- `Identity` e `Organization` são Open Host Services — todo domínio pode depender deles; nenhum pode ser embutido ou reescrito.
- Um domínio que precisa traduzir eventos/dados de outro sem se acoplar a ele usa Anti-Corruption Layer (precedente: `Audit` sobre `Identity`/`Organization`).
- `packages/shared-kernel/` é reutilizado integralmente por todo domínio — nunca modificado por uma missão de domínio específico.

## 8. Padrões Proibidos

Consolidado de todas as violações já identificadas e corrigidas/evitadas nesta engenharia:

- Embutir o objeto de outro Aggregate diretamente — sempre referência por id.
- Referência cross-Organization (um Aggregate de uma Organization apontando para dado de outra).
- Fabricar abstração (Specification, Policy, Domain Service) sem modelagem real que a exija (`ENG-0002.4`, zero Policies criadas por falta de modelagem).
- Adicionar método de conveniência a um Repository Contract sem necessidade confirmada — exceção apenas quando a consulta é a responsabilidade primária que já justificou o Aggregate (precedente: `Audit`, consulta por `Target`).
- Reutilizar um Mission ID já usado por outra missão.
- Tratar uma pasta de scaffolding do Kernel como domínio ativo sem Discovery formal (precedente: `Permission`, `Event Bus`, `CRM`).
- Resolver silenciosamente um conflito entre documentos oficiais sem ADR, quando `§ 5` exige uma.
- Reescrever o corpo de um documento já declarado oficial — só redirecionamento/nota, nunca reescrita (precedente: `NOVARIS_CONSTITUTION.md`, `NES/README.md`).
- Inventar Owner para um conceito `Ownership Pending CTO Decision`.
- Presumir Design Freeze sem evidência documental suficiente (`Evidence Before Freeze`, § 2).

## 9. Consistência com `NOVARIS_PLATFORM_ARCHITECTURE.md`

Verificada, sem contradição: a ordem de precedência documental (§ 4 daquele documento) é a mesma reproduzida aqui indiretamente através do princípio "Single Source of Truth"; as regras de dependência (§ 10 daquele documento) são idênticas às de § 7 aqui; nenhuma pendência listada em `NOVARIS_PLATFORM_ARCHITECTURE.md § 12` é resolvida por este documento — este é um framework de **processo futuro**, não uma nova rodada de decisões sobre os itens já pendentes.

## 10. Governança Deste Documento

Mudar qualquer regra deste framework exige, no mínimo, uma nova missão de governança explícita (mesmo padrão de `KERNEL_DOMAIN_LIFECYCLE_V2.md § Vigência`) — nunca alterado como efeito colateral de uma missão de domínio específico.

---

## Validações

- **Markdown validation**: estrutura de cabeçalhos e tabelas verificada visualmente, consistente com o padrão já usado em todo `knowledge/architecture/`.
- **Link Checker** (`-Root` explícito): ver ENG-0018 FINAL REPORT.
- **Documentation consistency check**: nenhuma contradição encontrada com `NOVARIS_PLATFORM_ARCHITECTURE.md` (§ 9 acima) ou com qualquer ENS/ADR já vigente.

## Relação com Outros Módulos

- [../decisions/NOVARIS_PLATFORM_ARCHITECTURE.md](../decisions/NOVARIS_PLATFORM_ARCHITECTURE.md) (ENG-0017) — estado atual consolidado, base de consistência
- [../../engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md](../../engineering/standards/KERNEL_DOMAIN_LIFECYCLE_V2.md) — processo de domínio, fonte de §§ 2, 4
- [../../engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md](../../engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md), [ARCHITECTURE_REVIEW_GATE_STANDARD.md](../../engineering/standards/ARCHITECTURE_REVIEW_GATE_STANDARD.md), [DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md](../../engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) — ENS-0001/0002/0003, fonte de § 3
- [../decisions/DOMAIN_OWNERSHIP.md](../decisions/DOMAIN_OWNERSHIP.md) (ENG-0012) — fonte de § 6
- [../../../adr/README.md](../../../adr/README.md), [../../../adr/TEMPLATE.md](../../../adr/TEMPLATE.md) — fonte de § 5

## Status

🟢 Framework de governança arquitetural oficial (Missão ENG-0018). Nenhum código de domínio, serviço, contrato ou Aggregate alterado.
