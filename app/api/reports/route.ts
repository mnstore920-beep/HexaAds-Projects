import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { createReport, getReportsForUser } from "@/lib/reports";

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
      {
        success: false,
        error: "Unauthorized.",
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
        },
        { status: 401 }
      );
    }

    const reports = await getReportsForUser(userId);

    return NextResponse.json({
      success: true,
      reports,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to load reports.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized.",
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
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const internalName =
      typeof body.internalName === "string"
        ? body.internalName.trim()
        : "";

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const type =
      body.type === "standalone"
        ? "standalone"
        : "template";

    const googleAdsAccountId =
      typeof body.googleAdsAccountId === "string"
        ? body.googleAdsAccountId.trim()
        : "";

    const googleAdsAccountName =
      typeof body.googleAdsAccountName === "string"
        ? body.googleAdsAccountName.trim()
        : "";

    if (!internalName || !title) {
      return NextResponse.json(
        {
          success: false,
          error: "Internal name and report title are required.",
        },
        { status: 400 }
      );
    }

    if (!googleAdsAccountId || !googleAdsAccountName) {
      return NextResponse.json(
        {
          success: false,
          error: "A Google Ads account is required.",
        },
        { status: 400 }
      );
    }

    const report = await createReport({
      userId,
      internalName,
      title,
      type,
      googleAdsAccountId,
      googleAdsAccountName,
    });

    return NextResponse.json(
      {
        success: true,
        report,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to create report.",
      },
      { status: 500 }
    );
  }
}