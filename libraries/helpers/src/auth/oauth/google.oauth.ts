import axios from "axios";
import type { OAuthProfile, OAuthProvider } from "./types";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v3/userinfo";

export class GoogleOAuth implements OAuthProvider {
  readonly name = "google" as const;

  private clientId = process.env.GOOGLE_CLIENT_ID || "";
  private clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  private redirectUri = `${process.env.API_URL || "http://localhost:3000"}/api/auth/google/callback`;

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "online",
      prompt: "select_account",
    });
    return `${GOOGLE_AUTH}?${params}`;
  }

  async exchangeCode(code: string): Promise<OAuthProfile> {
    const tokenRes = await axios.post(
      GOOGLE_TOKEN,
      new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const accessToken = tokenRes.data.access_token as string;
    const userRes = await axios.get(GOOGLE_USERINFO, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      provider: "google",
      providerId: String(userRes.data.sub),
      email: userRes.data.email || "",
      name: userRes.data.name || userRes.data.email || "Google User",
      avatar: userRes.data.picture,
    };
  }
}
