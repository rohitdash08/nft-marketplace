export type OAuthProviderName = "google" | "github" | "apple";

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes?: string[];
}

export interface NormalizedOAuthProfile {
  provider: OAuthProviderName;
  providerUserId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
}

const ENDPOINTS: Record<
  OAuthProviderName,
  { authUrl: string; tokenUrl: string; defaultScopes: string[] }
> = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    defaultScopes: ["openid", "email", "profile"],
  },
  github: {
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    defaultScopes: ["read:user", "user:email"],
  },
  apple: {
    authUrl: "https://appleid.apple.com/auth/authorize",
    tokenUrl: "https://appleid.apple.com/auth/token",
    defaultScopes: ["name", "email"],
  },
};

export function buildAuthorizationUrl(
  provider: OAuthProviderName,
  config: OAuthProviderConfig,
  state: string
): string {
  const spec = ENDPOINTS[provider];
  const scopes = (config.scopes ?? spec.defaultScopes).join(" ");
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: scopes,
    state,
  });
  if (provider === "apple") {
    params.set("response_mode", "form_post");
  }
  return `${spec.authUrl}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  provider: OAuthProviderName,
  config: OAuthProviderConfig,
  code: string
): Promise<Record<string, unknown>> {
  const spec = ENDPOINTS[provider];
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
  });

  const response = await fetch(spec.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`${provider} token exchange failed (${response.status})`);
  }
  return (await response.json()) as Record<string, unknown>;
}
