import type { NextAuthConfig } from "next-auth";
import { siteConfig } from "./config";

export const authConfig = {
  secret: siteConfig.secret,
  providers: [], // Providers are added in auth.ts to avoid Edge runtime issues with DB drivers
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
  pages: { 
    signIn: "/auth/login" 
  },
} satisfies NextAuthConfig;
