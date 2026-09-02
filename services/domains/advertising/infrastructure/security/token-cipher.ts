import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * Cifra/decifra o refresh token OAuth armazenado em
 * `AdvertisingAccount.encryptedRefreshToken` — `AES-256-GCM`, único
 * mecanismo de segredo reversível do repositório (`ADR-0060`; todo o resto,
 * ex.: `credential-writer.ts`, usa hash de mão única, não reversível).
 *
 * `ADVERTISING_TOKEN_ENCRYPTION_KEY` (`.env`) é a senha-mestra; uma derivação
 * por `scrypt` gera a chave de 256 bits real, para não exigir que o valor em
 * `.env` já venha em bytes crus. Formato persistido: `iv:authTag:ciphertext`,
 * tudo em hex, uma única string — cabe direto na coluna `encryptedRefreshToken`.
 */
const ALGORITHM = "aes-256-gcm";
const SALT = "novaris-advertising-token-cipher";

function deriveKey(): Buffer {
  const secret = process.env.ADVERTISING_TOKEN_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('"ADVERTISING_TOKEN_ENCRYPTION_KEY" não configurada — obrigatória para cifrar/decifrar refresh tokens.');
  }
  return scryptSync(secret, SALT, 32);
}

export function encryptRefreshToken(plainRefreshToken: string): string {
  const key = deriveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plainRefreshToken, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${ciphertext.toString("hex")}`;
}

export function decryptRefreshToken(encrypted: string): string {
  const [ivHex, authTagHex, ciphertextHex] = encrypted.split(":");
  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error('"encryptedRefreshToken" em formato inválido — esperado "iv:authTag:ciphertext" em hex.');
  }
  const key = deriveKey();
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertextHex, "hex")), decipher.final()]);
  return plaintext.toString("utf8");
}
