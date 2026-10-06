import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";

import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import {
  createCodeChallenge,
  createCodeVerifier,
  createGoogleAdsAuthorizationUrl,
  createOAuthState,
  hashOAuthState,
} from "@/lib/google-ads-oauth";
import { createGoogleAdsOAuthState } from "@/lib/google-ads-connections";

const STATE_COOKIE_NAME = "google_ads_oauth_state";
const DEFAULT_RETURN_TO = "/dashboard/data-sources";
const STATE_MAX_AGE_SECONDS = 10 * 60;

interface UserRecord {
  _id: ObjectId;
  email: string;
}

function getSafeReturnTo(value: string | null): string {
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

async function getCanonicalUserId(
  email: string | null | undefined
): Promise<ObjectId | null> {
  const normalizedEmail = email?.toLowerCase().trim();

  if (!normalizedEmail) {
    return null;
  }

  const database = await getDatabase();
  const user = await database
    .collection<UserRecord>("users")
    .findOne({ email: normalizedEmail });

  return user?._id || null;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false, error: "Authentication is required." },
      { status: 401 }
    );
  }

  try {
    const userId = await getCanonicalUserId(session.user.email);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authenticated user was not found." },
        { status: 401 }
      );
    }

    const state = createOAuthState();
    const codeVerifier = createCodeVerifier();
    const returnTo = getSafeReturnTo(
      new URL(request.url).searchParams.get("returnTo")
    );

    await createGoogleAdsOAuthState({
      userId,
      stateHash: hashOAuthState(state),
      pkceVerifier: codeVerifier,
      returnTo,
    });

    const authorizationUrl = createGoogleAdsAuthorizationUrl({
      state,
      codeChallenge: createCodeChallenge(codeVerifier),
    });
    const response = NextResponse.redirect(authorizationUrl);

    response.cookies.set({
      name: STATE_COOKIE_NAME,
      value: state,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: STATE_MAX_AGE_SECONDS,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to start Google Ads authorization." },
      { status: 500 }
    );
  }
}