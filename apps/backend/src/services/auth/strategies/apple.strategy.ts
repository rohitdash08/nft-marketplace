import { Injectable } from '@nestjs/common';
import { IOAuthUser, IOAuthStrategy } from './oauth-strategy.interface';
import axios from 'axios';
import jwt from 'jsonwebtoken';

@Injectable()
export class AppleOAuthStrategy implements IOAuthStrategy {
  private clientId: string;
  private teamId: string;
  private keyId: string;
  private privateKey: string;
  private callbackUrl: string;

  constructor() {
    this.clientId = process.env.APPLE_CLIENT_ID || '';
    this.teamId = process.env.APPLE_TEAM_ID || '';
    this.keyId = process.env.APPLE_KEY_ID || '';
    this.privateKey = process.env.APPLE_PRIVATE_KEY || '';
    this.callbackUrl = process.env.APPLE_CALLBACK_URL || '';
  }

  private generateClientSecret(): string {
    const token = jwt.sign(
      {
        iss: this.teamId,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 * 180,
        aud: 'https://appleid.apple.com',
        sub: this.clientId,
      },
      this.privateKey,
      {
        algorithm: 'ES256',
        keyid: this.keyId,
      }
    );

    return token;
  }

  async getUser(token: string): Promise<IOAuthUser> {
    try {
      const response = await axios.post(
        'https://appleid.apple.com/auth/token',
        {
          token,
          client_id: this.clientId,
          client_secret: this.generateClientSecret(),
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Decode the id_token to get user info
      const decoded = jwt.decode(response.data.id_token) as any;

      return {
        id: decoded.sub,
        email: decoded.email,
        username: decoded.name?.firstName ? `${decoded.name.firstName} ${decoded.name.lastName || ''}` : undefined,
        name: decoded.name?.firstName,
        lastName: decoded.name?.lastName,
      };
    } catch (error) {
      throw new Error('Failed to get user from Apple');
    }
  }

  generateLink(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: 'email name',
      response_mode: 'form_post',
    });

    return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
  }

  async getToken(code: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://appleid.apple.com/auth/token',
        {
          code,
          client_id: this.clientId,
          client_secret: this.generateClientSecret(),
          redirect_uri: this.callbackUrl,
          grant_type: 'authorization_code',
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get token from Apple');
    }
  }
}