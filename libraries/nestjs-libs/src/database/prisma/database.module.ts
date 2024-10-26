import { Global, Module } from '@nestjs/common';
import { PrismaRepository, PrismaService } from './prisma.service';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsRepository } from './notifications/notifications.repository';
import { NFTsService } from './nfts/nfts.service';
import { NFTsRepository } from './nfts/nfts.repository';

@Global()
@Module({
  imports: [],
  controller: [],
  providers: [
    PrismaService,
    PrismaRepository,
    UsersService,
    UsersRepository,
    NotificationsService,
    NotificationsRepository,
  ],
  get exports() {
    return this.providers;
  },
})
export class DatabaseModule {}
