/**
 * Port de Text-to-SQL (`ADR-0054`, `ENG-0170`) — quinta lição extraída da
 * análise do projeto de cliente Winnet (`ENG-0166`): a Winnet tem em
 * produção um assistente ("ia-core") que traduz pergunta em linguagem
 * natural → SQL `SELECT` validado → execução sob RLS do usuário → resposta
 * em texto, com o SQL usado devolvido para auditoria.
 *
 * Mesmo critério já usado para `AIRuntime` (`ADR-0041`): nenhuma credencial
 * de IA real existe hoje — Port + adapter estrutural, adapter real (que de
 * fato chama um LLM) fica para quando a credencial existir, sem mudar o
 * Port nem quem o consome.
 */
export interface TextToSqlContext {
  readonly organizationId: string;
}

export interface TextToSqlResult {
  readonly answer: string;
  /** `null` quando nenhum SQL foi gerado (ex.: pergunta não precisa de dado, ou adapter estrutural). */
  readonly sql: string | null;
  readonly loggedOnly: boolean;
}

export interface TextToSqlPort {
  ask(question: string, context: TextToSqlContext): Promise<TextToSqlResult>;
}
