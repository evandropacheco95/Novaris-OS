import bcrypt from "bcryptjs";
import { Result, InfrastructureError } from "@novaris/shared-kernel";
import type { PrismaClient } from "@novaris/database";
import type { Email } from "../../domain/value-objects/email.js";
import type { PasswordVerifier } from "../../domain/services/authentication/password-verifier.js";

/**
 * Implementação real do Port `PasswordVerifier` (`ADR-0010` — Authentication
 * Credential Strategy) — Infrastructure Adapter, algoritmo bcrypt (decisão de
 * Infrastructure, fora do escopo do ADR em si). Correlaciona `User.email` com
 * a linha da tabela `credentials` (conceito exclusivo de Infrastructure, sem
 * equivalente no Domain Layer) — o domínio nunca vê essa relação.
 *
 * Email inexistente na tabela `credentials` devolve `Result.ok(false)` (senha
 * incorreta), nunca `Result.fail` — só uma falha real de infraestrutura
 * (conexão indisponível) devolve `Result.fail`, mesmo contrato já declarado em
 * `PasswordVerifier` ("nunca lança exceção").
 */
export class BcryptPasswordVerifier implements PasswordVerifier {
  constructor(private readonly client: PrismaClient) {}

  async verify(email: Email, plainPassword: string): Promise<Result<boolean, InfrastructureError>> {
    try {
      const credential = await this.client.credential.findUnique({ where: { email: email.value } });
      if (!credential) {
        return Result.ok(false);
      }
      const matches = await bcrypt.compare(plainPassword, credential.passwordHash);
      return Result.ok(matches);
    } catch (error) {
      return Result.fail(new InfrastructureError(`Falha ao verificar credencial de "${email.value}"`, { cause: error }));
    }
  }
}
