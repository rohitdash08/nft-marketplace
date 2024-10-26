import { Global, Module } from '@nestjs/common';
import { PrismaRepository, PrismaService } from './prisma.service';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { NotificationService } from './notifications/notifications.service';
import { NotificationRepository } from './notifications/notifications.repository';
import { NFTsService } from './nfts/nfts.service';
import { NFTsRepository } from './nfts/nfts.repository';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    PrismaRepository,
    UsersService,
    UsersRepository,
    NotificationService,
    NotificationRepository,
  ],
  get exports() {
    return this.providers;
  },
})
export class DatabaseModule {}
