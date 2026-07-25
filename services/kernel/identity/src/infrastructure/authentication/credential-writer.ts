import bcrypt from "bcryptjs";
import type { PrismaClient } from "@novaris/database";

const SALT_ROUNDS = 12;

/**
 * `setCredential` — grava (ou substitui) o hash de senha de um email na
 * tabela `credentials` (Infrastructure, `ADR-0010`). Não é parte do Port
 * `PasswordVerifier` (que só define `verify`) nem do Domain Layer — é o lado
 * de escrita da mesma decisão, necessário para seed/registro de usuário, sem
 * o qual nenhuma credencial jamais existiria para verificar.
 *
 * Nunca recebe nem loga a senha em texto claro fora desta chamada — o hash é
 * calculado aqui e a string original nunca é persistida nem retornada.
 */
export async function setCredential(client: PrismaClient, email: string, plainPassword: string): Promise<void> {
  const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
  await client.credential.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });
}
