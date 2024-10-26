import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

@Global()
@Module({
  imports: [DatabaseModule, ApiModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JWTAuthGuard,
    },
  ],
  //   exports: [DatabaseModule, ApiModule],
  get exports() {
    return [...this.imports];
  },
})
export class AppModule {}
