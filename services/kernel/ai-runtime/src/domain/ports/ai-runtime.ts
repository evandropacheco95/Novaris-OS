/**
 * Port de AI Runtime (`ENGINEERING_PLAYBOOK.md § 9`, `ADR-0041`) — inspirado
 * no Salesforce Einstein Copilot: operação única representativa,
 * "responder a um prompt com contexto controlado", não uma feature
 * específica (score preditivo, insight de oportunidade etc.), que exigiria
 * dado de negócio e modelo próprio ainda não definidos.
 *
 * `context` existe para futuramente carregar o que "todo acesso de agentes a
 * dados passa por aqui" (`ai-runtime/README.md` original) exige — quais
 * campos/Aggregates um agente pode enxergar — mas nenhuma regra de
 * autorização é imposta nesta versão (estrutural, `ADR-0041`).
 */
export interface AIContext {
  readonly [key: string]: unknown;
}

export interface AIResponse {
  readonly answer: string;
  readonly loggedOnly: boolean;
}

export interface AIRuntime {
  ask(prompt: string, context?: AIContext): Promise<AIResponse>;
}
