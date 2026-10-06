import { randomBytes, createHash } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDatabase } from "@/lib/mongodb";
import { Resend } from "resend";

const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function hashVerificationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      password,
      firstName,
      lastName,
      accountName,
      source,
      usage,
    } = body;

    const normalizedEmail = email?.toLowerCase()?.trim();

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured.");
      return NextResponse.json(
        { error: "Unable to send verification email." },
        { status: 500 }
      );
    }

    const finalName =
      name?.trim() ||
      `${firstName || ""} ${lastName || ""}`.trim() ||
      accountName?.trim() ||
      "User";

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email address" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate secure verification token
    const verificationToken = randomBytes(32).toString("hex");
    const verificationTokenHash = hashVerificationToken(verificationToken);
    const verificationTokenExpiry = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_MS
    );

    const newUser = {
      name: finalName,
      email: normalizedEmail,
      password: hashedPassword,
      image: null,

      accountName: accountName?.trim() || null,
      firstName: firstName?.trim() || null,
      lastName: lastName?.trim() || null,
      source: source || null,
      usage: usage || null,

      // Email verification state
      emailVerified: false,
      verificationTokenHash,
      verificationTokenExpiry,

      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    // Send verification email
    const resend = new Resend(resendApiKey);

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const verificationUrl =
      `${baseUrl}/verify-email?token=${verificationToken}` +
      `&email=${encodeURIComponent(normalizedEmail)}`;

    let emailResult;

    try {
      emailResult = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: normalizedEmail,
        subject: "HexaAds - Verify your email",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #5842EC;">Welcome to HexaAds!</h2>

          <p>Hi ${finalName},</p>

          <p>
            Thank you for creating your HexaAds account.
            Please verify your email address to activate your account.
          </p>

          <p style="margin: 30px 0;">
            <a
              href="${verificationUrl}"
              style="
                background: #5842EC;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                display: inline-block;
              "
            >
              Verify Email
            </a>
          </p>

          <p>
            This verification link will expire in 24 hours.
          </p>

          <p>
            If you did not create this account, you can safely ignore this email.
          </p>

          <p>— HexaAds Team</p>
        </div>
        `,
      });
    } catch (error) {
      await usersCollection.deleteOne({ _id: result.insertedId });
      throw error;
    }

    if (emailResult.error) {
      // Remove the account if verification email could not be sent.
      await usersCollection.deleteOne({ _id: result.insertedId });

      console.error("Verification email error:", emailResult.error);

      return NextResponse.json(
        { error: "Unable to send verification email." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Account created successfully. Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating user:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}