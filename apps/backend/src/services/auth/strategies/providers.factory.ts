import { Provider } from '@prisma/client';
import { IOAuthStrategy } from './oauth-strategy.interface';
import { GoogleOAuthStrategy } from './google.strategy';
import { GitHubOAuthStrategy } from './github.strategy';
import { AppleOAuthStrategy } from './apple.strategy';

export class ProvidersFactory {
  static loadProvider(provider: Provider): IOAuthStrategy {
    switch (provider) {
      case Provider.GOOGLE:
        return new GoogleOAuthStrategy();
      case Provider.GITHUB:
        return new GitHubOAuthStrategy();
      case Provider.APPLE:
        return new AppleOAuthStrategy();
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}