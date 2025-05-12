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
  createdAt: Date;
}

export const BotSchema = SchemaFactory.createForClass(Bot);
