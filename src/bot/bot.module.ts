import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { MongooseModule } from '@nestjs/mongoose';
import { Bot, BotSchema } from './entities/bot.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Bot.name, schema: BotSchema }])],
  providers: [BotUpdate],
})
export class BotModule {}
