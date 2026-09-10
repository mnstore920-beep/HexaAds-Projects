import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { timingSafeEqual } from "node:crypto";

import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import {
  consumeGoogleAdsOAuthState,
  upsertGoogleAdsConnection,
} from "@/lib/google-ads-connections";
import {
  exchangeGoogleAdsAuthorizationCode,
  getGoogleAdsRedirectUri,
  hasGoogleAdsScope,
  hashOAuthState,
} from "@/lib/google-ads-oauth";

const STATE_COOKIE_NAME = "google_ads_oauth_state";
const DEFAULT_RETURN_TO = "/dashboard/data-sources";

interface UserRecord {
  _id: ObjectId;
  email: string;
}

function getSafeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_RETURN_TO;
  }

  try {
    const parsed = new URL(value, "http://localhost");

    if (parsed.origin !== "http://localhost") {
      return DEFAULT_RETURN_TO;
    }
  } catch {
    return DEFAULT_RETURN_TO;
  }

  return value;
}

function redirectToDataSources(
  request: Request,
  status: "connected" | "error",
  returnTo?: string
): NextResponse {
  const destination = new URL(
    getSafeReturnTo(returnTo),
    new URL(request.url).origin
  );

  destination.searchParams.set("googleAds", status);
  return NextResponse.redirect(destination);
}

function clearStateCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: STATE_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

function statesMatch(first: string, second: string): boolean {
  const firstBytes = Buffer.from(first, "utf8");
  const secondBytes = Buffer.from(second, "utf8");

  return (
    firstBytes.length === secondBytes.length &&
    timingSafeEqual(firstBytes, secondBytes)
  );
}

async function getCanonicalUser(
  email: string | null | undefined
): Promise<UserRecord | null> {
  const normalizedEmail = email?.toLowerCase().trim();

  if (!normalizedEmail) {
    return null;
  }

  const database = await getDatabase();
  return database
    .collection<UserRecord>("users")
    .findOne({ email: normalizedEmail });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const cookieStore = await cookies();
  const rawState = requestUrl.searchParams.get("state");
  const stateCookie = cookieStore.get(STATE_COOKIE_NAME)?.value;
  const oauthError = requestUrl.searchParams.get("error");

  if (oauthError) {
    const response = redirectToDataSources(request, "error");
    return clearStateCookie(response);
  }

  if (!rawState || !stateCookie || !statesMatch(rawState, stateCookie)) {
    const response = redirectToDataSources(request, "error");
    return clearStateCookie(response);
  }

  const session = await getServerSession(authOptions);
  const currentUser = await getCanonicalUser(session?.user?.email);

  if (!currentUser) {
    const response = redirectToDataSources(request, "error");
    return clearStateCookie(response);
  }

  const oauthState = await consumeGoogleAdsOAuthState({
    stateHash: hashOAuthState(rawState),
    userId: currentUser._id,
  });

  if (!oauthState) {
    const response = redirectToDataSources(request, "error");
    return clearStateCookie(response);
  }

  const returnTo = getSafeReturnTo(oauthState.returnTo);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    const response = redirectToDataSources(request, "error", returnTo);
    return clearStateCookie(response);
  }

  try {
    const tokenResponse = await exchangeGoogleAdsAuthorizationCode({
      code,
      codeVerifier: oauthState.pkceVerifier,
      redirectUri: getGoogleAdsRedirectUri(),
    });

    if (!hasGoogleAdsScope(tokenResponse.grantedScopes)) {
      const response = redirectToDataSources(request, "error", returnTo);
      return clearStateCookie(response);
    }

    if (!tokenResponse.refreshToken) {
      const response = redirectToDataSources(request, "error", returnTo);
      return clearStateCookie(response);
    }

    await upsertGoogleAdsConnection(currentUser._id, {
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      googleSubject: null,
      googleEmail: null,
      grantedScopes: tokenResponse.grantedScopes,
      accessTokenExpiresAt: tokenResponse.expiresAt,
    });

    const response = redirectToDataSources(request, "connected", returnTo);
    return clearStateCookie(response);
  } catch {
    const response = redirectToDataSources(request, "error", returnTo);
    return clearStateCookie(response);
  }
}