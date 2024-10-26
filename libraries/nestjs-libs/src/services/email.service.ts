import { Injectable } from '@nestjs/common';
import { EmailInterface } from '@nft-marketplace/nestjs-libs/emails/email.interface';
import { EmptyProvider } from '@nft-marketplace/nestjs-libs/emails/empty.provider';
import { ResendProvider } from '@nft-marketplace/nestjs-libs/emails/resend.provider';
import { NodeMailerProvider } from '@nft-marketplace/nestjs-libs/emails/node.mailer.provider';

@Injectable()
export class EmailService {
  emailService: EmailInterface;
  constructor() {
    this.emailService = this.selectProvider(process.env.EMAIL_PROVIDER!);
    console.log('Email service provider:', this.emailService.name);

    for (const key of this.emailService.validateEnvKeys) {
      if (!process.env[key]) {
        console.error(`Missing Env: ${key}`);
      }
    }
  }

  hasProvider() {
    return !(this.emailService instanceof EmptyProvider);
  }

  selectProvider(provider: string) {
    switch (provider) {
      case 'resend':
        return new ResendProvider();
      case 'nodemailer':
        return new NodeMailerProvider();
      default:
        return new EmptyProvider();
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!process.env.EMAIL_FROM_ADDRESS || !process.env.EMAIL_FROM_NAME) {
      console.log(
        'Email sender information not found in environment variables'
      );
      return;
    }

    const sends = await this.emailService.sendEmail(
      to,
      subject,
      html,
      process.env.EMAIL_FROM_NAME,
      process.env.EMAIL_FROM_ADDRESS
    );
    console.log(sends);
  }
}
