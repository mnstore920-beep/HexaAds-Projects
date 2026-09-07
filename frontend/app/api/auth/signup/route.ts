import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, firstName, lastName, accountName, source, usage } = body;

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

    // Determine final name
    const finalName =
      name?.trim() ||
      `${firstName || ""} ${lastName || ""}`.trim() ||
      accountName?.trim() ||
      "User";

    const db = await getDatabase();
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email address" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

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
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: result.insertedId.toString(),
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
  error: error instanceof Error ? error.message : "Internal server error",
  },
      { status: 500 }
    );
  }
}

