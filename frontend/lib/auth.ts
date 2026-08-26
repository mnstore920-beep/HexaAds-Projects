import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import clientPromise, { getDatabase } from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const email = credentials.email.toLowerCase().trim();
        const db = await getDatabase();
        const user = await db.collection("users").findOne({ email });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          name:
            user.name ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.accountName ||
            "User",
          email: user.email,
          image: user.image || null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const email = user.email?.toLowerCase().trim();
          if (!email) return false;

          const db = await getDatabase();
          const usersCollection = db.collection("users");

          const existingUser = await usersCollection.findOne({ email });

          const fullName = user.name || (profile as any)?.name || "User";
          const nameParts = fullName.split(" ");
          const firstName = (profile as any)?.given_name || nameParts[0] || "";
          const lastName = (profile as any)?.family_name || nameParts.slice(1).join(" ") || "";
          const accountName = (profile as any)?.name || email.split("@")[0] || "HexaAds Account";

          if (!existingUser) {
            await usersCollection.insertOne({
              name: fullName,
              email: email,
              image: user.image || null,
              firstName: firstName,
              lastName: lastName,
              accountName: accountName,
              source: "google",
              createdAt: new Date(),
            });
          } else {
            const updateFields: Record<string, any> = {};
            if (!existingUser.image && user.image) updateFields.image = user.image;
            if (!existingUser.firstName && firstName) updateFields.firstName = firstName;
            if (!existingUser.lastName && lastName) updateFields.lastName = lastName;
            if (!existingUser.accountName && accountName) updateFields.accountName = accountName;
            if (!existingUser.source) updateFields.source = "google";

            if (Object.keys(updateFields).length > 0) {
              await usersCollection.updateOne({ email }, { $set: updateFields });
            }
          }
          return true;
        } catch (error) {
          console.error("Error during Google signIn database integration:", error);
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        if (user.name) token.name = user.name;
        if (user.email) token.email = user.email;
        if (user.image) token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          (session.user as any).id = token.id as string;
        }
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "hexaads_default_secret_key_change_in_production",
};
