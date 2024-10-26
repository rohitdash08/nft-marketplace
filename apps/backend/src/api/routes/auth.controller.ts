import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { getCookieUrlFromDomain } from '@nft-marketplace/helpers/subdomain/subdomain';
import { EmailService } from '@nft-marketplace/nestjs-libs/services/email.service';

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
    @Body() body: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    try {
      const getUserFromCookie = this._authService.getUserFromCookie(
        req?.cookies?.user
      );

      const { jwt, user } = await this._authService.routeAuth(
        body.provider,
        body,
        getUserFromCookie
      );

      const activationRequired =
        body.provider === 'LOCAL' && this._emailService.hasProvider();

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

      if (typeof addedUser !== 'boolean' && addedUser?.userAuthId) {
        response.cookie('showorg', addedUser.userAuthId, {
          domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
          secure: true,
          httpOnly: true,
          sameSite: 'none',
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        });
      }

      response.headers('onboard', true);
      response.status(200).json({
        register: true,
      });
    } catch (error) {
      response.status(400).send(error.message);
    }
  }
}
