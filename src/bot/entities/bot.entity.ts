import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Bot {
  @Prop()
  fullName: string;
  @Prop()
  address: string;
  @Prop()
  userId: number;
  @Prop()
  time: string;
  @Prop()
  weekday: string;
  @Prop()
  createdAt: Date;
}

export const BotSchema = SchemaFactory.createForClass(Bot);
