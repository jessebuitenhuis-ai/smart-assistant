import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '@smart-assistant/prisma';
import { UserController } from './users/user.controller';
import { UserService } from './users/user.service';
import { ThreadController } from './threads/thread.controller';
import { ThreadService } from './threads/thread.service';
import { MessageController } from './messages/message.controller';
import { MessageService } from './messages/message.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
  ],
  controllers: [AppController, UserController, ThreadController, MessageController],
  providers: [AppService, UserService, ThreadService, MessageService],
})
export class AppModule {}
