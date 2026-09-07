import { refreshGoogleAccessToken } from "@/lib/google-token";

import { NextResponse } from "next/server";

import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";

import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized. Please sign in to access Google Ads accounts.",
        },
        { status: 401 }
      );
    }

    // Retrieve Google OAuth credentials server-side.
    // Tokens are intentionally not exposed through the client session.
    let accessToken: string | undefined;
    let refreshToken: string | undefined;
    let tokenExpiresAt: number | undefined;
    let tokenSource: "user" | "account" | undefined;

    if (session.user.email) {
      try {
        const db = await getDatabase();

        const userDoc = await db.collection("users").findOne({
          email: session.user.email.toLowerCase().trim(),
        });

        if (userDoc?.googleAccessToken) {
          accessToken = userDoc.googleAccessToken;
          refreshToken = userDoc.googleRefreshToken || undefined;

          tokenExpiresAt = userDoc.googleTokenExpires
            ? userDoc.googleTokenExpires * 1000
            : undefined;

          tokenSource = "user";
        }

        // Fallback to the MongoDBAdapter accounts collection.
        if (!accessToken && userDoc?._id) {
          const accountDoc = await db.collection("accounts").findOne({
            userId: userDoc._id,
            provider: "google",
          });

          if (accountDoc?.access_token) {
            accessToken = accountDoc.access_token;
            refreshToken = accountDoc.refresh_token || undefined;

            tokenExpiresAt = accountDoc.expires_at
              ? accountDoc.expires_at * 1000
              : undefined;

            tokenSource = "account";
          }
        }

        // Refresh the Google access token when it is expired
        // or will expire within the next minute.
        const shouldRefresh =
          Boolean(refreshToken) &&
          Boolean(tokenExpiresAt) &&
          tokenExpiresAt <= Date.now() + 60_000;

        if (shouldRefresh && refreshToken) {
          const refreshed = await refreshGoogleAccessToken(refreshToken);

          accessToken = refreshed.accessToken;
          tokenExpiresAt = refreshed.expiresAt;

          if (tokenSource === "user" && userDoc?._id) {
            await db.collection("users").updateOne(
              { _id: userDoc._id },
              {
                $set: {
                  googleAccessToken: refreshed.accessToken,
                  googleTokenExpires: Math.floor(
                    refreshed.expiresAt / 1000
                  ),
                },
              }
            );
          } else if (tokenSource === "account" && userDoc?._id) {
            await db.collection("accounts").updateOne(
              {
                userId: userDoc._id,
                provider: "google",
              },
              {
                $set: {
                  access_token: refreshed.accessToken,
                  expires_at: Math.floor(
                    refreshed.expiresAt / 1000
                  ),
                },
              }
            );
          }
        }
      } catch (dbError) {
        console.error(
          "Database lookup or Google token refresh error:",
          dbError
        );
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No Google OAuth access token found. Please sign in or re-authenticate with your Google account.",
          code: "NO_ACCESS_TOKEN",
        },
        { status: 400 }
      );
    }

    const developerToken = (
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN ||
      process.env.GOOGLE_DEVELOPER_TOKEN ||
      ""
    ).trim();

    // Call Google Ads API to list accessible customers.
    const googleAdsResponse = await fetch(
      "https://googleads.googleapis.com/v17/customers:listAccessibleCustomers",
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

    const data = await googleAdsResponse.json();

    if (!googleAdsResponse.ok) {
      console.error("Google Ads API error response:", data);

      return NextResponse.json(
        {
          success: false,
          error:
            data.error?.message ||
            "Failed to fetch Google Ads accounts from Google API.",
          details: data.error || data,
          statusCode: googleAdsResponse.status,
        },
        { status: googleAdsResponse.status }
      );
    }

    const rawResourceNames: string[] = data.resourceNames || [];

    // Format customer resources into clean account objects.
    const accounts = rawResourceNames.map((resourceName) => {
      const customerId = resourceName.replace("customers/", "");

      const formattedId =
        customerId.length === 10
          ? `${customerId.slice(0, 3)}-${customerId.slice(
              3,
              6
            )}-${customerId.slice(6)}`
          : customerId;

      return {
        resourceName,
        customerId,
        formattedId,
        name: `Google Ads Account (${formattedId})`,
      };
    });

    return NextResponse.json({
      success: true,
      accounts,
      rawResourceNames,
      count: accounts.length,
    });
  } catch (error: unknown) {
    console.error(
      "Internal error in /api/google-ads/accounts:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Internal server error occurred.",
      },
      { status: 500 }
    );
  }
}