
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function GithubCallback() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const { code } = router.query; // Get the code from the URL after GitHub redirects

    if (code) {
      // Call the backend to exchange the code for an access token
      fetch('/api/auth/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          login(data.token);
           // Log the user in with the token
          router.push('/home'); 
        } else {
          console.error('Login failed');
        }
      })
      .catch(error => {
        console.error('GitHub login error:', error);
      });
    }
  }, [router.query ,login,router]);

  return <div>Logging in with GitHub...</div>;
}
