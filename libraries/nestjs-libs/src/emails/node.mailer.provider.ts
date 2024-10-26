import nodemailer from 'nodemailer';
import { EmailInterface } from '@nft-marketplace/nestjs-libs/emails/email.interface';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: +process.env.EMAIL_PORT!,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export class NodeMailerProvider implements EmailInterface {
  name = 'nodemailer';
  validateEnvKeys: [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_SECURE',
    'EMAIL_USER',
    'EMAIL_PASS'
  ];

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    emailFromName: string,
    emailFromAddress: string
  ) {
    const sends = await transporter.sendMail({
      from: `${emailFromName} <${emailFromAddress}>`,
      to: to,
      subject: subject,
      text: html,
      html: html,
    });

    return sends;
  }
}
