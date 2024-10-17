'use client';

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function GithubLogin() {
  const { login } = useAuth();

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleMessage = async (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.data.type === 'github-oauth-response') {
      try {
        const result = await fetch('/api/auth/github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: event.data.code }),
        });
        const data = await result.json();
        if (data.token) {
          login(data.token);
        } else {
          throw new Error('Login failed');
        }
      } catch (error) {
        console.error('GitHub login error:', error);
      }
    }
  };

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `http://localhost:3000/api/auth/github/callback`;
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.open(githubUrl, 'GitHub Login', 'width=600,height=700');
  };

  return (
    <button onClick={handleLogin} className="github-button">
      Sign in with GitHub
    </button>
  );
}