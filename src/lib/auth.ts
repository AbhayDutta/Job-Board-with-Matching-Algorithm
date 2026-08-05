import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyMagicToken } from "@/lib/magic-token";

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "fitboard-auth-secret-keys-neon-postgress-3453";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        magicToken: { label: "Magic Token", type: "text" },
      },
      async authorize(credentials) {
        // ── 1. Passwordless Magic Link Authentication ──────────────────────────
        if (credentials?.magicToken) {
          const payload = verifyMagicToken(credentials.magicToken);
          if (!payload) {
            console.warn("[Auth] Magic Token verification failed or token expired.");
            return null;
          }

          const lowerEmail = payload.email.toLowerCase().trim();
          const selectedRole = payload.role || "CANDIDATE";

          let user = await db.user.findFirst({
            where: {
              OR: [
                { email: lowerEmail },
                { email: { equals: lowerEmail, mode: "insensitive" } },
              ],
            },
          });

          if (!user) {
            const userName = payload.name || lowerEmail.split("@")[0];

            user = await db.user.create({
              data: {
                email: lowerEmail,
                name: userName,
                password: "MAGIC_LINK_USER",
                role: selectedRole,
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
            console.log(`[Auth MagicLink] Auto-created new ${selectedRole} user: ${user.id} (${lowerEmail})`);
          } else {
            // Dual-Role Support: Update user role to whichever role they picked for this session
            user = await db.user.update({
              where: { id: user.id },
              data: { role: selectedRole },
            });

            // Ensure CandidateProfile exists for dual-role users
            const existingProfile = await db.candidateProfile.findUnique({
              where: { userId: user.id },
            });
            if (!existingProfile) {
              await db.candidateProfile.create({
                data: {
                  userId: user.id,
                  name: user.name || lowerEmail.split("@")[0],
                  skills: [],
                  experience: [],
                  education: [],
                },
              });
            }

            console.log(`[Auth MagicLink] Authenticated existing user ${user.id} (${lowerEmail}) as ${selectedRole}`);
          }

          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
          };
        }

        // ── 2. Standard Password Credentials Authentication ─────────────────────
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
  ],
  callbacks: {
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
