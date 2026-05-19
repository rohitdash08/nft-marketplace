import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { IOAuthUser, IOAuthStrategy } from './oauth-strategy.interface';
import axios from 'axios';

@Injectable()
export class GoogleOAuthStrategy implements IOAuthStrategy {
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.callbackUrl = process.env.GOOGLE_CALLBACK_URL || '';
  }

  async getUser(token: string): Promise<IOAuthUser> {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        id: response.data.id,
        email: response.data.email,
        username: response.data.name,
        picture: response.data.picture,
        name: response.data.given_name,
        lastName: response.data.family_name,
      };
    } catch (error) {
      throw new Error('Failed to get user from Google');
    }
  }

  generateLink(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async getToken(code: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.callbackUrl,
          grant_type: 'authorization_code',
        }
      );

      return response.data.access_token;
    } catch (error) {
      throw new Error('Failed to get token from Google');
    }
  }
}