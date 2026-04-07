import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'studycubs-lms-development-secret-key-2024',
  providers: [], 
  trustHost: true,
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
