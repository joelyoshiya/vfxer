import { NextRequest, NextResponse } from 'next/server';
import querystring from 'querystring';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    // Step 1: Redirect to Spotify authorization page
    const scope = 'user-read-private user-read-email';
    const authUrl = 'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
      });
    return NextResponse.redirect(authUrl);
  } else {
    // Step 2: Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
      },
      body: querystring.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      }),
    });

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      // Handle successful authentication (e.g., save tokens, redirect)
      return NextResponse.json({ success: true, ...tokenData });
    } else {
      return NextResponse.json({ error: 'Failed to obtain access token' }, { status: 400 });
    }
  }
}