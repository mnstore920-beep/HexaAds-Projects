import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";

import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { getGoogleAdsConnection } from "@/lib/google-ads-connections";

interface UserRecord {
  _id: ObjectId;
  email: string;
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
      { connected: false, provider: "google_ads", error: "Authentication is required." },
      { status: 401 }
    );
  }

  try {
    const userId = await getCanonicalUserId(session.user.email);

    if (!userId) {
      return NextResponse.json(
        { connected: false, provider: "google_ads" },
        { status: 200 }
      );
    }

    const connection = await getGoogleAdsConnection(userId);

    if (!connection) {
      return NextResponse.json({
        connected: false,
        provider: "google_ads",
      });
    }

    return NextResponse.json({
      connected: true,
      provider: connection.provider,
      googleEmail: connection.googleEmail,
      connectedAt: connection.connectedAt,
      updatedAt: connection.updatedAt,
    });
  } catch {
    return NextResponse.json(
      {
        connected: false,
        provider: "google_ads",
        error: "Unable to load Google Ads connection status.",
      },
      { status: 500 }
    );
  }
}