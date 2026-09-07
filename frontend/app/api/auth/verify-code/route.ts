import { createHash } from "crypto";

import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";

import bcrypt from "bcryptjs";

const MAX_RESET_ATTEMPTS = 5;

function hashResetCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();

    if (
      typeof email !== "string" ||
      typeof code !== "string" ||
      typeof newPassword !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.trim();

    if (!normalizedEmail || !/^\d{6}$/.test(normalizedCode)) {
      return NextResponse.json(
        { error: "Invalid verification code." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const user = await db.collection("users").findOne({
      email: normalizedEmail,
    });

    /*
     * Use the same generic response for invalid, expired,
     * or unavailable reset requests.
     */
    if (!user || !user.resetCodeHash || !user.resetCodeExpiry) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    const expiry = new Date(user.resetCodeExpiry);

    if (Date.now() > expiry.getTime()) {
      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $unset: {
            resetCodeHash: "",
            resetCodeExpiry: "",
            resetRequestedAt: "",
            resetCodeAttempts: "",
          },
        }
      );

      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    const attempts = Number(user.resetCodeAttempts || 0);

    if (attempts >= MAX_RESET_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please request a new code." },
        { status: 400 }
      );
    }

    /*
     * Count every verification attempt, including incorrect codes.
     */
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $inc: {
          resetCodeAttempts: 1,
        },
      }
    );

    const submittedCodeHash = hashResetCode(normalizedCode);

    if (submittedCodeHash !== user.resetCodeHash) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    /*
     * Successfully resetting the password invalidates the
     * reset code immediately.
     */
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetCodeHash: "",
          resetCodeExpiry: "",
          resetRequestedAt: "",
          resetCodeAttempts: "",
          resetCode: "",
        },
      }
    );

    return NextResponse.json({
      message: "Password reset successful",
    });
  } catch (error: unknown) {
    console.error("Password reset verification error:", error);

    return NextResponse.json(
      { error: "Unable to reset password." },
      { status: 500 }
    );
  }
}