import axios from "axios";
import crypto from "crypto";
import type { OAuthProfile, OAuthProvider } from "./types";

const APPLE_AUTH = "https://appleid.apple.com/auth/authorize";
const APPLE_TOKEN = "https://appleid.apple.com/auth/token";

function base64Url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64url");
}

function buildAppleClientSecret(): string {
  const teamId = process.env.APPLE_TEAM_ID || "";
  const clientId = process.env.APPLE_CLIENT_ID || "";
  const keyId = process.env.APPLE_KEY_ID || "";
  const keyPem = process.env.APPLE_PRIVATE_KEY || "";

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", kid: keyId };
  const payload = {
    iss: teamId,
    iat: now,
    exp: now + 60 * 60 * 24 * 180,
    aud: "https://appleid.apple.com",
    sub: clientId,
  };

  const signingInput = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const key = crypto.createPrivateKey(keyPem.replace(/\\n/g, "\n"));
  const signature = crypto.sign("sha256", Buffer.from(signingInput), {
    key,
    dsaEncoding: "ieee-p1363",
  });
  return `${signingInput}.${base64Url(signature)}`;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split(".");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}

export class AppleOAuth implements OAuthProvider {
  readonly name = "apple" as const;

  private clientId = process.env.APPLE_CLIENT_ID || "";
  private redirectUri = `${process.env.API_URL || "http://localhost:3000"}/api/auth/apple/callback`;

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: "code",
      response_mode: "query",
      scope: "name email",
      state,
    });
    return `${APPLE_AUTH}?${params}`;
  }

  async exchangeCode(code: string): Promise<OAuthProfile> {
    const clientSecret = buildAppleClientSecret();
    const tokenRes = await axios.post(
      APPLE_TOKEN,
      new URLSearchParams({
        client_id: this.clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: this.redirectUri,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const idToken = tokenRes.data.id_token as string;
    const claims = decodeJwtPayload(idToken);

    return {
      provider: "apple",
      providerId: String(claims.sub),
      email: (claims.email as string) || "",
      name: "Apple User",
    };
  }
}
