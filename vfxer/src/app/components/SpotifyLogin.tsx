'use client';

import { signIn } from 'next-auth/react';

export default function SpotifyLogin() {
  const handleLogin = async () => {
    const result = await signIn('spotify', { callbackUrl: '/' });
    if (result?.error) {
      console.error('Error signing in:', result.error);
      // Handle the error (e.g., show a message to the user)
    }
  };

  return (
    <button onClick={handleLogin}>Login with Spotify</button>
  );
}