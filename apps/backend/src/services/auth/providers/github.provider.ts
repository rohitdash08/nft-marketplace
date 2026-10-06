import { IProvider, ProviderUser } from './google.provider';

export class GithubProvider implements IProvider {
  private readonly clientId = process.env.GITHUB_CLIENT_ID || '';
  private readonly clientSecret = process.env.GITHUB_CLIENT_SECRET || '';
  private readonly redirectUri =
    process.env.GITHUB_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/github/callback`;

  async getUser(token: string): Promise<ProviderUser | null> {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'nft-marketplace',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.id || !data.email) return null;
    return { id: String(data.id), email: data.email };
  }

  generateLink(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'user:email',
      state: Math.random().toString(36).slice(2),
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async getToken(code: string): Promise<string> {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'nft-marketplace',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });
    if (!res.ok) throw new Error('Failed to exchange GitHub code for token');
    const data = await res.json();
    if (data.error) throw new Error(data.error_description || 'GitHub auth failed');
    return data.access_token;
  }
}
