import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDatabase } from "@/lib/mongodb";

interface GoogleProfile {
  name?: string;
  given_name?: string;
  family_name?: string;
}

export const authOptions: NextAuthOptions = {
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
          scope: "openid email profile",
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

        const user = await db.collection("users").findOne({
          email,
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        /*
         * Email verification is required before credentials login.
         */
        if (user.emailVerified !== true) {
          throw new Error(
            "Please verify your email address before logging in"
          );
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

          if (!existingUser) {
            await usersCollection.insertOne({
              name: fullName,
              email,
              image: user.image || null,
              firstName,
              lastName,
              accountName,
              source: "google",
              emailVerified: true,
              createdAt: new Date(),
            });
          } else {
            const updateFields: Record<
              string,
              string | boolean | null
            > = {
              emailVerified: true,
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

            await usersCollection.updateOne(
              { email },
              { $set: updateFields }
            );
          }

          return true;
        } catch (error) {
          console.error(
            "Error during Google signIn database integration:",
            error
          );

          return false;
        }
      }

      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (new URL(url).origin === baseUrl) {
        return url;
      }

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

  secret:
    process.env.NEXTAUTH_SECRET ||
    process.env.AUTH_SECRET,
};