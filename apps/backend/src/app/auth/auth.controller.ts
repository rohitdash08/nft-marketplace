import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { Response } from "express";
import crypto from "crypto";
import { AuthService } from "./auth.service";

const VALID_PROVIDERS = new Set(["google", "github", "apple"]);

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get(":provider")
  startOAuth(
    @Param("provider") provider: string,
    @Res() res: Response,
  ): void {
    if (!VALID_PROVIDERS.has(provider)) {
      res.status(400).send("Unknown provider");
      return;
    }
    const state = crypto.randomBytes(16).toString("hex");
    res.cookie("oauth_state", state, { httpOnly: true, sameSite: "lax" });
    res.redirect(this.authService.getAuthorizationUrl(provider, state));
  }

  @Get(":provider/callback")
  async oauthCallback(
    @Param("provider") provider: string,
    @Query("code") code: string,
    @Query("state") state: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!VALID_PROVIDERS.has(provider) || !code) {
      res.status(400).send("Invalid OAuth callback");
      return;
    }

    const token = await this.authService.handleCallback(provider, code);
    const frontend = process.env.FRONTEND_URL || "http://localhost:4200";
    res.redirect(`${frontend}/auth/callback?token=${encodeURIComponent(token)}`);
  }
}
