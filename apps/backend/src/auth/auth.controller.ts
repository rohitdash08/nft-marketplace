import { Controller, Post, Body, UnauthorizedException, UseGuards, Get, Req, Res,Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from './user.decorator';
import { AuthResponseDto, RefreshTokenDto, SocialLoginDto, GithubLoginDto } from './dto/dto';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google')
  async googleLogin(@Body('token') token: string, @Res() res: Response) {
    console.log('Google login hit, token:', token);  
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const authResult = await this.authService.googleLogin(token);
    this.setTokens(res, authResult);
    return res.send(authResult);
  }
  
  @Get('github/callback')
  async githubCallback(@Query('code') code: string, @Res() res: Response) {
    console.log('Received GitHub callback with code:', code);
    if (!code) {
      throw new UnauthorizedException('No code provided');
    }
    const authResult = await this.authService.githubLogin(code);
    this.setTokens(res, authResult);
    
    // Redirect to your frontend with the access token
    return res.redirect(`${process.env.FRONTEND_URL}/home`);
  }
  
  @Post('apple/callback')
  async appleLogin(@Body('token') token: string, @Res() res: Response) {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const authResult = await this.authService.appleLogin(token);
    this.setTokens(res, authResult);
    return res.send(authResult);
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as JwtPayload;
    
      if (typeof decoded === 'string' || !decoded.sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }
  
      const userId = typeof decoded.sub === 'number' ? decoded.sub : parseInt(decoded.sub, 10);
  
      if (isNaN(userId)) {
        throw new UnauthorizedException('Invalid user ID in refresh token');
      }
  
      const authResult = await this.authService.refreshTokens(userId, refreshToken);
      this.setTokens(res, authResult);
      return res.send(authResult);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    try {
      // Decode the refresh token to get the userId
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as { userId: number };
      const userId = decoded.userId;
  
      await this.authService.logout(userId, refreshToken);
      res.clearCookie('refreshToken');
      return res.sendStatus(200);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@User() user) {
    return user;
  }

  private setTokens(res: Response, authResult: AuthResponseDto) {
    res.cookie('refreshToken', authResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // Remove refreshToken from the response body
    const { refreshToken, ...responseWithoutRefreshToken } = authResult;
    return responseWithoutRefreshToken;
  }
}