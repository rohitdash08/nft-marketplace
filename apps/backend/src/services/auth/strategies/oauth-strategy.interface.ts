export interface IOAuthUser {
  id: string;
  email: string;
  username?: string;
  picture?: string;
  name?: string;
  lastName?: string;
}

export interface IOAuthStrategy {
  getUser(token: string): Promise<IOAuthUser>;
  generateLink(): string;
  getToken(code: string): Promise<string>;
}