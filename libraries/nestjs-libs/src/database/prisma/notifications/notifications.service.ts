import { Injectable } from '@nestjs/common';
import { EmailService } from '@nft-marketplace/nestjs-libs/services/email.service';
import { NotificationRepository } from '@nft-marketplace/nestjs-libs/database/prisma/notifications/notifications.repository';

@Injectable()
export class NotificationService {
  constructor(
    private _notificationRepository: NotificationRepository,
    private _emailService: EmailService
  ) {}

  // Get notification count for the user's main page
  async getMainPageCount(userId: string) {
    return this._notificationRepository.getMainPageCount(userId);
  }

  // Get all notifications for the user
  async getNotifications(userId: string) {
    return this._notificationRepository.getNotifications(userId);
  }

  // Send in-app notifications with an optional email notification
  async inAppNotifications(
    userId: string,
    subject: string,
    message: string,
    sendEmail = false
  ) {
    await this._notificationRepository.createNotification(userId, message);

    if (sendEmail) {
      const user = await this._notificationRepository.getUserById(userId);

      if (user?.email) {
        await this._emailService.sendEmail(user.email, subject, message);
      }
    }
  }

  // Check if email provider is configured
  hasEmailProvider() {
    return this._emailService.hasProvider();
  }
}
