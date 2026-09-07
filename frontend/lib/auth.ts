import type { NextAuthOptions } from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { MongoDBAdapter } from "@auth/mongodb-adapter";

import bcrypt from "bcryptjs";

import clientPromise, { getDatabase } from "@/lib/mongodb";

interface GoogleProfile {
  name?: string;
  given_name?: string;
  family_name?: string;
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as NextAuthOptions["adapter"],

  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: (
        process.env.GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_ID ||
        ""
      ).trim(),

      clientSecret: (
        process.env.GOOGLE_CLIENT_SECRET ||
        process.env.GOOGLE_SECRET ||
        ""
      ).trim(),

        authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/adwords",
        },
      },
    }),

    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "john@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
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

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

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
    error: "/login",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const email = user.email?.toLowerCase().trim();

          if (!email) {
            return false;
          }

          const db = await getDatabase();

          const usersCollection = db.collection("users");

          const existingUser = await usersCollection.findOne({
            email,
          });

          const googleProfile = profile as GoogleProfile | undefined;

          const fullName =
            user.name ||
            googleProfile?.name ||
            "User";

          const nameParts = fullName.split(" ");

          const firstName =
            googleProfile?.given_name ||
            nameParts[0] ||
            "";

          const lastName =
            googleProfile?.family_name ||
            nameParts.slice(1).join(" ") ||
            "";

          const accountName =
            googleProfile?.name ||
            (email
              ? email.split("@")[0]
              : "HexaAds Account");

          const googleData = {
            googleAccessToken: account.access_token || null,
            googleRefreshToken: account.refresh_token || null,
            googleTokenExpires: account.expires_at || null,
            googleScope: account.scope || null,
          };

          if (!existingUser) {
            await usersCollection.insertOne({
              name: fullName,
              email,
              image: user.image || null,
              firstName,
              lastName,
              accountName,
              source: "google",
              ...googleData,
              createdAt: new Date(),
            });
          } else {
            const updateFields: Record<
              string,
              string | number | null
            > = {
              ...googleData,
            };

            if (!existingUser.image && user.image) {
              updateFields.image = user.image;
            }

            if (!existingUser.firstName && firstName) {
              updateFields.firstName = firstName;
            }

            if (!existingUser.lastName && lastName) {
              updateFields.lastName = lastName;
            }

            if (!existingUser.accountName && accountName) {
              updateFields.accountName = accountName;
            }

            if (!existingUser.source) {
              updateFields.source = "google";
            }

            if (Object.keys(updateFields).length > 0) {
              await usersCollection.updateOne(
                { email },
                { $set: updateFields }
              );
            }
          }

          return true;
        } catch (error) {
          console.error(
            "Error during Google signIn database integration:",
            error
          );

          return true;
        }
      }

      return true;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }

      // Default destination
      return `${baseUrl}/dashboard/data-sources`;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id || token.sub;

        if (user.name) {
          token.name = user.name;
        }

        if (user.email) {
          token.email = user.email;
        }

        if (user.image) {
          token.picture = user.image;
        }
      }

      if (account) {
  token.provider = account.provider;
}

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (token.id || token.sub) {
          const sessionUser = session.user as typeof session.user & {
            id?: string;
          };

          sessionUser.id = (token.id || token.sub) as string;
        }

        if (token.name) {
          session.user.name = token.name as string;
        }

        if (token.email) {
          session.user.email = token.email as string;
        }

        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }

       if (token.provider) {
        const sessionWithProvider = session as typeof session & {
          provider?: unknown;
        };

        sessionWithProvider.provider = token.provider;
      }

      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",

  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
}