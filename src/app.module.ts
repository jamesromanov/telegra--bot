import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
// import { Redis } from 'ioredis';
// import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { APP_GUARD } from '@nestjs/core';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot/bot.update';
import { session } from 'telegraf';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    BotModule,
    ConfigModule.forRoot({ isGlobal: true }),
    // ThrottlerModule.forRoot({
    //   throttlers: [{ ttl: 20000, limit: 2 }],
    //   storage: new ThrottlerStorageRedisService(
    //     new Redis({
    //       port: Number(process.env.REDIS_PORT) || 6379,
    //       host: process.env.REDIS_HOST,
    //     }),
    //   ),
    // }),
    TelegrafModule.forRoot({
      middlewares: [session()],
      token:
        process.env.TELEGRAM_BOT_TOKEN ??
        (() => {
          throw new Error('TELEGRAM_BOT_TOKEN is not set!');
        })(),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: process.env.MONGO_URL,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
