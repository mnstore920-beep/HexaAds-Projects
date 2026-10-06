import "server-only";

import { createHash, randomBytes } from "node:crypto";

export const GOOGLE_ADS_SCOPE =
  "https://www.googleapis.com/auth/adwords";

const GOOGLE_AUTHORIZATION_ENDPOINT =
  "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

export interface GoogleAdsOAuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  grantedScopes: string[];
  tokenType?: string;
  idToken?: string;
}

interface GoogleOAuthTokenResponsePayload {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  id_token?: string;
}

function getClientId(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured.");
  }

  return clientId;
}

function getClientSecret(): string {
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientSecret) {
    throw new Error("GOOGLE_CLIENT_SECRET is not configured.");
  }

  return clientSecret;
}

export function getGoogleAdsRedirectUri(): string {
  const configuredRedirectUri = process.env.GOOGLE_ADS_REDIRECT_URI?.trim();

  if (configuredRedirectUri) {
    return configuredRedirectUri;
  }

  const applicationUrl =
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000";

  return `${applicationUrl.replace(/\/$/, "")}/api/google-ads/callback`;
}

function toBase64Url(value: Buffer): string {
  return value.toString("base64url");
}

export function createOAuthState(): string {
  return toBase64Url(randomBytes(32));
}

export function hashOAuthState(state: string): string {
  return createHash("sha256").update(state, "utf8").digest("hex");
}

export function createCodeVerifier(): string {
  return toBase64Url(randomBytes(32));
}

export function createCodeChallenge(verifier: string): string {
  return toBase64Url(createHash("sha256").update(verifier, "utf8").digest());
}

export function parseGrantedScopes(scope?: string): string[] {
  return Array.from(
    new Set(
      (scope || "")
        .split(/\s+/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

export function hasGoogleAdsScope(scopes: readonly string[]): boolean {
  return scopes.includes(GOOGLE_ADS_SCOPE);
}

export function calculateTokenExpiry(expiresInSeconds: number): Date {
  if (!Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
    throw new Error("Google OAuth returned an invalid token expiry.");
  }

  return new Date(Date.now() + Math.floor(expiresInSeconds * 1000));
}

export function createGoogleAdsAuthorizationUrl(input: {
  state: string;
  codeChallenge: string;
  redirectUri?: string;
}): string {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: input.redirectUri || getGoogleAdsRedirectUri(),
    response_type: "code",
    scope: GOOGLE_ADS_SCOPE,
    state: input.state,
    access_type: "offline",
    prompt: "consent",
    code_challenge: input.codeChallenge,
    code_challenge_method: "S256",
  });

  return `${GOOGLE_AUTHORIZATION_ENDPOINT}?${params.toString()}`;
}

export async function exchangeGoogleAdsAuthorizationCode(input: {
  code: string;
  codeVerifier: string;
  redirectUri?: string;
}): Promise<GoogleAdsOAuthTokenResponse> {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      code: input.code,
      code_verifier: input.codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: input.redirectUri || getGoogleAdsRedirectUri(),
    }),
    cache: "no-store",
  });

  let payload: GoogleOAuthTokenResponsePayload;

  try {
    payload = (await response.json()) as GoogleOAuthTokenResponsePayload;
  } catch {
    throw new Error("Google OAuth returned an invalid token response.");
  }

  if (!response.ok || !payload.access_token || !payload.expires_in) {
    throw new Error("Google Ads authorization code exchange failed.");
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: calculateTokenExpiry(payload.expires_in),
    grantedScopes: parseGrantedScopes(payload.scope),
    tokenType: payload.token_type,
    idToken: payload.id_token,
  };
}