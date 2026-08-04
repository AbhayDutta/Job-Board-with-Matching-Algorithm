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
        const email = credentials.email.toLowerCase().trim();
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      } catch (err) {
        console.error("Authorize error:", err);
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
        if (!user.email) return false;
        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            await db.user.create({
              data: {
                email: user.email,
                name: user.name || user.email.split("@")[0],
                password: "OAUTH_EXTERNAL_USER",
                role: "CANDIDATE",
              },
            });
          }
        } catch (err) {
          console.error("OAuth auto-registration error:", err);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: user.email },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id;
          } else {
            token.role = (user as any).role || "CANDIDATE";
            token.id = user.id;
          }
        } catch {
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
  },
  secret: AUTH_SECRET,
};
