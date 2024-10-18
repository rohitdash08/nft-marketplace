import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/api/auth/github/callback',
      scope: ['user:email'], // GitHub doesn't need 'profile'
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, emails, username } = profile;

    // GitHub might not return an email, handle that case
    const email = emails && emails.length > 0 ? emails[0].value : null;

    // Create or fetch the user from your database
    const user = {
      githubId: id,
      username: username,
      email: email,
      accessToken,
    };

    // Return user data to complete the login process
    return user;
  }
}
