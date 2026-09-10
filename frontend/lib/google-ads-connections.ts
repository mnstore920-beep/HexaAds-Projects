import "server-only";

import {
  ObjectId,
  type Collection,
  type WithId,
} from "mongodb";

import { getDatabase } from "@/lib/mongodb";
import {
  decryptGoogleAdsToken,
  encryptGoogleAdsToken,
  type EncryptedGoogleAdsToken,
} from "@/lib/google-ads-crypto";

const GOOGLE_ADS_PROVIDER = "google_ads" as const;
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export interface GoogleAdsConnectionDocument {
  _id?: ObjectId;
  userId: ObjectId;
  provider: typeof GOOGLE_ADS_PROVIDER;
  googleSubject: string | null;
  googleEmail: string | null;
  accessTokenCiphertext: string;
  accessTokenIv: string;
  accessTokenAuthTag: string;
  refreshTokenCiphertext: string;
  refreshTokenIv: string;
  refreshTokenAuthTag: string;
  grantedScopes: string[];
  accessTokenExpiresAt: Date;
  connectedAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
}

export type SafeGoogleAdsConnection = Omit<
  GoogleAdsConnectionDocument,
  | "accessTokenCiphertext"
  | "accessTokenIv"
  | "accessTokenAuthTag"
  | "refreshTokenCiphertext"
  | "refreshTokenIv"
  | "refreshTokenAuthTag"
>;

export interface GoogleAdsConnectionInput {
  accessToken: string;
  refreshToken?: string;
  googleSubject?: string | null;
  googleEmail?: string | null;
  grantedScopes: string[];
  accessTokenExpiresAt: Date;
}

export interface GoogleAdsConnectionTokens {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleAdsOAuthStateDocument {
  _id?: ObjectId;
  stateHash: string;
  userId: ObjectId;
  pkceVerifier: string;
  returnTo: string;
  createdAt: Date;
  expiresAt: Date;
  consumedAt: Date | null;
}

export interface CreateGoogleAdsOAuthStateInput {
  userId: ObjectId;
  stateHash: string;
  pkceVerifier: string;
  returnTo: string;
}

export type ConsumedGoogleAdsOAuthState = Omit<
  GoogleAdsOAuthStateDocument,
  "_id" | "stateHash"
>;

let indexesPromise: Promise<void> | undefined;

async function getCollections(): Promise<{
  connections: Collection<GoogleAdsConnectionDocument>;
  states: Collection<GoogleAdsOAuthStateDocument>;
}> {
  const database = await getDatabase(process.env.MONGODB_DB || "hexaads");

  return {
    connections: database.collection<GoogleAdsConnectionDocument>(
      "google_ads_connections"
    ),
    states: database.collection<GoogleAdsOAuthStateDocument>(
      "google_ads_oauth_states"
    ),
  };
}

export async function ensureGoogleAdsIndexes(): Promise<void> {
  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        const { connections, states } = await getCollections();

        await Promise.all([
          connections.createIndex(
            { userId: 1, provider: 1 },
            { unique: true, name: "google_ads_user_provider_unique" }
          ),
          states.createIndex(
            { stateHash: 1 },
            { unique: true, name: "google_ads_state_hash_unique" }
          ),
          states.createIndex(
            { expiresAt: 1 },
            { expireAfterSeconds: 0, name: "google_ads_state_expiry" }
          ),
        ]);
      } catch {
        indexesPromise = undefined;
        throw new Error("Unable to initialize Google Ads database indexes.");
      }
    })();
  }

  return indexesPromise;
}

function toSafeConnection(
  connection: WithId<GoogleAdsConnectionDocument>
): SafeGoogleAdsConnection {
  return {
    _id: connection._id,
    userId: connection.userId,
    provider: connection.provider,
    googleSubject: connection.googleSubject,
    googleEmail: connection.googleEmail,
    grantedScopes: connection.grantedScopes,
    accessTokenExpiresAt: connection.accessTokenExpiresAt,
    connectedAt: connection.connectedAt,
    updatedAt: connection.updatedAt,
    lastUsedAt: connection.lastUsedAt,
  };
}

export async function getGoogleAdsConnection(
  userId: ObjectId
): Promise<SafeGoogleAdsConnection | null> {
  await ensureGoogleAdsIndexes();
  const { connections } = await getCollections();
  const connection = await connections.findOne({
    userId,
    provider: GOOGLE_ADS_PROVIDER,
  });

  return connection ? toSafeConnection(connection) : null;
}

export async function getGoogleAdsConnectionWithTokens(
  userId: ObjectId
): Promise<{
  connection: SafeGoogleAdsConnection;
  tokens: GoogleAdsConnectionTokens;
} | null> {
  await ensureGoogleAdsIndexes();
  const { connections } = await getCollections();
  const connection = await connections.findOne({
    userId,
    provider: GOOGLE_ADS_PROVIDER,
  });

  if (!connection) {
    return null;
  }

  const accessToken = decryptGoogleAdsToken({
    ciphertext: connection.accessTokenCiphertext,
    iv: connection.accessTokenIv,
    authTag: connection.accessTokenAuthTag,
  });
  const refreshToken = decryptGoogleAdsToken({
    ciphertext: connection.refreshTokenCiphertext,
    iv: connection.refreshTokenIv,
    authTag: connection.refreshTokenAuthTag,
  });

  return {
    connection: toSafeConnection(connection),
    tokens: { accessToken, refreshToken },
  };
}

export async function upsertGoogleAdsConnection(
  userId: ObjectId,
  input: GoogleAdsConnectionInput
): Promise<SafeGoogleAdsConnection> {
  await ensureGoogleAdsIndexes();
  const { connections } = await getCollections();
  const existing = await connections.findOne({
    userId,
    provider: GOOGLE_ADS_PROVIDER,
  });
  const encryptedAccessToken = encryptGoogleAdsToken(input.accessToken);
  let encryptedRefreshToken: EncryptedGoogleAdsToken;

  if (input.refreshToken) {
    encryptedRefreshToken = encryptGoogleAdsToken(input.refreshToken);
  } else if (existing) {
    encryptedRefreshToken = {
      ciphertext: existing.refreshTokenCiphertext,
      iv: existing.refreshTokenIv,
      authTag: existing.refreshTokenAuthTag,
    };
  } else {
    throw new Error(
      "A refresh token is required when creating a Google Ads connection."
    );
  }

  const now = new Date();
  const document: GoogleAdsConnectionDocument = {
    userId,
    provider: GOOGLE_ADS_PROVIDER,
    googleSubject: input.googleSubject ?? existing?.googleSubject ?? null,
    googleEmail: input.googleEmail ?? existing?.googleEmail ?? null,
    accessTokenCiphertext: encryptedAccessToken.ciphertext,
    accessTokenIv: encryptedAccessToken.iv,
    accessTokenAuthTag: encryptedAccessToken.authTag,
    refreshTokenCiphertext: encryptedRefreshToken.ciphertext,
    refreshTokenIv: encryptedRefreshToken.iv,
    refreshTokenAuthTag: encryptedRefreshToken.authTag,
    grantedScopes: input.grantedScopes,
    accessTokenExpiresAt: input.accessTokenExpiresAt,
    connectedAt: existing?.connectedAt ?? now,
    updatedAt: now,
    lastUsedAt: existing?.lastUsedAt ?? null,
  };

  const saved = await connections.findOneAndUpdate(
    { userId, provider: GOOGLE_ADS_PROVIDER },
    { $set: document },
    { upsert: true, returnDocument: "after" }
  );

  if (!saved) {
    throw new Error("Unable to save the Google Ads connection.");
  }

  return toSafeConnection(saved);
}

export async function deleteGoogleAdsConnection(
  userId: ObjectId
): Promise<boolean> {
  await ensureGoogleAdsIndexes();
  const { connections } = await getCollections();
  const result = await connections.deleteOne({
    userId,
    provider: GOOGLE_ADS_PROVIDER,
  });

  return result.deletedCount === 1;
}

export async function markGoogleAdsConnectionUsed(
  userId: ObjectId
): Promise<void> {
  await ensureGoogleAdsIndexes();
  const { connections } = await getCollections();
  await connections.updateOne(
    { userId, provider: GOOGLE_ADS_PROVIDER },
    { $set: { lastUsedAt: new Date(), updatedAt: new Date() } }
  );
}

export async function createGoogleAdsOAuthState(
  input: CreateGoogleAdsOAuthStateInput
): Promise<void> {
  await ensureGoogleAdsIndexes();
  const { states } = await getCollections();
  const createdAt = new Date();

  await states.insertOne({
    stateHash: input.stateHash,
    userId: input.userId,
    pkceVerifier: input.pkceVerifier,
    returnTo: input.returnTo,
    createdAt,
    expiresAt: new Date(createdAt.getTime() + OAUTH_STATE_TTL_MS),
    consumedAt: null,
  });
}

export async function consumeGoogleAdsOAuthState(input: {
  stateHash: string;
  userId: ObjectId;
}): Promise<ConsumedGoogleAdsOAuthState | null> {
  await ensureGoogleAdsIndexes();
  const { states } = await getCollections();
  const consumedAt = new Date();
  const consumed = await states.findOneAndUpdate(
    {
      stateHash: input.stateHash,
      userId: input.userId,
      consumedAt: null,
      expiresAt: { $gt: consumedAt },
    },
    { $set: { consumedAt } },
    { returnDocument: "after" }
  );

  if (!consumed) {
    return null;
  }

  return {
    userId: consumed.userId,
    pkceVerifier: consumed.pkceVerifier,
    returnTo: consumed.returnTo,
    createdAt: consumed.createdAt,
    expiresAt: consumed.expiresAt,
    consumedAt: consumed.consumedAt,
  };
}