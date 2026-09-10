import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import {
  getGoogleAdsConnectionWithTokens,
  markGoogleAdsConnectionUsed,
  upsertGoogleAdsConnection,
} from "@/lib/google-ads-connections";
import { GOOGLE_ADS_SCOPE } from "@/lib/google-ads-oauth";
import { getDatabase } from "@/lib/mongodb";
import { refreshGoogleAccessToken } from "@/lib/google-token";

const GOOGLE_ADS_API_VERSION = "v22";
const ACCESS_TOKEN_REFRESH_WINDOW_MS = 60_000;

interface UserRecord {
  _id: ObjectId;
  email: string;
}

interface GoogleAdsListAccessibleCustomersResponse {
  resourceNames?: unknown;
}

function authorizationRequiredResponse() {
  return NextResponse.json(
    {
      success: false,
      error:
        "Google Ads authorization is required before Google Ads accounts can be loaded.",
      code: "GOOGLE_ADS_AUTHORIZATION_REQUIRED",
    },
    { status: 403 }
  );
}

function reauthorizationRequiredResponse() {
  return NextResponse.json(
    {
      success: false,
      error: "Google Ads authorization has expired. Please reconnect Google Ads.",
      code: "GOOGLE_ADS_REAUTH_REQUIRED",
    },
    { status: 401 }
  );
}

function getCustomerId(resourceName: string): string | null {
  const match = /^customers\/(\d{10})$/.exec(resourceName);
  return match?.[1] || null;
}

function getSafeApiErrorResponse(status: number) {
  if (status === 401) {
    return reauthorizationRequiredResponse();
  }

  if (status === 403) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Google Ads rejected the request. Check the developer token and authorization.",
        code: "GOOGLE_ADS_API_FORBIDDEN",
      },
      { status: 403 }
    );
  }

  if (status === 429) {
    return NextResponse.json(
      {
        success: false,
        error: "Google Ads is temporarily rate-limiting requests. Please try again later.",
        code: "GOOGLE_ADS_RATE_LIMITED",
      },
      { status: 429 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: "Google Ads is temporarily unavailable. Please try again later.",
      code: "GOOGLE_ADS_UPSTREAM_ERROR",
    },
    { status: status >= 500 ? 502 : status }
  );
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

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized. Please sign in to access Google Ads accounts.",
        code: "UNAUTHORIZED",
      },
      { status: 401 }
    );
  }

  try {
    const userId = await getCanonicalUserId(session.user.email);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authenticated user was not found.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const googleAdsConnection = await getGoogleAdsConnectionWithTokens(userId);

    if (!googleAdsConnection) {
      return authorizationRequiredResponse();
    }

    const { connection, tokens } = googleAdsConnection;

    if (!connection.grantedScopes.includes(GOOGLE_ADS_SCOPE)) {
      return authorizationRequiredResponse();
    }

    let accessToken = tokens.accessToken;
    const tokenExpiresAt = connection.accessTokenExpiresAt.getTime();
    const shouldRefresh =
      !Number.isFinite(tokenExpiresAt) ||
      tokenExpiresAt <= Date.now() + ACCESS_TOKEN_REFRESH_WINDOW_MS;

    if (shouldRefresh) {
      let refreshed;

      try {
        refreshed = await refreshGoogleAccessToken(tokens.refreshToken);
      } catch {
        return reauthorizationRequiredResponse();
      }

      accessToken = refreshed.accessToken;

      await upsertGoogleAdsConnection(userId, {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        googleSubject: connection.googleSubject,
        googleEmail: connection.googleEmail,
        grantedScopes: connection.grantedScopes,
        accessTokenExpiresAt: new Date(refreshed.expiresAt),
      });
    }

    const developerToken = (
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN ||
      process.env.GOOGLE_DEVELOPER_TOKEN ||
      ""
    ).trim();

    if (!developerToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Google Ads developer token is not configured.",
          code: "GOOGLE_ADS_DEVELOPER_TOKEN_MISSING",
        },
        { status: 503 }
      );
    }

    const googleAdsResponse = await fetch(
      `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers:listAccessibleCustomers`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": developerToken,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!googleAdsResponse.ok) {
      return getSafeApiErrorResponse(googleAdsResponse.status);
    }

    let data: GoogleAdsListAccessibleCustomersResponse;

    try {
      data = (await googleAdsResponse.json()) as GoogleAdsListAccessibleCustomersResponse;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Google Ads returned an invalid response.",
          code: "GOOGLE_ADS_INVALID_RESPONSE",
        },
        { status: 502 }
      );
    }

    const resourceNames = Array.isArray(data.resourceNames)
      ? data.resourceNames.filter(
          (resourceName): resourceName is string =>
            typeof resourceName === "string" &&
            getCustomerId(resourceName) !== null
        )
      : [];

    const accounts = resourceNames.map((resourceName) => {
      const customerId = getCustomerId(resourceName) as string;
      const formattedId = `${customerId.slice(0, 3)}-${customerId.slice(
        3,
        6
      )}-${customerId.slice(6)}`;

      return {
        resourceName,
        customerId,
        formattedId,
        name: `Google Ads Account (${formattedId})`,
      };
    });

    await markGoogleAdsConnectionUsed(userId);

    return NextResponse.json({
      success: true,
      accounts,
      rawResourceNames: resourceNames,
      count: accounts.length,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to load Google Ads accounts.",
        code: "GOOGLE_ADS_INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}