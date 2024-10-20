'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

export default function GoogleLogin() {
  const { login } = useAuth();
 
  const handleCredentialResponse = async (response: any) => {
    try {
      const result = await fetch('http://localhost:3000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });
      const data = await result.json();
      if (data.token) {
        login(data.token);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        const buttonElement = document.getElementById('googleButton');
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, { theme: 'outline', size: 'large' });
        }
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [handleCredentialResponse]);

  

 
  return <div id="googleButton"></div>;
}