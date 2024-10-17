'use client';

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: any) => void;
        signIn: () => Promise<any>;
      };
    };
  }
}

export default function AppleLogin() {
  const { login } = useAuth();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.AppleID) {
        window.AppleID.auth.init({
          clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
          scope: 'name email',
          redirectURI: `${window.location.origin}/api/auth/apple/callback`,
          usePopup: true,
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleLogin = async () => {
    try {
      if (window.AppleID) {
        const response = await window.AppleID.auth.signIn();
        const result = await fetch('/api/auth/apple', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: response.authorization.code }),
        });
        const data = await result.json();
        if (data.token) {
          login(data.token);
        } else {
          throw new Error('Login failed');
        }
      }
    } catch (error) {
      console.error('Apple login error:', error);
    }
  };

  return (
    <button onClick={handleLogin} className="apple-button">
      Sign in with Apple
    </button>
  );
}