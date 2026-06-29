import { Body, Controller, Get, Post, Put, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

import { getCookieUrlFromDomain } from '@nft-marketplace/helpers/subdomain/subdomain';
import { EmailService } from '@nft-marketplace/nestjs-libs/services/email.service';
import { AuthService } from '../../services/auth/auth.service';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private _authService: AuthService,
    private _emailService: EmailService
  ) {}

  @Post('/register')
  async register(
    @Req() req: Request,
    @Body() body: any,
    @Res({ passthrough: true }) response: Response
  ) {
    try {
      const getUserFromCookie = this._authService.getUserFromCookie(
        req?.cookies?.user
      );

      const { jwt, user } = await this._authService.routeAuth(
        body.provider || 'LOCAL',
        body,
        getUserFromCookie
      );

      const activationRequired =
        (body.provider || 'LOCAL') === 'LOCAL' && this._emailService.hasProvider();

      if (activationRequired) {
        response.header('activate', 'true');
        response.status(200).json({ activate: true });
        return;
      }

      response.cookie('auth', jwt, {
        domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      });

      response.status(200).json({
        register: true,
        user,
      });
    } catch (error: any) {
      response.status(400).send(error.message);
    }
  }

  @Post('/login')
  async login(
    @Body() body: any,
    @Res({ passthrough: true }) response: Response
  ) {
    try {
      const { jwt, user } = await this._authService.routeAuth(
        'LOCAL',
        body,
        null
      );

      response.cookie('auth', jwt, {
        domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      });

      response.status(200).json({
        login: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          lastName: user.lastName,
          username: user.username,
          pictureId: user.pictureId,
          bio: user.bio,
          providerName: user.providerName,
          walletAddress: user.walletAddress,
          activated: user.activated,
        },
      });
    } catch (error: any) {
      response.status(401).json({ message: error.message || 'Invalid credentials' });
    }
  }

  @Post('/logout')
  async logout(
    @Res({ passthrough: true }) response: Response
  ) {
    response.clearCookie('auth', {
      domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });
    response.status(200).json({ logout: true });
  }

  @Get('/me')
  async me(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    try {
      const authCookie = req.cookies?.auth;
      if (!authCookie) {
        throw new UnauthorizedException('Not authenticated');
      }

      const user = await this._authService.getUserFromCookie(authCookie);
      if (!user) {
        throw new UnauthorizedException('Invalid session');
      }

      response.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          lastName: user.lastName,
          username: user.username,
          pictureId: user.pictureId,
          bio: user.bio,
          providerName: user.providerName,
          walletAddress: user.walletAddress,
          activated: user.activated,
        },
      });
    } catch (error: any) {
      response.status(401).json({ message: error.message || 'Not authenticated' });
    }
  }

  @Put('/profile')
  async updateProfile(
    @Req() req: Request,
    @Body() body: any,
    @Res({ passthrough: true }) response: Response
  ) {
    try {
      const authCookie = req.cookies?.auth;
      if (!authCookie) {
        throw new UnauthorizedException('Not authenticated');
      }

      const user = await this._authService.getUserFromCookie(authCookie);
      if (!user) {
        throw new UnauthorizedException('Invalid session');
      }

      const updatedUser = await this._authService.updateUserProfile(user.id, body);

      response.status(200).json({
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          lastName: updatedUser.lastName,
          username: updatedUser.username,
          pictureId: updatedUser.pictureId,
          bio: updatedUser.bio,
          providerName: updatedUser.providerName,
          walletAddress: updatedUser.walletAddress,
          activated: updatedUser.activated,
        },
      });
    } catch (error: any) {
      response.status(400).json({ message: error.message || 'Profile update failed' });
    }
  }
}
