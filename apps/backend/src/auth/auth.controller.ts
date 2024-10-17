import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('google')
  async googleAuth(@Body('token') token: string) {
    try {
      return await this.authService.googleLogin(token);
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('github')
  async githubAuth(@Body('code') code: string) {
    try {
      return await this.authService.githubLogin(code);
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('apple')
  async appleAuth(@Body('token') token: string) {
    try {
      return await this.authService.appleLogin(token);
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}