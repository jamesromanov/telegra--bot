import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Bot {
  @Prop()
  fullname: string;
  @Prop()
  address: string;
  @Prop()
  chatId: number;
  @Prop()
  time: string;
  @Prop()
  weekday: string;
  @Prop()
  createdAt: Date;
}

export const BotSchema = SchemaFactory.createForClass(Bot);
