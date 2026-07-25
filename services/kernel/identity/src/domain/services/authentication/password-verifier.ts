import type { Result, InfrastructureError } from "@novaris/shared-kernel";
import type { Email } from "../../value-objects/email.js";

/**
 * Port de verificação de credencial (ADR-0010 — Authentication Credential
 * Strategy). A Domain Layer nunca decide algoritmo de hash, biblioteca ou
 * formato de armazenamento — só pergunta "esta senha, para este email,
 * confere?". Implementação concreta (Infrastructure Adapter) fica fora do
 * escopo desta missão. `verify` nunca lança exceção — falha de infraestrutura
 * (ex.: serviço de hashing indisponível) chega como `Result.fail`, nunca como
 * exceção não tratada (ENS-0003 § 9).
 */
export interface PasswordVerifier {
  verify(email: Email, plainPassword: string): Promise<Result<boolean, InfrastructureError>>;
}
