import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const { db } = await connectToDatabase();

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await db.collection("users").updateOne(
      { email },
      { $set: { resetCode: code, resetCodeExpiry: expiry } }
    );

  
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "HexaAds - Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #5842EC; margin: 0; font-size: 26px; font-weight: bold;">HexaAds</h2>
          </div>
          <div style="background-color: #F5F3FF; padding: 24px; border-radius: 10px; text-align: center;">
            <h3 style="color: #1f2937; margin-top: 0; font-size: 18px; font-weight: 600;">Verification Code</h3>
            <p style="color: #4b5563; font-size: 14px; margin-bottom: 20px;">Please use the following 6-digit code to reset your password. It will expire in 10 minutes.</p>
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

    return NextResponse.json({ message: "Code sent successfully" });
  } catch (error) {
    console.error("Resend Error:", error);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}