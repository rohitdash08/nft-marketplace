import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateOAuthLogin(profile: OAuthProfile): Promise<{ accessToken: string }> {
    // In production: upsert user in DB, link provider accounts.
    // For now: issue JWT with the profile payload.
    const payload = {
      sub: `${profile.provider}:${profile.providerId}`,
      email: profile.email,
      name: profile.name,
      avatar: profile.avatar,
      provider: profile.provider,
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  verifyToken(token: string): Record<string, any> | null {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}
