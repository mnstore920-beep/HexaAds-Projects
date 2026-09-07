import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();
    const { db } = await connectToDatabase();

    const user = await db.collection("users").findOne({ email });

    if (!user || user.resetCode !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (new Date() > new Date(user.resetCodeExpiry)) {
      return NextResponse.json({ error: "Code has expired" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("users").updateOne(
      { email },
      {
        $set: { password: hashedPassword },
        $unset: { resetCode: "", resetCodeExpiry: "" },
      }
    );

    return NextResponse.json({ message: "Password reset successful" });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}