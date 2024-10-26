import { Injectable } from '@nestjs/common';
import { Provider, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private _userService: UserService,
    // private _providerService: ProviderService,
    private _notificationService: NotificationService,
    private _emailService: EmailService
  ) {}

  async routeAuth(provider: Provider, body: CreateUserDto | LoginUserDto) {
    if (provider === Provider.LOCAL) {
      const user = await this._userService.getUserByEmail(body.email);

      if (body instanceof CreateUserDto) {
        if (user) {
          throw new Error('Email already exists');
        }

        const newUser = await this._userService.createUser({
          email: body.email,
          password: body.password,
          role: body.role || 'USER',
          provider: Provider.LOCAL,
        });

        const jwt = await this.jwt(newUser);
        await this._emailService.sendEmail(
          body.email,
          'Activate your account',
          `Click <a href="${process.env.FRONTEND_URL}/auth/activate/${jwt}">Here</a> to activate your account`
        );

        return { jwt };
      }

      if (!user || !AuthChecker.comparePasswrod(body.password, user.password)) {
        throw new Error('Invalid username or password');
      }

      if (!user.activated) {
        throw new Error('User is not activated');
      }

      return { jwt: await this.jwt(user) };
    }

    const user = await this.LoginOrRegisterProvider(
      provider,
      body as CreateUserDto
    );

    return { jwt: await this.jwt(user) };
  }

  private async LoginOrRegisterProvider(
    provider: Provider,
    body: CreateUserDto
  ) {
    const providerInstance = ProvidersFactory.loadProvider(provider);
    const providerUser = await providerInstance.getUser(body.ProviderToken);

    if (!providerUser) {
      throw new Error('Invalid provider token');
    }

    const user = await this._userService.getUserByProvider(
      providerUser.id,
      provider
    );

    if (user) {
      return user;
    }

    const newUser = await this._userService.createUser({
      email: providerUser.email,
      password: '',
      role: 'USER',
      provider,
      providerId: providerUser.id,
      activated: true,
    });

    await NewsLetterService.register(providerUser.email);

    return newUser;
  }

  async forgot(email: string) {
    const user = await this._userService.getUserByEmail(email);
    if (!user || user.providerName !== Provider.LOCAL) {
      return false;
    }

    const resetValues = AuthChecker.signJWT({
      id: user.id,
      expires: dayjs().add(20, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
    });

    await this._notificationService.sendEmail(
      user.email,
      'Reset your password',
      `You have requested to reset your password. <br/> Click <a href="${process.env.FRONTEND_URL}/auth/forgot/${resetValues}">here</a> to reset your password <br/> The link will expire in 20 minutes`
    );
  }

  async forgotReturn(body: ForgotReturnPasswordDto) {
    const user = AuthChecker.verifyJWT(body.token) as {
      id: string;
      expires: string;
    };

    if (dayjs().isAfter(dayjs(user.expires))) {
      return false;
    }

    return this._userService.updateUserPassword(user.id, body.password);
  }

  async activate(code: string) {
    const user = AuthChecker.verifyJWT(code) as {
      id: string;
      activated: boolean;
      email: string;
    };
    if (user.id && !user.activated) {
      const getUserAgain = await this._userService.getUserByEmail(user.email);
      if (getUserAgain.activated) {
        return false;
      }

      await this._userService.activateUser(user.id);
      user.activated = true;
      await NewsletterService.register(user.email);
      return this.jwt(user as any);
    }

    return false;
  }

  oauthLink(provider: string) {
    const providerInstance = ProvidersFactory.loadProvider(
      provider as Provider
    );
    return providerInstance.generateLink();
  }

  async checkExists(provider: string, code: string) {
    const providerInstance = ProvidersFactory.loadProvider(
      provider as Provider
    );

    const token = await providerInstance.getToken(code);
    const user = await this._userService.getUser(token);

    if (!user) {
      throw new Error('Invalid user');
    }

    const checkExists = await this._userService.getUserByProvider(
      user.id,
      provider as Provider
    );

    if (checkExists) {
      return { jwt: await this.jwt(checkExists) };
    }

    return { token };
  }

  private async jwt(user: User) {
    return AuthChecker.signJWT(user);
  }
}
