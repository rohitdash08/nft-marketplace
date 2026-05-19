import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import AppleStrategy from 'passport-apple';

@Injectable()
export class AppleSignInStrategy extends PassportStrategy(AppleStrategy, 'apple') {
  constructor() {
    super({
      clientID: process.env.APPLE_CLIENT_ID || '',
      teamID: process.env.APPLE_TEAM_ID || '',
      keyID: process.env.APPLE_KEY_ID || '',
      keyFilePath: process.env.APPLE_KEY_FILE_PATH || '',
      callbackURL: `${process.env.API_URL || 'http://localhost:3000'}/api/auth/apple/callback`,
      scope: ['email', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id } = profile;
    const email = profile.email || '';
    const name = profile.name
      ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim()
      : 'Apple User';
    const user = {
      provider: 'apple',
      providerId: id,
      email,
      name,
    };
    done(null, user);
  }
}
