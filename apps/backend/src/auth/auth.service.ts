import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async googleLogin(token: string) {
    const googleUser = await this.verifyGoogleToken(token);
    // Here, you would typically check if the user exists in your database
    // If not, create a new user
    // For simplicity, we'll just return a JWT token
    return this.login(googleUser);
  }

  async githubLogin(code: string) {
    const githubUser = await this.getGithubUser(code);
    // Here, you would typically check if the user exists in your database
    // If not, create a new user
    // For simplicity, we'll just return a JWT token
    return this.login(githubUser);
  }

  async appleLogin(token: string) {
    const appleUser = await this.verifyAppleToken(token);
    // Here, you would typically check if the user exists in your database
    // If not, create a new user
    // For simplicity, we'll just return a JWT token
    return this.login(appleUser);
  }

  private async verifyGoogleToken(token: string) {
    const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
    return response.data;
  }

  private async getGithubUser(code: string) {
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, {
      headers: { Accept: 'application/json' },
    });

    const accessToken = tokenResponse.data.access_token;
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return userResponse.data;
  }

  private async verifyAppleToken(token: string) {
    // In a real-world scenario, you'd need to verify the token with Apple's public key
    // For simplicity, we'll assume the token is valid and contains the user info
    const decodedToken = this.jwtService.decode(token);
    return {
      id: decodedToken['sub'],
      email: decodedToken['email'],
    };
  }
 private login(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}