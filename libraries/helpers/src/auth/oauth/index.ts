import { AppleOAuth } from "./apple.oauth";
import { GithubOAuth } from "./github.oauth";
import { GoogleOAuth } from "./google.oauth";
import type { OAuthProvider } from "./types";

const providers: Record<string, OAuthProvider> = {
  google: new GoogleOAuth(),
  github: new GithubOAuth(),
  apple: new AppleOAuth(),
};

export function getOAuthProvider(name: string): OAuthProvider {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Unknown OAuth provider: ${name}`);
  }
  return provider;
}

export * from "./types";
