import { Injectable } from '@nestjs/common';
import { IOAuthUser, IOAuthStrategy } from './oauth-strategy.interface';
import axios from 'axios';

@Injectable()
export class GitHubOAuthStrategy implements IOAuthStrategy {
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;

  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID || '';
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET || '';
    this.callbackUrl = process.env.GITHUB_CALLBACK_URL || '';
  }

  async getUser(token: string): Promise<IOAuthUser> {
    try {
      const [userResponse, emailsResponse] = await Promise.all([
        axios.get('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const primaryEmail = emailsResponse.data.find(
        (email: any) => email.primary && email.verified
      )?.email || emailsResponse.data[0]?.email;

      return {
        id: String(userResponse.data.id),
        email: primaryEmail,
        username: userResponse.data.login,
        picture: userResponse.data.avatar_url,
        name: userResponse.data.name || userResponse.data.login,
      };
    } catch (error) {
      throw new Error('Failed to get user from GitHub');
    }
  }

  generateLink(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: 'user:email read:user',
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async getToken(code: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.callbackUrl,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get token from GitHub');
    }
  }
}