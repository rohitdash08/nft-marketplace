export interface OAuthProfile {
  provider: "google" | "github" | "apple";
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface OAuthProvider {
  readonly name: OAuthProfile["provider"];
  getAuthorizationUrl(state: string): string;
  exchangeCode(code: string): Promise<OAuthProfile>;
}
