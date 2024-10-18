import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-apple';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor() {
    super({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ensure proper formatting of private key
      callbackURL: process.env.APPLE_CALLBACK_URL || 'http://localhost:3000/api/auth/apple/callback', 
      passReqToCallback: true,
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, idToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const user = {
      email: profile.email,
      firstName: profile.firstName || '', // Apple does not always provide a first name
      lastName: profile.lastName || '', // Apple does not always provide a last name
      picture: profile.picture || '', // Apple does not provide a picture by default
      accessToken,
    };
    done(null, user);
  }
}
