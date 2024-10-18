'use client';

export default function GithubLogin() {
  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `http://localhost:3000/api/auth/github/callback`; // Set callback URL to a Next.js page
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;

    // Redirect user to GitHub OAuth login
    window.location.href = githubUrl;
  };

  return (
    <button onClick={handleLogin} className="github-button text-gray-500 hover:bg-black hover:text-white rounded-sm">
      Sign in with GitHub
    </button>
  );
}
