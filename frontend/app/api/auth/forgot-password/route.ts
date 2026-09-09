import { randomInt, createHash } from "crypto";

import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";

import { Resend } from "resend";

const RESET_CODE_EXPIRY_MS = 10 * 60 * 1000;
const RESET_REQUEST_COOLDOWN_MS = 60 * 1000;

function hashResetCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (typeof email !== "string") {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const user = await db.collection("users").findOne({
      email: normalizedEmail,
    });

    /*
     * Always return the same response for existing and non-existing
     * accounts to prevent user enumeration.
     */
    if (!user) {
      return NextResponse.json({
        message:
          "If an account exists for this email, a password reset code has been sent.",
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Unable to process password reset request." },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    /*
     * Prevent repeated reset requests for the same account.
     */
    const lastResetRequest = user.resetRequestedAt;

    if (
      lastResetRequest instanceof Date &&
      Date.now() - lastResetRequest.getTime() <
        RESET_REQUEST_COOLDOWN_MS
    ) {
      return NextResponse.json({
        message:
          "If an account exists for this email, a password reset code has been sent.",
      });
    }

    /*
     * Generate a cryptographically secure 6-digit reset code.
     */
    const code = randomInt(100000, 1000000).toString();

    const expiry = new Date(
      Date.now() + RESET_CODE_EXPIRY_MS
    );

    /*
     * Store only a hash of the reset code.
     * The plaintext code is sent only to the user's email.
     */
    const codeHash = hashResetCode(code);

    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: normalizedEmail,
      subject: "HexaAds - Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #5842EC; margin: 0; font-size: 26px; font-weight: bold;">HexaAds</h2>
          </div>

          <div style="background-color: #F5F3FF; padding: 24px; border-radius: 10px; text-align: center;">
            <h3 style="color: #1f2937; margin-top: 0; font-size: 18px; font-weight: 600;">
              Verification Code
            </h3>

            <p style="color: #4b5563; font-size: 14px; margin-bottom: 20px;">
              Please use the following 6-digit code to reset your password.
              It will expire in 10 minutes.
            </p>

            <div style="background-color: #5842EC; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; display: inline-block; border-radius: 8px;">
              ${code}
            </div>
          </div>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
            If you did not request a password reset, please ignore this email.
          </p>
        </div>
      `,
    });

    if (emailResult.error) {
      throw new Error("Unable to send password reset email.");
    }

    /*
     * Save the hashed code only after the email has been accepted by Resend.
     */
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          resetCodeHash: codeHash,
          resetCodeExpiry: expiry,
          resetRequestedAt: new Date(),
        },
        $unset: {
          resetCode: "",
        },
      }
    );

    return NextResponse.json({
      message:
        "If an account exists for this email, a password reset code has been sent.",
    });
  } catch (error: unknown) {
    console.error("Password reset request error:", error);

    return NextResponse.json(
      { error: "Unable to process password reset request." },
      { status: 500 }
    );
  }
}