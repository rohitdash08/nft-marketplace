import { GoogleProvider, IProvider } from './google.provider';
import { GithubProvider } from './github.provider';
import { AppleProvider } from './apple.provider';

export class ProvidersFactory {
  private static providers: Map<string, IProvider> = new Map([
    ['GOOGLE', new GoogleProvider()],
    ['GITHUB', new GithubProvider()],
    ['APPLE', new AppleProvider()],
  ]);

  static loadProvider(provider: string): IProvider {
    const impl = this.providers.get(provider);
    if (!impl) {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    return impl;
  }

  static register(provider: string, impl: IProvider): void {
    this.providers.set(provider, impl);
  }
}
