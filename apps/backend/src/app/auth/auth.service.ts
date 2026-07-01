import { Injectable } from "@nestjs/common";
import { Provider, User } from "@prisma/client";
import { AuthService as JwtHelper } from "@nft-marketplace/helpers/auth/auth.service";
import {
  getOAuthProvider,
  OAuthProfile,
} from "@nft-marketplace/helpers/auth/oauth";
import { UsersService } from "@nft-marketplace/nestjs-libs/database/prisma/users/users.service";

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  getAuthorizationUrl(providerName: string, state: string): string {
    return getOAuthProvider(providerName).getAuthorizationUrl(state);
  }

  async handleCallback(providerName: string, code: string): Promise<string> {
    const provider = getOAuthProvider(providerName);
    const profile = await provider.exchangeCode(code);
    const user = await this.findOrCreateUser(profile);
    return JwtHelper.signJWT(
      {
        id: user.id,
        email: user.email,
        provider: profile.provider,
      },
      "7d",
    );
  }

  private async findOrCreateUser(profile: OAuthProfile): Promise<User> {
    const prismaProvider = profile.provider.toUpperCase() as Provider;
    const existing = await this.usersService.getUserByProvider(
      profile.providerId,
      prismaProvider,
    );
    if (existing) {
      return existing;
    }

    return this.usersService.createUser({
      email: profile.email || `${profile.providerId}@${profile.provider}.oauth`,
      password: "",
      provider: prismaProvider,
      providerId: profile.providerId,
      name: profile.name,
      activated: true,
    });
  }
}
