import { IsEnum, IsString, Length, Matches, validate } from 'class-validator';
import { BotContext } from '../bot.update';
import { plainToInstance } from 'class-transformer';
import { Weekdays } from '../weekday.enum';

export class NameDto {
  @IsString()
  @Matches(/^[^\d]*$/, {
    message: '⛔️Ism raqamlardan iborat bolishi mumkin emas!',
  })
  @Length(5, 50, {
    message: '⛔️Ism kamida 5 ta beldigan iborat bolishi kerak!',
  })
  fullName: string;
}
export class AddressDto {
  @IsString()
  @Length(5, 100, {
    message: '⛔️Manzil kamida 5 ta belgidan iborat bolishi kerak!',
  })
  address: string;
}
export class TimeDto {
  @Matches(/^\d{2}:\d{2}$/, {
    message: '⛔️Vaqt 00:00 formatida bolishi kerak!',
  })
  time: string;
}
export class WeekdayDto {
  @IsString()
  @IsEnum(Weekdays)
  weekday: WeekdayDto;
}

export async function validateAndReply<T extends object>(
  dtoClass: new () => T,
  value: object,
  ctx: BotContext,
): Promise<boolean> {
  const dto = plainToInstance(dtoClass, value);
  const errors = await validate(dto);
  if (errors.length > 0) {
    const cons = errors[0].constraints;
    if (cons) {
      const fristError = Object.values(cons)[0];
      const message = fristError;
      await ctx.reply(message);
      return false;
    }
  }
  return true;
}
