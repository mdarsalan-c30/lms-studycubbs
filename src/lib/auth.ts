import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { siteConfig } from "./config";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      id: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: siteConfig.secret,
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        if (!email || !password) return null;

        try {
          // Use raw SQL to find the user
          const user = await db.queryOne<{ id: string, name: string, email: string, password: string, role: string }>(
            "SELECT id, name, email, password, role FROM User WHERE email = ?",
            [email]
          );

          if (!user) return null;

          // Compare hashed password, fallback to plain if not hashed (initial setup only)
          const isValid = await bcrypt.compare(password, user.password).catch(() => password === user.password);
          
          if (!isValid) return null;

          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch (error) {
          console.error("Auth DB error:", error);
          return null;
        }
      },
    }),
  ],
});
