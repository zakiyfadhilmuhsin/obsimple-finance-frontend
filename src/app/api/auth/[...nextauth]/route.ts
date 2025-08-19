import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";

const handler = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };