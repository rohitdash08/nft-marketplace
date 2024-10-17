'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import GoogleLogin from '../../components/GoogleLogin';
import GithubLogin from '../../components/GithubLogin';
import AppleLogin from '../../components/AppleLogin';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (token: string) => {
    try {
      // Here you would typically send the token to your backend for verification
      // and receive a JWT token in response
      // For simplicity, we're just using the received token directly
      login(token);
    } catch (err) {
      setError('Failed to login. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="space-y-4">
          <GoogleLogin onSuccess={handleLogin} />
          <GithubLogin onSuccess={handleLogin} />
          <AppleLogin onSuccess={handleLogin} />
        </div>
      </div>
    </div>
  );
}