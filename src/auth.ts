import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const allowedEmails = (process.env.ALLOWED_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const email = user.email.toLowerCase();

      // If allowed list is configured, enforce it
      if (allowedEmails.length > 0 || adminEmails.length > 0) {
        const isAllowed =
          adminEmails.includes(email) || allowedEmails.includes(email);
        return isAllowed;
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && session.user.email) {
        const email = session.user.email.toLowerCase();
        const isAdmin = adminEmails.includes(email);
        (session.user as any).role = isAdmin ? "admin" : "student";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        const email = user.email.toLowerCase();
        token.role = adminEmails.includes(email) ? "admin" : "student";
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET || "dev-secret-cronograma-medicina-yanina-2026",
});
