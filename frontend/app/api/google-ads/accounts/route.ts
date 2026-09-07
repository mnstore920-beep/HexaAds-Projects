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
          error: "Unauthorized. Please sign in to access Google Ads accounts.",
        },
        { status: 401 }
      );
    }

    // Attempt to extract access token from NextAuth session
    const sessionWithToken = session as typeof session & {
  accessToken?: string;
};

let accessToken = sessionWithToken.accessToken;

    // Fallback: Query MongoDB user record if token is not in session JWT
    if (!accessToken && session.user.email) {
      try {
        const db = await getDatabase();
        const userDoc = await db.collection("users").findOne({
          email: session.user.email.toLowerCase().trim(),
        });

        if (userDoc?.googleAccessToken) {
          accessToken = userDoc.googleAccessToken;
        } else {
          // Check accounts collection (created by MongoDBAdapter)
          const accountDoc = await db.collection("accounts").findOne({
           userId:
  userDoc?._id ||
  (session.user as typeof session.user & { id?: string }).id,
            provider: "google",
          });
          if (accountDoc?.access_token) {
            accessToken = accountDoc.access_token;
          }
        }
      } catch (dbError) {
        console.error("Database lookup error for Google access token:", dbError);
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

    // Call Google Ads API to list accessible customers
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

    // Format customer resources into clean account objects
    const accounts = rawResourceNames.map((resourceName) => {
      const customerId = resourceName.replace("customers/", "");
      const formattedId =
        customerId.length === 10
          ? `${customerId.slice(0, 3)}-${customerId.slice(3, 6)}-${customerId.slice(6)}`
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
  console.error("Internal error in /api/google-ads/accounts:", error);

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
