'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token);
      router.push('/dashboard');
    }
  }, [router, searchParams, login]);

  return <div>Authentication successful. Redirecting...</div>;
}