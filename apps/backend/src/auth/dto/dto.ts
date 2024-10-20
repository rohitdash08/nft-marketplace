
export class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
  }
  
  
  export class RefreshTokenDto {
    userId: number;
    refreshToken: string;
  }
  
  
  export class SocialLoginDto {
    token: string;
  }
  
  
  export class GithubLoginDto {
    code: string;
  }