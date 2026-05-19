import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Provider } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsEnum(Provider)
  provider: Provider;

  @IsString()
  @IsOptional()
  ProviderToken?: string;
}

export class LoginUserDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsEnum(Provider)
  provider: Provider;

  @IsString()
  @IsOptional()
  ProviderToken?: string;
}

export class OAuthCallbackDto {
  @IsString()
  code: string;

  @IsEnum(Provider)
  provider: Provider;
}

export class ForgotReturnPasswordDto {
  @IsString()
  token: string;

  @IsString()
  password: string;
}