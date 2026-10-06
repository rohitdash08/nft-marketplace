import { Injectable } from '@nestjs/common';

export interface ProviderUser {
  id: string;
  email: string;
}

export interface IProvider {
  getUser(token: string): Promise<ProviderUser | null>;
  generateLink(): string;
  getToken(code: string): Promise<string>;
}

@Injectable()
export class GoogleProvider implements IProvider {
  private readonly clientId = process.env.GOOGLE_CLIENT_ID || '';
  private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  private readonly redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/google/callback`;

  async getUser(token: string): Promise<ProviderUser | null> {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(token)}`,
      {
        headers: { 'User-Agent': 'nft-marketplace' },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.sub || !data.email) return null;
    return { id: data.sub, email: data.email };
  }

  generateLink(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async getToken(code: string): Promise<string> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!res.ok) throw new Error('Failed to exchange Google code for token');
    const data = await res.json();
    if (data.error) throw new Error(data.error_description || 'Google auth failed');
    return data.id_token || data.access_token;
  }
}
