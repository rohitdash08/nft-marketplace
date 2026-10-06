import { IProvider, ProviderUser } from './google.provider';

export class AppleProvider implements IProvider {
  private readonly clientId = process.env.APPLE_CLIENT_ID || '';
  private readonly teamId = process.env.APPLE_TEAM_ID || '';
  private readonly keyId = process.env.APPLE_KEY_ID || '';
  private readonly privateKey = process.env.APPLE_PRIVATE_KEY || '';
  private readonly redirectUri =
    process.env.APPLE_REDIRECT_URI || `${process.env.FRONTEND_URL}/auth/apple/callback`;

  async getUser(token: string): Promise<ProviderUser | null> {
    const res = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.generateClientSecret(),
        code: token,
        grant_type: 'authorization_code',
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.id_token) return null;
    const payload = this.decodeJWT(data.id_token);
    if (!payload?.sub || !payload?.email) return null;
    return { id: payload.sub, email: payload.email };
  }

  generateLink(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      response_mode: 'form_post',
      scope: 'name email',
    });
    return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
  }

  async getToken(code: string): Promise<string> {
    const res = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.generateClientSecret(),
        code,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!res.ok) throw new Error('Failed to exchange Apple code for token');
    const data = await res.json();
    return data.id_token;
  }

  private generateClientSecret(): string {
    const header = Buffer.from(
      JSON.stringify({ alg: 'ES256', kid: this.keyId })
    ).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        iss: this.teamId,
        aud: 'https://appleid.apple.com',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 15777000,
        sub: this.clientId,
      })
    ).toString('base64url');
    const crypto = require('crypto');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(`${header}.${payload}`);
    const signature = sign.sign(this.privateKey, 'base64url');
    return `${header}.${payload}.${signature}`;
  }

  private decodeJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(Buffer.from(payload, 'base64url').toString());
    } catch {
      return null;
    }
  }
}
