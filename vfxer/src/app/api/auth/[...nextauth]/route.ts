import NextAuth, { NextAuthOptions, Account, Session } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { JWT } from "next-auth/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'user-read-private user-read-email',
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI!, // Ensure this matches your Spotify Developer Dashboard
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }: { token: JWT, account: Account | null }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.expiresAt = token.expiresAt as number;
      return session;
    },
    async redirect({ baseUrl }: { baseUrl: string }) {
      // Redirect to the landing page after successful authentication
      return `${baseUrl}`; // Adjust the path as needed
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };