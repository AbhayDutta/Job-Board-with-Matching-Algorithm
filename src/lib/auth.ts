import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "fitboard-auth-secret-keys-neon-postgress-3453";

const providers: any[] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      try {
        const rawEmail = credentials.email.trim();
        const lowerEmail = rawEmail.toLowerCase();

        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: rawEmail },
              { email: lowerEmail },
              { email: { equals: lowerEmail, mode: "insensitive" } },
            ],
          },
        });

        if (!user || !user.password) {
          console.warn("[Auth] Credentials login failed: user not found or no password hash for", lowerEmail);
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          console.warn("[Auth] Credentials login failed: invalid password for", lowerEmail);
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        };
      } catch (err) {
        console.error("[Auth] Authorize exception error:", err);
        return null;
      }
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        if (!user.email) {
          console.error("[Auth OAuth] No email returned by provider", account.provider);
          return false;
        }
        try {
          const rawEmail = user.email.trim();
          const lowerEmail = rawEmail.toLowerCase();

          const existingUser = await db.user.findFirst({
            where: {
              OR: [
                { email: rawEmail },
                { email: lowerEmail },
                { email: { equals: lowerEmail, mode: "insensitive" } },
              ],
            },
          });

          if (!existingUser) {
            const userName = user.name || rawEmail.split("@")[0];
            const newUser = await db.user.create({
              data: {
                email: lowerEmail,
                name: userName,
                password: "OAUTH_EXTERNAL_USER",
                role: "CANDIDATE",
                candidateProfile: {
                  create: {
                    name: userName,
                    skills: [],
                    experience: [],
                    education: [],
                  },
                },
              },
            });
            console.log(`[Auth OAuth] Created new candidate user ${newUser.id} via ${account.provider} (${lowerEmail})`);
          } else {
            console.log(`[Auth OAuth] Logged in existing user ${existingUser.id} via ${account.provider} (${lowerEmail})`);
          }
        } catch (err) {
          console.error("[Auth OAuth] Auto-registration error:", err);
          // Allow sign in even if DB creation failed so session isn't blocked, or return true
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        try {
          const rawEmail = user.email.trim();
          const lowerEmail = rawEmail.toLowerCase();
          const dbUser = await db.user.findFirst({
            where: {
              OR: [
                { email: rawEmail },
                { email: lowerEmail },
                { email: { equals: lowerEmail, mode: "insensitive" } },
              ],
            },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id;
          } else {
            token.role = (user as any).role || "CANDIDATE";
            token.id = user.id;
          }
        } catch (err) {
          console.error("[Auth JWT] Error fetching user role:", err);
          token.role = (user as any).role || "CANDIDATE";
          token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.role = token.role as any;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: AUTH_SECRET,
};
