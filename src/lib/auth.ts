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
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        if (!email || !password) return null;

        console.log(`[Auth] Attempting login for email: ${email}`);

        try {
          // Use raw SQL to find the user
          const user = await db.queryOne<{ id: string, name: string, email: string, password: string, role: string }>(
            "SELECT id, name, email, password, role FROM User WHERE email = ?",
            [email]
          );

          if (!user) {
             console.log(`[Auth] No user found with email: ${email}`);
             return null;
          }

          console.log(`[Auth] User found! Role: ${user.role}. Verifying password...`);

          // Compare hashed password, fallback to plain if not hashed
          const isValid = await bcrypt.compare(password, user.password).catch((err) => {
            console.log(`[Auth] Bcrypt error (likely plain text): ${err.message}`);
            return password === user.password;
          });
          
          if (!isValid) {
            console.log(`[Auth] Password mismatch for: ${email}`);
            return null;
          }

          console.log(`[Auth] LOGIN SUCCESS for: ${user.name}`);
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch (error: any) {
          console.error("[Auth] Database error during login:", error.message);
          return null;
        }
      },
    }),
  ],
});
