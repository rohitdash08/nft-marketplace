import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '@nft-marketplace/nestjs-libs/database/prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(
    private _notification: PrismaRepository<'notification'>,
    private _user: PrismaRepository<'user'>
  ) {}

  // Get the last read notification for a user
  async getLastReadNotification(userId: string) {
    const user = await this._user.model.user.findFirst({
      where: { id: userId },
      select: {
        notifications: {
          where: { readAt: { not: null } },
          orderBy: { readAt: 'desc' },
          take: 1,
          select: { readAt: true },
        },
      },
    });
    return user?.notifications?.[0]?.readAt || null;
  }

  // Get the count of new notifications sing the user's last read notification
  async getMainPageCount(userId: string) {
    const lastReadAt = await this.getLastReadNotification(userId);

    return {
      total: await this._notification.model.notification.count({
        where: {
          userId,
          createdAt: lastReadAt ? { gt: lastReadAt } : undefined,
        },
      }),
    };
  }

  // Create a new notification for a user
  async createNotification(userId: string, content: string, link?: string) {
    await this._notification.model.notification.create({
      data: {
        userId,
        content,
        link,
      },
    });
  }

  // Retrieve all notifications for the user, ordered by creation date
  async getNotifications(userId: string) {
    return this._notification.model.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Mark all notifications as read for the user
  async markAllAsRead(userId: string) {
    await this._notification.model.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  // Get user details by user ID
  async getUserById(userId: string) {
    return this._user.model.user.findFirst({
      where: { id: userId },
      select: { email: true },
    });
  }
}
