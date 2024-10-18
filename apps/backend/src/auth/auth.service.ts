import { Injectable, UnauthorizedException ,Inject} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { CustomLogger } from '../logger.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private appleJwksClient: JwksClient;
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private logger: CustomLogger
  ) {
    this.appleJwksClient = new JwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
      cache: true,
      rateLimit: true,
    });
  }

  private generateTokens(user) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = uuidv4();
    
    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    await this.usersService.updateRefreshToken(userId, refreshToken);
  }

  async googleLogin(token: string) {
    try {
      const googleUser = await this.verifyGoogleToken(token);
      const user = await this.usersService.findOrCreate({
        email: googleUser.email,
        name: googleUser.name,
        provider: 'google',
        providerId: googleUser.sub,
      });
      return this.login(user);
    } catch (error) {
      this.logger.error('Google login failed', error.stack);
      throw new UnauthorizedException('Invalid Google token');
    }
  }
  
  // Do the same for githubLogin and appleLogin

  async githubLogin(code: string) {
    try { 
      const githubUser = await this.getGithubUser(code);
      const user = await this.usersService.findOrCreate({
        email: githubUser.email,
        name: githubUser.name,
        provider: 'github',
        providerId: githubUser.id.toString(),
      });
      return this.login(user);
    } catch (error) {
      this.logger.error('GitHub login failed', error.stack);
      throw new UnauthorizedException('Invalid GitHub code');
    }
  }
  

  async appleLogin(token: string) {
    try {
      const appleUser = await this.verifyAppleToken(token);
      const user = await this.usersService.findOrCreate({
        email: appleUser.email,
        name: appleUser.name,
        provider: 'apple',
        providerId: appleUser.sub,
      });
  
      // Log the user in and return the result
      return this.login(user);
  
    } catch (error) {
      this.logger.error(`Apple login failed for token: ${token}`, error.stack);
      throw new UnauthorizedException('Invalid Apple token');
    }
  }

  private async verifyGoogleToken(token: string) {
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/tokeninfo', {
      params: { id_token: token },
    });
    return response.data;
  }

  private async getGithubUser(code: string) {
    try {
      const { data: accessTokenResponse } = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: { Accept: 'application/json' },
        }
      );
  
      // Log the response from GitHub
      console.log('Access Token Response:', accessTokenResponse);
  
      // Handle access token errors
      if (accessTokenResponse.error) {
        this.logger.error('Error retrieving access token from GitHub', accessTokenResponse.error);
        throw new UnauthorizedException('Invalid GitHub code');
      }
  
      const accessToken = accessTokenResponse.access_token;
  
      // Fetch the GitHub user data
      const { data: githubUser } = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
  
      console.log('GitHub User Data:', githubUser); // Log the user data
  
      // Email retrieval
      if (!githubUser.email) {
        const { data: emails } = await axios.get('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        githubUser.email = emails.find(e => e.primary)?.email; // Use optional chaining
      }
  
      return githubUser;
    } catch (error) {
      this.logger.error('Error fetching GitHub user', error.stack);
      throw new UnauthorizedException('Failed to fetch GitHub user');
    }
  }

  private async verifyAppleToken(token: string) {
    try {
      const decodedToken: any = jwt.decode(token, { complete: true });
      if (!decodedToken) {
        throw new Error('Invalid token');
      }

      const kid = decodedToken.header.kid;
      const key = await this.appleJwksClient.getSigningKey(kid);
      const signingKey = key.getPublicKey();

      const payload: any = jwt.verify(token, signingKey, {
        algorithms: ['RS256'],
        audience: this.configService.get('APPLE_CLIENT_ID'),
        issuer: 'https://appleid.apple.com',
      });

      return {
        email: payload.email,
        sub: payload.sub,
        name: payload.name || '', // Apple might not provide the name
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Apple token');
    }
  }

  async login(user) {
    const tokens = this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Invalid refresh token');
  
    if (refreshToken !== user.refreshToken)
      throw new UnauthorizedException('Invalid refresh token');
  
    const tokens = this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    await this.usersService.updateRefreshToken(userId, null);
  }

  private generateJwtToken(user) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}