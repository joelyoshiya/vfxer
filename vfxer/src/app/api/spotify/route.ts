import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  // Construct the base URL
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("host") || "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  if (!session) {
    if (!code) {
      // Step 1: Redirect to Spotify authorization page
      const scope = 'user-read-private user-read-email';
      const authUrl = 'https://accounts.spotify.com/authorize?' +
        new URLSearchParams({
          response_type: 'code',
          client_id: process.env.SPOTIFY_CLIENT_ID!,
          scope: scope,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        }).toString();
      return NextResponse.redirect(authUrl);
    } else {
      // Step 2: Exchange code for access token
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
        },
        body: new URLSearchParams({
          code: code,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
          grant_type: 'authorization_code'
        }).toString(),
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        // Instead of redirecting, return the token data
        return NextResponse.json(tokenData);
      } else {
        return NextResponse.json({ error: 'Failed to obtain access token' }, { status: 400 });
      }
    }
  }

  // If session exists, user is already authenticated
  return NextResponse.redirect(`${baseUrl}/`);
}