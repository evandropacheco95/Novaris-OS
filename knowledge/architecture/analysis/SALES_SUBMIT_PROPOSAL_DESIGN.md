# Sales — SubmitProposal Design Resolution

Versão: 1.0.0

Status: 🟢 Decisão de design tático registrada — sem alteração de código

Missão: ENG-0048 (SubmitProposal Design Resolution)

Escopo: resolver, com evidência exclusivamente arquitetural, a lacuna identificada por [SALES_IMPLEMENTATION_READINESS.md § 6/§ 7 item 11](SALES_IMPLEMENTATION_READINESS.md) — nenhum método `submitProposal()` existe em `opportunity.ts` (`ENG-0044`), que hoje implementa apenas `addProposal(proposal: Proposal)`, recebendo uma `Proposal` já construída fora do Aggregate. Nenhum código foi alterado por esta missão — `opportunity.ts`/`proposal.ts` permanecem exatamente como estavam; a decisão aqui registrada é vinculante para uma futura missão de implementação.

---

## 1. Contexto

`SALES_TECHNICAL_BLUEPRINT.md § 6` lista `SubmitProposal` como Command candidato, ao lado de `CreateOpportunity`/`AdvanceOpportunityStage`/`ApproveProposal`/`MarkOpportunityWon`/`MarkOpportunityLost` — todos os outros 5 já mapeiam 1:1 para um método público de `Opportunity` (`create()`, `advanceStage()`, `approveProposal()`, `markWon()`, `markLost()`). `SubmitProposal` é o único sem correspondência direta: o que existe é `addProposal(proposal: Proposal)`, que pressupõe que a `Proposal` já foi construída (via `Proposal.create()`, chamada fora de `Opportunity`) antes de ser adicionada.

`proposal.ts § cabeçalho` (`ENG-0040`) já registrava a intenção, mesmo antes desta análise: *"Não existe independentemente — não há Repository, não há Factory Method público pensado para uso fora de `Opportunity`"* — uma tensão já documentada entre a **intenção** (`Proposal` controlada só por `Opportunity`) e a **forma atual** (`Proposal.create()` é um `static` público, chamável de qualquer lugar; `addProposal()` aceita a instância já pronta).

## 2. Options Evaluated

### Option A — Application cria Proposal

Application Layer chama `Proposal.create(input)` diretamente, depois chama `opportunity.addProposal(proposal)` — dois passos, dois métodos independentes. **Já implementado hoje** (`addProposal()`, `ENG-0044`).

### Option B — Opportunity cria Proposal

`Opportunity` ganha um método `submitProposal(input): Result<Proposal, DomainError>` que internamente chama `Proposal.create(input)` e adiciona o resultado à sua própria coleção — uma única operação atômica, retornando `Result`. `addProposal()` permanece separado (não removido — ver § 4), reservado para reconstituição via Repository.

### Option C — Domain Service cria Proposal

Um `ProposalSubmissionDomainService` (ou equivalente) orquestra a criação e associação de `Proposal` a `Opportunity`, seguindo `DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md` (ENS-0003).

## 3. Evaluation Matrix

| Critério | Option A (Application) | Option B (Opportunity) | Option C (Domain Service) |
|---|---|---|---|
| **Aggregate Boundary** | ⚠️ Fraco — permite construir `Proposal` fora de qualquer `Opportunity`, sem garantia de associação imediata | ✅ Forte — `Proposal` só passa a existir já associada à `Opportunity` que a criou | ⚠️ Neutro — não viola a fronteira, mas a atravessa desnecessariamente para uma operação que cabe inteiramente dentro de um único Aggregate |
| **Encapsulation** | ⚠️ Fraco — nada impede Application Layer de criar uma `Proposal` "órfã" (nunca adicionada), ou de adicionar a mesma instância a duas `Opportunity`s distintas (nenhuma verificação de posse única existe hoje) | ✅ Forte — elimina ambos os riscos: `Proposal` nasce já dentro da coleção de exatamente uma `Opportunity` | ⚠️ Neutro — mesma fraqueza de A, só desloca a orquestração para uma terceira classe |
| **DDD Consistency** | ⚠️ Contraria a prática comum de "Factory Method de objeto interno pertence ao Aggregate Root que o possui" (mesmo princípio já expresso, em prosa, no cabeçalho de `proposal.ts`) | ✅ Consistente — mesmo padrão já usado por `Opportunity.create()`/`Pipeline.create()` (Aggregate Root como único ponto de entrada de criação) | ❌ Inconsistente com o critério já estabelecido em `DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md` (ENS-0003): Domain Service só se justifica com múltiplos Aggregates, dependência de Repository, ou consulta que nenhum Aggregate resolve sozinho — nenhuma dessas condições se aplica aqui (`Proposal` é inteiramente interna a um único `Opportunity`, já confirmado por `domain/services/README.md`, `ENG-0037`: "nenhum Domain Service identificado") |
| **Existing Code Alignment** | ✅ Forte — é exatamente o que `addProposal()` já implementa hoje (`ENG-0044`) | ⚠️ Requer adição futura de método — `opportunity.ts` não é alterado por esta missão | ❌ Nenhum precedente — nenhum Domain Service existe em `Sales` hoje |
| **Future Application Layer Design** | ⚠️ Fraco — um único Command `SubmitProposal` (`SALES_TECHNICAL_BLUEPRINT.md § 6`) exigiria orquestrar 2 chamadas não-atômicas na Application Layer, quebrando a garantia de "uma mutação, um `Result`" já seguida por todo outro Command | ✅ Forte — `SubmitProposal` mapeia 1:1 para `opportunity.submitProposal(input)`, mesma forma de todo outro Command já mapeado (§ 1) | ❌ Fraco — introduziria uma segunda forma de invocação (via Domain Service) inconsistente com os outros 5 Commands, todos chamando `Opportunity` diretamente |

## 4. Decision

**Option B — Opportunity cria Proposal.**

`Opportunity` deve ganhar, em uma futura missão de implementação, um método `submitProposal(input: CreateProposalInput): Result<Proposal, DomainError>` que chama `Proposal.create(input)` internamente e, em caso de sucesso, adiciona o resultado à sua própria coleção (mesma lógica de verificação de duplicidade já implementada em `addProposal()`) — uma única operação atômica. `addProposal()` **não é removido**: permanece como o método usado por uma futura implementação de `OpportunityMapper.toDomain()` (`SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 10`) para reconstituir `Proposal`s já persistidas na coleção de uma `Opportunity` reconstituída — um caso de uso genuinamente distinto de "submeter uma nova proposta", que não deve ser confundido com ele.

O Command `SubmitProposal` (`SALES_TECHNICAL_BLUEPRINT.md § 6`), quando implementado, deve chamar `opportunity.submitProposal()`, nunca `Proposal.create()` diretamente seguido de `opportunity.addProposal()`.

## 5. Rejected Alternatives

- **Option A** — rejeitada apesar de ser a única já alinhada ao código existente. "Existing Code Alignment" foi o único critério favorável, e reflete uma forma pragmática de wiring (`ENG-0044`), não uma decisão de design deliberada sobre *quem deveria* criar `Proposal` — a própria missão `ENG-0044` não avaliou esta pergunta, apenas implementou o wiring mínimo pedido. Manter Option A permanentemente institucionalizaria um risco real de encapsulamento (§ 3) sem necessidade.
- **Option C** — rejeitada por não satisfazer nenhum dos 3 critérios já estabelecidos em `DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md` (ENS-0003) para justificar um Domain Service. Introduzir um agora seria inventar complexidade sem evidência arquitetural — o oposto do que esta missão pede.

## 6. Future Impact

- Uma futura missão de implementação (fora do escopo desta, que não altera código) deve adicionar `submitProposal()` a `opportunity.ts`, seguindo exatamente a mesma disciplina já usada por `approveProposal()` (`ENG-0044`): construir/localizar, delegar, aplicar mudança, sem inventar validação além do já confirmado por `Proposal.create()` (nome não-vazio... na verdade `Proposal.create()` não valida nada hoje, `CreateProposalInput` é `Record<string, never>` — ver `proposal.ts`, `ENG-0040`).
- Nenhum novo Domain Event é necessário — `submitProposal()` não corresponde a nenhum evento já aprovado (só `ProposalApproved` existe, disparado na aprovação, não na submissão) — mesma conclusão já registrada para `addProposal()` em `ENG-0044`.
- A futura Application Layer (`application/commands/`, `ENG-0037`) deve implementar `SubmitProposal` chamando `opportunity.submitProposal()`, não orquestrando os dois passos separadamente.
- `SALES_TECHNICAL_BLUEPRINT.md § 5` (Repository Interfaces) não é afetado — `submitProposal()` não introduz nenhuma necessidade de Repository nova.

## 7. Remaining Pending Items

Não resolvidos por esta missão, permanecem registrados:

- `CreateProposalInput` continua vazio (`Record<string, never>`) — nenhum campo de conteúdo/valor para `Proposal` está congelado (`proposal.ts`, `ENG-0040`); `submitProposal()`, quando implementado, herdará essa mesma limitação até uma Object Specification real existir.
- Os demais 11 itens de `SALES_IMPLEMENTATION_READINESS.md § 7` permanecem pendentes, não afetados por esta decisão.
- Esta decisão não exige ADR — mesma análise já aplicada em `SALES_IMPLEMENTATION_READINESS.md § 8`, item 11: decisão de design tático de Application/Aggregate, não uma decisão de arquitetura cross-domain.

---

## Validações

- **Link Checker**: executado com `-Root` explícito, ver ENG-0048 FINAL REPORT.
- **Domain Model Validation**: nenhuma Entity/Aggregate/Value Object/Domain Event criado ou alterado; `opportunity.ts`/`proposal.ts`/`DOMAIN_MODEL.md`/ADRs/Blueprints não tocados.

## Relação com Outros Módulos

- [SALES_IMPLEMENTATION_READINESS.md § 6, § 7 item 11](SALES_IMPLEMENTATION_READINESS.md) (ENG-0047) — origem direta da lacuna resolvida por esta missão
- [SALES_AGGREGATE_DESIGN.md](SALES_AGGREGATE_DESIGN.md) (ENG-0034) — candidato original de `Proposal` como Internal Entity
- [../blueprints/SALES_TECHNICAL_BLUEPRINT.md § 6](../blueprints/SALES_TECHNICAL_BLUEPRINT.md) — origem do Command candidato `SubmitProposal`
- [../blueprints/SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 10](../blueprints/SALES_PERSISTENCE_MAPPING_BLUEPRINT.md) — papel de `addProposal()` na reconstituição via Mapper
- [adr/ADR-0020-sales-quotation-position.md](../../../adr/ADR-0020-sales-quotation-position.md) — precedente metodológico (resolução de vocabulário/design sem ADR quando não cross-domain)
- [services/domains/sales/domain/aggregates/opportunity/opportunity.ts](../../../services/domains/sales/domain/aggregates/opportunity/opportunity.ts) (ENG-0039, ENG-0044) — código real não alterado, alvo da futura implementação de `submitProposal()`
- [services/domains/sales/domain/entities/proposal/proposal.ts](../../../services/domains/sales/domain/entities/proposal/proposal.ts) (ENG-0040) — código real não alterado, fonte da tensão original (§ 1)
- [knowledge/engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md](../../engineering/standards/DOMAIN_SERVICE_IMPLEMENTATION_STANDARD.md) (ENS-0003) — critério usado para rejeitar Option C

## Status

🟢 Decisão de design tático concluída (Missão ENG-0048). Nenhum código, Entity, Aggregate, Command, Handler, Service, Infrastructure, Repository, API ou teste criado/alterado. `opportunity.ts`/`proposal.ts`/`DOMAIN_MODEL.md`/ADRs/Blueprints existentes intocados. Vinculante para a próxima missão de implementação que adicionar `submitProposal()` a `opportunity.ts`.
