import { NextResponse } from "next/server";

import { getDatabase } from "@/lib/mongodb";

function safeErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "MongoDB connection failed";
  }

  return error.message
    .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, "[redacted MongoDB URI]")
    .replace(
      /(password|passwd|pwd|secret|token|uri)\s*=\s*[^\s,;]+/gi,
      "$1=[redacted]"
    );
}

export async function GET() {
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });

    return NextResponse.json({
      ok: true,
      mongodb: "connected",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: safeErrorMessage(error),
      },
      { status: 500 }
    );
  }
}