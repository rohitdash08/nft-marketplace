import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Google ──
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const { accessToken } = await this.authService.validateOAuthLogin(req.user);
    this.redirectWithToken(res, accessToken);
  }

  // ── GitHub ──
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req: any, @Res() res: Response) {
    const { accessToken } = await this.authService.validateOAuthLogin(req.user);
    this.redirectWithToken(res, accessToken);
  }

  // ── Apple ──
  @Get('apple')
  @UseGuards(AuthGuard('apple'))
  async appleAuth() {}

  @Get('apple/callback')
  @UseGuards(AuthGuard('apple'))
  async appleCallback(@Req() req: any, @Res() res: Response) {
    const { accessToken } = await this.authService.validateOAuthLogin(req.user);
    this.redirectWithToken(res, accessToken);
  }

  // ── Me ──
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: any) {
    return req.user;
  }

  private redirectWithToken(res: Response, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }
}
