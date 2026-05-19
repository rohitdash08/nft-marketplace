import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { getCookieUrlFromDomain } from '@nft-marketplace/helpers/subdomain/subdomain';
import { AuthService } from '../../services/auth/auth.service';
import { EmailService } from '@nft-marketplace/nestjs-libs/services/email.service';
import { CreateUserDto } from '../dtos/auth.dto';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly _authService: AuthService,
    private readonly _emailService: EmailService
  ) {}

  @Post('/register')
  async register(
    @Req() req: any,
    @Body() body: CreateUserDto,
    @Res() res: any
  ) {
    try {
      const cookies = req.cookies || {};
      const { jwt } = await this._authService.routeAuth(
        body.provider,
        body
      );

      const activationRequired =
        body.provider === 'LOCAL' && this._emailService.hasProvider();

      if (activationRequired) {
        return res.status(200).json({ activate: true });
      }

      res.cookie('auth', jwt, {
        domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      });

      return res.status(200).json({ register: true });
    } catch (error) {
      return res.status(400).send(error.message);
    }
  }

  // ===========================================
  // OAuth Link Generators (frontend redirects user to these URLs)
  // ===========================================

  @Get('/google/link')
  getGoogleLink() {
    return this._authService.oauthLink('GOOGLE');
  }

  @Get('/github/link')
  getGithubLink() {
    return this._authService.oauthLink('GITHUB');
  }

  @Get('/apple/link')
  getAppleLink() {
    return this._authService.oauthLink('APPLE');
  }

  // ===========================================
  // OAuth Callbacks (called by OAuth provider after user authorizes)
  // ===========================================

  @Get('/google/callback')
  async googleCallback(@Query('code') code: string, @Res() res: any) {
    return this._handleOAuthCallback('GOOGLE', code, res);
  }

  @Get('/github/callback')
  async githubCallback(@Query('code') code: string, @Res() res: any) {
    return this._handleOAuthCallback('GITHUB', code, res);
  }

  @Get('/apple/callback')
  async appleCallback(@Query('code') code: string, @Res() res: any) {
    return this._handleOAuthCallback('APPLE', code, res);
  }

  private async _handleOAuthCallback(provider: string, code: string, res: any) {
    try {
      const result = await this._authService.checkExists(provider, code);

      if (result.jwt) {
        res.cookie('auth', result.jwt, {
          domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
          secure: true,
          httpOnly: true,
          sameSite: 'none',
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        });
        return res.redirect(process.env.FRONTEND_URL + '/dashboard');
      }

      // New user — redirect to frontend with token to complete registration
      return res.redirect(
        process.env.FRONTEND_URL + '/register?token=' + result.token + '&provider=' + provider
      );
    } catch (error) {
      return res.status(400).send(error.message);
    }
  }
}
