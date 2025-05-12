import { Command, Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { SessionMeeting } from './bot.session';

type BotContext = Context & {
  session: SessionMeeting;
};

@Update()
export class BotUpdate {
  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.replyWithPhoto(
      'https://i.ytimg.com/vi/NYLAozGiDvw/maxresdefault.jpg',
    );
    await ctx.react('⚡');
    await ctx.reply('Assalomu alaikum botga xush kelibsiz!');
  }
  @Command('menu')
  async showMenu(@Ctx() ctx: BotContext) {
    await ctx.reply(
      'Hizmat Tanlang:',
      Markup.keyboard([
        '📅 Yangi uchrashuv',
        '🗓 Uchrashuvlarim',
        '📞 Bog‘lanish',
      ]).oneTime(),
    );
  }
  @Hears('📅 Yangi uchrashuv')
  async saveName(@Ctx() ctx: BotContext) {
    ctx.session.step = 'WAITING_FOR_NAME';
    await ctx.reply(
      "Yangi uchrashuv jarayani boshlandi. Iltimos, to'liq ismingizni kiriting:",
    );
  }
  // @Hears('📅 Yangi uchrashuv')
  // async (@Ctx() ctx: BotContext) {
  //   ctx.session.step = 'WAITING_FOR_NAME';
  //   await ctx.reply(
  //     "Yangi uchrashuv jarayani boshlandi. Iltimos, to'liq ismingizni kiriting:",
  //   );
  // }
  // @Hears('📅 Yangi uchrashuv')
  // async handleNewMeeting(@Ctx() ctx: BotContext) {
  //   ctx.session.step = 'WAITING_FOR_NAME';
  //   await ctx.reply(
  //     "Yangi uchrashuv jarayani boshlandi. Iltimos, to'liq ismingizni kiriting:",
  //   );
  // }
  @Hears('/.*/')
  async getInfoMeeting(@Ctx() ctx: BotContext) {
    if (ctx.message && 'text' in ctx.message) {
      const text = ctx.message.text;

      switch (ctx.session.step) {
        case 'WAITING_FOR_NAME':
          if (!text || text.length < 3)
            return ctx.reply(
              "⛔️ Ism juda qisqa. Iltimos, to'liq ismingizni kiriting!",
            );
          ctx.session.name = text;
          ctx.session.step = 'WAITING_FOR_ADDRESS';
          return ctx.reply("📍 Uchrashuv bo'lib o'tadigan manzilni kiriting");
        case 'WAITING_FOR_ADDRESS':
          if (!text || text.length < 5)
            return "⛔️ Manzil juda qisqa. Iltimos, to'liq manzilni kiriting!";
          ctx.session.address = text;
          ctx.session.step = 'WAITING_FOR_WEEKDAY';
        case 'WAITING_FOR_WEEKDAY':
          await ctx.reply(
            'Xafta kunini tanlang:',
            Markup.keyboard([
              'Dushanba',
              'Seshanba',
              'Chorshanba',
              'Juma',
              'Shanba',
            ]).oneTime(),
          );
          if (text)
            return ctx.reply('⛔️ xato manzil kiritildi menudan tanlang!');
      }
    }
    await ctx.reply('got your message haik');
  }
}
