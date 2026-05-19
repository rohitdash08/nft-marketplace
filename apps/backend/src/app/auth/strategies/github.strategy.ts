import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: `${process.env.API_URL || 'http://localhost:3000'}/api/auth/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, displayName, username, emails, photos } = profile;
    const user = {
      provider: 'github',
      providerId: id,
      email: emails?.[0]?.value || `${username}@github.users`,
      name: displayName || username,
      avatar: photos?.[0]?.value,
    };
    done(null, user);
  }
}
