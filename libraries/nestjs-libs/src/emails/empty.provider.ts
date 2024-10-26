import { EmailInterface } from './email.interface';

export class EmptyProvider implements EmailInterface {
  name = 'no provider';
  validateEnvKeys: string[];
  async sendEmail(to: string, subject: string, html: string) {
    return `No email provider found, email was supposed to be send to ${to} with subject ${subject} and html ${html}`;
  }
}
