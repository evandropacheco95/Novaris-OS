import { AggregateRoot, Result, ConflictError, NotFoundError } from "@novaris/shared-kernel";
import type { UniqueEntityId, DomainError, Timestamped } from "@novaris/shared-kernel";
import { OpportunityCreated } from "../../events/opportunity-created.js";
import { OpportunityWon } from "../../events/opportunity-won.js";
import { OpportunityLost } from "../../events/opportunity-lost.js";
import { ProposalApproved } from "../../events/proposal-approved.js";
import { Proposal, type CreateProposalInput } from "../../entities/proposal/proposal.js";

/**
 * Opportunity — Aggregate Root do Sales Domain.
 *
 * Traceability (Ordem de Missão ENG-0039):
 * - [SALES_TECHNICAL_BLUEPRINT.md](../../../../../../knowledge/architecture/blueprints/SALES_TECHNICAL_BLUEPRINT.md) §§ 2-3 — Aggregate Root confirmado, fronteira transacional
 * - [SALES_AGGREGATE_DESIGN.md](../../../../../../knowledge/architecture/analysis/SALES_AGGREGATE_DESIGN.md) §§ 1-6 — candidato mais forte do domínio, invariantes candidatas
 * - [ADR-0020](../../../../../../adr/ADR-0020-sales-quotation-position.md) — `Quotation` distinto de `Proposal`, não implementado aqui
 * - [ADR-0021](../../../../../../adr/ADR-0021-pipeline-nature.md) — `Pipeline`/`Stage` são Aggregate/Entity externos, referenciados só por id
 * - [AGGREGATE_IMPLEMENTATION_STANDARD.md](../../../../../../knowledge/engineering/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) (ENS-0001) — forma estrutural seguida
 * - [Business Domain Aggregate extension](../../../../../../knowledge/architecture/standards/AGGREGATE_IMPLEMENTATION_STANDARD.md) — regras de referência cross-domínio
 *
 * **Desvio registrado, não silencioso**: a Ordem de Missão ENG-0039 pede que
 * "transições inválidas lancem exceções de domínio" ("Invalid transitions must
 * throw domain exceptions"). Isso contradiz `AGGREGATE_IMPLEMENTATION_STANDARD.md`
 * §§ 3-4 (ENS-0001, congelado, exige `Result<T, DomainError>`, nunca exceção) —
 * regra já aplicada sem exceção em `Organization`/`User`/`Role`/`AuditEntry`.
 * Mudar ENS-0001 exige ADR (`ENS-0001 § Vigência`), que esta missão não é.
 * Por disciplina de "Single Source of Truth" e "Verify Before Reimplementing",
 * este Aggregate segue `Result<T, DomainError>` — nunca lança exceção — e este
 * desvio da Ordem de Missão está registrado aqui e no relatório final da missão.
 *
 * **Estado deliberadamente mínimo** — nenhum campo foi inventado além do que
 * `SALES_AGGREGATE_DESIGN.md`/`BOM.md § Opportunity` já confirmam ou exigem
 * estruturalmente (ver `organizationId`, ENS-0001 § 7). Relacionamentos
 * candidatos não incluídos como campo, por não terem forma congelada:
 * - `User` (dono da oportunidade) — `SALES_AGGREGATE_DESIGN.md § 8`: "candidato,
 *   nenhuma fonte nomeia o campo explicitamente". TODO: adicionar quando confirmado.
 * - `Task`/`Activity` (relacionamentos de `BOM.md § Opportunity`) — forma de
 *   referência (um id? uma lista?) não definida. TODO: ver `SALES_AGGREGATE_DESIGN.md § 8`.
 * - `Quotation`/`Contract`/`Revenue` — `Needs Evidence` (`ADR-0020`,
 *   `SALES_AGGREGATE_DESIGN.md § 3`) — nenhuma forma estrutural definida. TODO.
 * - `Proposal` — **wiring implementado em ENG-0044**: `Opportunity` possui uma
 *   coleção interna `proposals: Proposal[]` (campo de classe, fora de
 *   `OpportunityProps` — mesmo padrão de `Pipeline`↔`Stage`, `ENG-0043`).
 *   `Proposal` continua Internal Entity, nunca publica evento diretamente —
 *   `approveProposal()` é quem dispara `ProposalApproved` através do
 *   Aggregate Root. **`submitProposal()` implementado em ENG-0049**,
 *   seguindo a decisão registrada em
 *   [SALES_SUBMIT_PROPOSAL_DESIGN.md](../../../../../../knowledge/architecture/analysis/SALES_SUBMIT_PROPOSAL_DESIGN.md)
 *   (Option B — `Opportunity` cria `Proposal`, não a Application Layer nem um
 *   Domain Service): cria e adiciona uma `Proposal` numa única operação
 *   atômica. `addProposal()` **não foi removido** — permanece reservado para
 *   reconstituição via `OpportunityMapper.toDomain()` (`SALES_PERSISTENCE_MAPPING_BLUEPRINT.md § 10`).
 */

/**
 * Três estados mínimos necessários para suportar os 3 Domain Events já
 * aprovados (`OpportunityCreated`/`OpportunityWon`/`OpportunityLost`) — nenhuma
 * fonte define uma tabela de transição completa (`SALES_AGGREGATE_DESIGN.md § 7`,
 * "Allowed State Transitions — Não coberto"). Este enum é a forma mínima
 * estrutural necessária, não uma tabela de transição inventada.
 */
export type OpportunityStatus = "open" | "won" | "lost";

export interface OpportunityProps {
  organizationId: UniqueEntityId;
  partyId: UniqueEntityId;
  pipelineId?: UniqueEntityId;
  currentStageId?: UniqueEntityId;
  status: OpportunityStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOpportunityInput {
  organizationId: UniqueEntityId;
  partyId: UniqueEntityId;
  pipelineId?: UniqueEntityId;
  currentStageId?: UniqueEntityId;
}

export class Opportunity extends AggregateRoot<OpportunityProps> implements Timestamped {
  private readonly proposals: Proposal[];

  private constructor(props: OpportunityProps, proposals: Proposal[], id?: UniqueEntityId) {
    super(props, id);
    this.proposals = proposals;
  }

  /**
   * Único ponto de criação. `organizationId`/`partyId` são obrigatórios —
   * "negociação em andamento **com um Party**" (`UBIQUITOUS_LANGUAGE.md § Domínio: Sales`)
   * e `organizationId` por regra transversal (ENS-0001 § 7). `pipelineId`/
   * `currentStageId` são opcionais — nenhuma fonte confirma se são obrigatórios
   * na criação (`SALES_AGGREGATE_DESIGN.md § 8`, `Needs Evidence`).
   */
  static create(input: CreateOpportunityInput): Result<Opportunity, DomainError> {
    const now = new Date();
    const props: OpportunityProps = {
      organizationId: input.organizationId,
      partyId: input.partyId,
      pipelineId: input.pipelineId,
      currentStageId: input.currentStageId,
      status: "open",
      createdAt: now,
      updatedAt: now,
    };
    const opportunity = new Opportunity(props, []);
    opportunity.addDomainEvent(new OpportunityCreated(opportunity.id));
    return Result.ok(opportunity);
  }

  /**
   * Usado exclusivamente por uma futura implementação de `OpportunityRepository`
   * (ENS-0001 § 8). `proposals` default `[]` preserva a assinatura anterior a
   * `ENG-0044` para qualquer chamador que ainda não persista `Proposal`s.
   */
  static reconstitute(props: OpportunityProps, id: UniqueEntityId, proposals: Proposal[] = []): Opportunity {
    return new Opportunity(props, proposals, id);
  }

  /**
   * Transição terminal `open → won`. Invariante candidata, não confirmada por
   * regra de negócio explícita (`SALES_AGGREGATE_DESIGN.md § 6`: "inferido,
   * não confirmado" — estados terminais não retornam a aberto). Implementada
   * porque é a única forma de tornar o Aggregate coerente com os eventos já
   * aprovados; registrada como candidata, não como fato de negócio definitivo.
   *
   * Geração de `Contract`/reconhecimento de `Revenue` **não é implementada
   * aqui** — mecanismo não descrito por nenhuma fonte (`SALES_AGGREGATE_DESIGN.md § 11`).
   */
  markWon(): Result<void, DomainError> {
    if (this.props.status !== "open") {
      return Result.fail(
        new ConflictError(`Opportunity não pode ser marcada como "won" a partir do estado "${this.props.status}"`),
      );
    }
    this.props.status = "won";
    this.props.updatedAt = new Date();
    this.addDomainEvent(new OpportunityWon(this.id));
    return Result.ok(undefined);
  }

  /** Transição terminal `open → lost` — mesma justificativa e mesma ressalva de `markWon()`. */
  markLost(): Result<void, DomainError> {
    if (this.props.status !== "open") {
      return Result.fail(
        new ConflictError(`Opportunity não pode ser marcada como "lost" a partir do estado "${this.props.status}"`),
      );
    }
    this.props.status = "lost";
    this.props.updatedAt = new Date();
    this.addDomainEvent(new OpportunityLost(this.id));
    return Result.ok(undefined);
  }

  /**
   * Atualiza a referência à etapa corrente (`Stage`, Entity de `Pipeline`,
   * `ADR-0021`) — nunca embute um objeto `Stage`, só a referência por id.
   * Não dispara Domain Event — `AdvanceOpportunityStage` não tem confirmação
   * de evento associado em nenhuma fonte (`SALES_TECHNICAL_BLUEPRINT.md § 7`
   * lista só `OpportunityCreated`/`OpportunityWon`/`OpportunityLost`/`ProposalApproved`).
   * Não valida sequência de `Stage`s dentro do `Pipeline` — essa tabela não
   * está definida (`SALES_AGGREGATE_DESIGN.md § 7`) e `Pipeline`/`Stage` não
   * são implementados por esta missão; só a invariante de que uma `Opportunity`
   * fechada não muda mais de etapa é aplicada.
   */
  advanceStage(stageId: UniqueEntityId): Result<void, DomainError> {
    if (this.props.status !== "open") {
      return Result.fail(new ConflictError(`Opportunity fechada ("${this.props.status}") não pode avançar de etapa`));
    }
    this.props.currentStageId = stageId;
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  /**
   * Adiciona uma `Proposal` já construída (por `Proposal.create()`, fora
   * desta classe) à coleção interna. Única invariante aplicada: nenhuma
   * `Proposal` com o mesmo id pode ser adicionada duas vezes — integridade
   * estrutural básica de coleção, mesmo padrão de `Pipeline.addStage()`
   * (`ENG-0043`), não uma regra de negócio de `Sales`. Não dispara Domain
   * Event — a criação de uma `Proposal` não corresponde a nenhum evento já
   * aprovado (só `ProposalApproved` existe, disparado na aprovação).
   */
  addProposal(proposal: Proposal): Result<void, DomainError> {
    const alreadyExists = this.proposals.some((existing) => existing.id.equals(proposal.id));
    if (alreadyExists) {
      return Result.fail(new ConflictError(`Proposal "${proposal.id.toString()}" já pertence a esta Opportunity`));
    }
    this.proposals.push(proposal);
    this.props.updatedAt = new Date();
    return Result.ok(undefined);
  }

  /**
   * Cria uma nova `Proposal` e a adiciona à coleção desta `Opportunity` numa
   * única operação atômica — Option B de
   * [SALES_SUBMIT_PROPOSAL_DESIGN.md](../../../../../../knowledge/architecture/analysis/SALES_SUBMIT_PROPOSAL_DESIGN.md)
   * (ENG-0048), escolhida sobre Application Layer/Domain Service por
   * Aggregate Boundary, Encapsulation, DDD Consistency e Future Application
   * Layer Design. Representa a criação de negócio de uma `Proposal` —
   * distinta de `addProposal()`, que continua existindo exclusivamente para
   * reconstituição/hidratação vinda da persistência.
   *
   * Reutiliza `Proposal.create()` (nenhum campo de conteúdo/valor está
   * congelado — `CreateProposalInput` é `Record<string, never>`, `proposal.ts`)
   * e a própria `addProposal()` (mesma verificação de duplicidade, nenhuma
   * lógica repetida). Não dispara nenhum Domain Event — a criação de uma
   * `Proposal` não corresponde a nenhum evento já aprovado (mesma
   * justificativa já registrada em `addProposal()`). Não valida `User`,
   * `Customer`, `Revenue`, `Quotation`, `Contract`, conteúdo, ou qualquer
   * fluxo de aprovação além do já existente (`approveProposal()`) — todos
   * permanecem bloqueados por decisão arquitetural (`SALES_AGGREGATE_DESIGN.md § 13`).
   */
  submitProposal(input: CreateProposalInput = {}): Result<Proposal, DomainError> {
    const proposalResult = Proposal.create(input);
    if (proposalResult.isFailure) {
      return Result.fail(proposalResult.getError()!);
    }
    const proposal = proposalResult.getValue()!;
    const addResult = this.addProposal(proposal);
    if (addResult.isFailure) {
      return Result.fail(addResult.getError()!);
    }
    return Result.ok(proposal);
  }

  /** Busca uma `Proposal` pela sua identidade — leitura pura, sem mutação. */
  findProposal(proposalId: UniqueEntityId): Proposal | undefined {
    return this.proposals.find((proposal) => proposal.id.equals(proposalId));
  }

  /**
   * Retorna uma cópia defensiva da coleção — o chamador nunca recebe
   * referência ao array interno, impedindo mutação externa que contornaria
   * `addProposal()`/`approveProposal()`.
   */
  getProposals(): ReadonlyArray<Proposal> {
    return [...this.proposals];
  }

  /**
   * Localiza a `Proposal` por id, delega a transição de estado a
   * `proposal.approve()` (que só muta o estado interno da Entity, nunca
   * publica evento — `Entity<T>` não tem `addDomainEvent`), e dispara
   * `ProposalApproved` **através do Aggregate Root** — "Somente Opportunity
   * publica Domain Events" (Ordem de Missão ENG-0044). Se a `Proposal` não
   * pertencer a esta `Opportunity`, falha com `NotFoundError`. Se
   * `proposal.approve()` falhar (ex.: já aprovada), o erro é propagado sem
   * disparar o evento. Não valida o `status` da própria `Opportunity` — essa
   * regra não é confirmada por nenhuma fonte, não inventada aqui.
   */
  approveProposal(proposalId: UniqueEntityId): Result<void, DomainError> {
    const proposal = this.findProposal(proposalId);
    if (!proposal) {
      return Result.fail(new NotFoundError(`Proposal "${proposalId.toString()}" não pertence a esta Opportunity`));
    }
    const approveResult = proposal.approve();
    if (approveResult.isFailure) {
      return Result.fail(approveResult.getError()!);
    }
    this.props.updatedAt = new Date();
    this.addDomainEvent(new ProposalApproved(this.id));
    return Result.ok(undefined);
  }

  /**
   * Nenhum outro método de mutação de `Proposal` é implementado —
   * `rejectProposal`, `cancelProposal`, `removeProposal`, `editProposal` não
   * existem em nenhuma ADR — implementá-los inventaria regra de negócio,
   * restrição explícita desta missão (ENG-0044).
   */

  get organizationId(): UniqueEntityId {
    return this.props.organizationId;
  }

  get partyId(): UniqueEntityId {
    return this.props.partyId;
  }

  get pipelineId(): UniqueEntityId | undefined {
    return this.props.pipelineId;
  }

  get currentStageId(): UniqueEntityId | undefined {
    return this.props.currentStageId;
  }

  get status(): OpportunityStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
