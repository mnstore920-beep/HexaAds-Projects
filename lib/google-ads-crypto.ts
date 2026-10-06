import "server-only";

import {
  createDecipheriv,
  createCipheriv,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

export interface EncryptedGoogleAdsToken {
  ciphertext: string;
  iv: string;
  authTag: string;
}

function decodeKey(value: string): Buffer {
  const rawKey = Buffer.from(value, "utf8");

  if (rawKey.length === KEY_LENGTH) {
    return rawKey;
  }

  const base64Key = Buffer.from(value, "base64url");

  if (base64Key.length === KEY_LENGTH) {
    return base64Key;
  }

  throw new Error(
    "GOOGLE_ADS_TOKEN_ENCRYPTION_KEY must represent exactly 32 bytes."
  );
}

function getEncryptionKey(): Buffer {
  const configuredKey = process.env.GOOGLE_ADS_TOKEN_ENCRYPTION_KEY;

  if (!configuredKey) {
    throw new Error(
      "GOOGLE_ADS_TOKEN_ENCRYPTION_KEY is required for Google Ads token encryption."
    );
  }

  return decodeKey(configuredKey);
}

export function encryptGoogleAdsToken(
  plaintext: string
): EncryptedGoogleAdsToken {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return {
    ciphertext: ciphertext.toString("base64url"),
    iv: iv.toString("base64url"),
    authTag: cipher.getAuthTag().toString("base64url"),
  };
}

export function decryptGoogleAdsToken(input: EncryptedGoogleAdsToken): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(input.iv, "base64url")
  );

  decipher.setAuthTag(Buffer.from(input.authTag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(input.ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}