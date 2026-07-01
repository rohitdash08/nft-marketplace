import axios from "axios";
import type { OAuthProfile, OAuthProvider } from "./types";

const GITHUB_AUTH = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN = "https://github.com/login/oauth/access_token";
const GITHUB_API = "https://api.github.com";

export class GithubOAuth implements OAuthProvider {
  readonly name = "github" as const;

  private clientId = process.env.GITHUB_CLIENT_ID || "";
  private clientSecret = process.env.GITHUB_CLIENT_SECRET || "";
  private redirectUri = `${process.env.API_URL || "http://localhost:3000"}/api/auth/github/callback`;

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: "read:user user:email",
      state,
    });
    return `${GITHUB_AUTH}?${params}`;
  }

  async exchangeCode(code: string): Promise<OAuthProfile> {
    const tokenRes = await axios.post(
      GITHUB_TOKEN,
      {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    const accessToken = tokenRes.data.access_token as string;
    const userRes = await axios.get(`${GITHUB_API}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    let email = userRes.data.email as string | null;
    if (!email) {
      const emailsRes = await axios.get(`${GITHUB_API}/user/emails`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      });
      const primary = (emailsRes.data as Array<{ email: string; primary: boolean }>).find(
        (e) => e.primary,
      );
      email = primary?.email || `${userRes.data.login}@github.local`;
    }

    return {
      provider: "github",
      providerId: String(userRes.data.id),
      email,
      name: userRes.data.name || userRes.data.login,
      avatar: userRes.data.avatar_url,
    };
  }
}
