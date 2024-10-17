'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);
    try {
      router.push('http://localhost:3000/api/auth/google');
    } catch (error) {
      console.error('Error during Google login:', error);
      setError('Failed to initiate Google login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleGoogleLogin} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login with Google'}
      </button>
    </div>
  );
}