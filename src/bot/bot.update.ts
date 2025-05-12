import {
  Action,
  Command,
  Ctx,
  Hears,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
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
    await ctx.reply(
      'Hizmat Tanlang:',
      Markup.keyboard([
        '📅 Yangi uchrashuv',
        '🗓 Uchrashuvlarim',
        '📞 Bog‘lanish',
      ])
        .oneTime()
        .resize(),
    );
  }
  @Hears('📅 Yangi uchrashuv')
  async saveName(@Ctx() ctx: BotContext) {
    ctx.session.step = 'WAITING_FOR_NAME';
    await ctx.reply(
      "Yangi uchrashuv jarayani boshlandi. Iltimos, to'liq ismingizni kiriting, misol uchun: Kimdir Kimdir:",
    );
  }
  @Hears(/.*/)
  async getInfoMeeting(@Ctx() ctx: BotContext) {
    if (ctx.message && 'text' in ctx.message) {
      const text = ctx.message.text;
      switch (ctx.session.step) {
        case 'WAITING_FOR_NAME':
          if (!text || text.length < 5 || text.split(' ').length < 2) {
            ctx.reply(
              "⛔️ Ism juda qisqa. Iltimos, to'liq ismingizni kiriting!",
            );
            return;
          }
          ctx.session.name = text;
          ctx.session.step = 'WAITING_FOR_ADDRESS';
          ctx.reply(
            "📍 Uchrashuv bo'lib o'tadigan manzilni kiriting, misol uchun: Toshkent, chilanzar 5",
          );
          return;
        case 'WAITING_FOR_ADDRESS':
          if (!text || text.length < 5)
            return "⛔️ Manzil juda qisqa. Iltimos, to'liq manzilni kiriting!";
          ctx.session.address = text;
          ctx.session.step = 'WAITING_FOR_HOUR';
          await ctx.reply('⏳ Vaqtni kiriting:');
          return;
        case 'WAITING_FOR_HOUR':
          if (!text || text.length < 5 || text.length > 5) {
            ctx.reply(
              '⛔️ Xato vatq kiritildi!. Iltimos vaqt 00:00 formatida bolsin!',
            );
            return;
          }
          ctx.session.step = 'WAITING_FOR_WEEKDAY';
          ctx.session.time = text;
          await ctx.reply(
            '📅 Hafta kunini tanlang!, misol uchun Dushanba:',
            Markup.keyboard([
              'Dushanba',
              'Seshanba',
              'Chorshanba',
              'Juma',
              'Shanba',
            ]).oneTime(),
          );
          return;
        case 'WAITING_FOR_WEEKDAY':
          if (
            !text ||
            !['Dushanba', 'Seshanba', 'Chorshanba', 'Juma', 'Shanba'].includes(
              text,
            )
          ) {
            ctx.reply(
              '⛔️ xato manzil kiritildi menudan tanlang!',

              Markup.keyboard([
                'Dushanba',
                'Seshanba',
                'Chorshanba',
                'Juma',
                'Shanba',
              ]).oneTime(),
            );
            return;
          }
          ctx.session.step = 'DONE';
          ctx.session.weekday = text;
          ctx.reply(
            `✅ Yangi uchrashuv saqlandi:\n\n 👤 Ism: ${ctx.session.name}\n 📍Manzil: ${ctx.session.address}\n 📅Hafta kuni: ${ctx.session.weekday}\n ⏳Soat: ${ctx.session.time} `,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '➕ Yana qo‘shish', callback_data: 'new_meeting' },
                    { text: '❌ Bekor qilish', callback_data: 'cancel' },
                    { text: '✅ Tasdiqlash', callback_data: 'confirm' },
                  ],
                ],
              },
            },
            // could have deleted that but this is gonna stay here as a reminder for the next projects!
            // Markup.inlineKeyboard([
            //   [{ text: '➕ Yana qo‘shish', callback_data: 'new_meeting' }],
            //   [{ text: '❌ Bekor qilish', callback_data: 'cancel' }],
            //   [{ text: '✅ Tasdiqlash', callback_data: 'confirm' }],
            // ]),
          );
          return;

        default:
          ctx.reply('Iltimos /start yoki 📅 Yangi uchrashuv tugmasini bosing!');
          return;
      }
    }
  }
  @Action('new_meeting')
  async addInfo(@Ctx() ctx: BotContext) {
    ctx.session = {};
    ctx.session.step = 'WAITING_FOR_NAME';
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.reply('Yangi uchrashuv:\n 👤 Iltimos, ismingizni kiriting:');
  }
  @Action('cancel')
  async cancelMeeting(@Ctx() ctx: BotContext) {
    ctx.session = {};
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.reply('❌ Uchrashuv bekor qilindi!');
  }
  @Action('confirm')
  async confirmMeeting(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    await ctx.reply('✅ Uchrashuv muvaffaqiyatli saqlandi!');
  }
}
