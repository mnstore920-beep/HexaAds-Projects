import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

function hashVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const token = searchParams.get("token")?.trim();
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!token || !email) {
      return NextResponse.json(
        { error: "Verification token and email are required." },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      email,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid verification link." },
        { status: 400 }
      );
    }

    if (user.emailVerified === true) {
      return NextResponse.json(
        { message: "Email is already verified." },
        { status: 200 }
      );
    }

    if (!user.verificationTokenHash || !user.verificationTokenExpiry) {
      return NextResponse.json(
        { error: "Invalid or expired verification link." },
        { status: 400 }
      );
    }

    const expiry = new Date(user.verificationTokenExpiry);

    if (Date.now() > expiry.getTime()) {
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $unset: {
            verificationTokenHash: "",
            verificationTokenExpiry: "",
          },
        }
      );

      return NextResponse.json(
        { error: "Verification link has expired." },
        { status: 400 }
      );
    }

    const tokenHash = hashVerificationToken(token);

    if (tokenHash !== user.verificationTokenHash) {
      return NextResponse.json(
        { error: "Invalid verification link." },
        { status: 400 }
      );
    }

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerified: true,
        },
        $unset: {
          verificationTokenHash: "",
          verificationTokenExpiry: "",
        },
      }
    );

    return NextResponse.json(
      {
        message: "Email verified successfully.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error verifying email:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}