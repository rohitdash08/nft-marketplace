import { Module } from '@nestjs/common';
import { AuthController } from './routes/auth.controller';

@Module({
  controllers: [AuthController],
})
export class ApiModule {}
