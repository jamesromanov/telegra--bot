import { Action, Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { SessionMeeting } from './bot.session';
import { InjectModel } from '@nestjs/mongoose';
import { Bot } from './entities/bot.entity';
import { Model } from 'mongoose';
import {
  AddressDto,
  NameDto,
  TimeDto,
  validateAndReply,
  WeekdayDto,
} from './dto/create-bot.dto';
import { BadGatewayException } from '@nestjs/common';
import { showPagination } from './show.pagination';

export type BotContext = Context & {
  session: SessionMeeting;
};

@Update()
export class BotUpdate {
  constructor(@InjectModel(Bot.name) private botModel: Model<Bot>) {}
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
  @Hears('📞 Bog‘lanish')
  async contact(@Ctx() ctx: BotContext) {
    // ctx.session.step = 'WAITING_FOR_CONTACT';
    await ctx.reply(
      'Boglanish uchun telefon raqamingizni qoldiring!',
      Markup.keyboard([Markup.button.contactRequest('Contact ulashish!')])
        .oneTime()
        .resize(),
    );
  }
  @On('contact')
  async receiveContent(@Ctx() ctx: BotContext) {
    const { contact } = { ...ctx?.message } as any;
    if (!contact) return;
    if (!process.env.ADMIN) throw new Error('Couldnt load env variables!');
    await ctx.telegram.sendMessage(
      process.env.ADMIN,
      `👤 Ismi: ${contact.first_name}
📞 Raqami: ${contact.phone_number}`,
    );
    await ctx.reply(
      '✅Sizning raqamingiz muvaffaqyatli yuborildi',
      Markup.removeKeyboard(),
    );
  }
  @Hears('🗓 Uchrashuvlarim')
  async showMeetings(@Ctx() ctx: BotContext) {
    const userId = ctx.from?.id;
    const meetings = await this.botModel.find({ userId });
    console.log(meetings);

    if (!meetings || meetings.length === 0)
      return ctx.reply('🗓 Sizda hech qanday uchrashuvlar mavjud emas!');

    ctx.session.meetingsPage = 0;
    ctx.session.meetings = meetings;

    return showPagination(ctx);
  }
  @Action(['preview', 'next'])
  async pagination(@Ctx() ctx: BotContext) {
    if (ctx.session.meetings?.length) {
      await ctx.answerCbQuery();

      const current = ctx.session.meetingsPage || 0;
      if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
        const action = ctx.callbackQuery?.data;

        if (action === 'preview') {
          ctx.session.meetingsPage = current - 1;
        }
        if (action === 'next') {
          ctx.session.meetingsPage = current + 1;
        }
        return showPagination(ctx);
      }
    }
  }
  @Hears('📅 Yangi uchrashuv')
  async saveName(@Ctx() ctx: BotContext) {
    ctx.session.step = 'WAITING_FOR_NAME';
    await ctx.reply(
      "Yangi uchrashuv jarayani boshlandi.\n<b> 👤 Iltimos,to'liq ismingizni kiriting, misol uchun </b>: Kimdir Kimdir:",
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '❌ Bekor qilish', callback_data: 'cancel' }],
          ],
        },
      },
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
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '❌ Bekor qilish', callback_data: 'cancel' }],
                  ],
                },
              },
            );
            return;
          }
          const validateName = await validateAndReply(
            NameDto,
            { fullName: text },
            ctx,
          );
          if (!validateName) return;
          ctx.session.name = text;
          ctx.session.step = 'WAITING_FOR_ADDRESS';
          ctx.reply(
            "📍 Uchrashuv bo'lib o'tadigan manzilni kiriting, <b>misol uchun</b>: Toshkent, chilanzar 5",
            {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '❌ Bekor qilish', callback_data: 'cancel' }],
                ],
              },
            },
          );
          return;

        case 'WAITING_FOR_ADDRESS':
          if (!text || text.length < 5) {
            ctx.reply(
              "⛔️ Manzil juda qisqa. Iltimos, to'liq manzilni kiriting!",
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '❌ Bekor qilish', callback_data: 'cancel' }],
                  ],
                },
              },
            );
            return;
          }
          const validateAddress = await validateAndReply(
            AddressDto,
            { address: text },
            ctx,
          );
          if (!validateAddress) return;
          ctx.session.address = text;
          ctx.session.step = 'WAITING_FOR_TIME';
          await ctx.reply('⏳ Vaqtni kiriting <b>Misol uchun</b>: 12:00', {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '❌ Bekor qilish', callback_data: 'cancel' }],
              ],
            },
          });
          return;

        case 'WAITING_FOR_TIME':
          if (!text || text.length < 5 || text.length > 5) {
            ctx.reply(
              '⛔️ Xato vatq kiritildi!. Iltimos vaqt 00:00 formatida bolsin!',
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: '❌ Bekor qilish', callback_data: 'cancel' }],
                  ],
                },
              },
            );
            return;
          }
          const timeValidator = await validateAndReply(
            TimeDto,
            { time: text },
            ctx,
          );
          if (!timeValidator) return;
          ctx.session.step = 'WAITING_FOR_WEEKDAY';
          ctx.session.time = text;
          await ctx.reply(
            '📅 Hafta kunini tanlang!, misol uchun Dushanba:',
            Markup.keyboard([
              'Dushanba',
              'Seshanba',
              'Chorshanba',
              'Payshanba',
              'Juma',
              'Shanba',
            ]).oneTime(),
          );
          return;

        case 'WAITING_FOR_WEEKDAY':
          if (
            !text ||
            ![
              'Dushanba',
              'Seshanba',
              'Chorshanba',
              'Payshanba',
              'Juma',
              'Shanba',
            ].includes(text)
          ) {
            ctx.reply(
              '⛔️ xato hafta kuni kiritildi menudan tanlang!',

              Markup.keyboard([
                'Dushanba',
                'Seshanba',
                'Chorshanba',
                'Payshanba',
                'Juma',
                'Shanba',
              ]).oneTime(),
            );
            return;
          }
          const validateWeekday = await validateAndReply(
            WeekdayDto,
            { weekday: text },
            ctx,
          );
          if (!validateWeekday) return;
          ctx.session.step = 'DONE';
          ctx.session.weekday = text;
          await ctx.reply(
            '✅ Yangi uchrashuv saqlandi:',
            Markup.removeKeyboard(),
          );
          ctx.reply(
            `👤 Ism: ${ctx.session.name}\n 📍Manzil: ${ctx.session.address}\n 📅Hafta kuni: ${ctx.session.weekday}\n ⏳Soat: ${ctx.session.time} `,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '➕ Yana qo‘shish',
                      callback_data: 'new_meeting',
                    },
                    { text: '❌ Bekor qilish', callback_data: 'cancel' },
                    { text: '✅ Tasdiqlash', callback_data: 'confirm' },
                  ],
                ],
              },
            },
            // could have deleted that but this is gonna stay here as a reminder for the next
            // Markup.inlineKeyboard([
            //   [{ text: '➕ Yana qo‘shish', callback_data: 'new_meeting' }],
            //   [{ text: '❌ Bekor qilish', callback_data: 'cancel' }],
            //   [{ text: '✅ Tasdiqlash', callback_data: 'confirm' }],
            // ]),
          );
          return;
        default:
          ctx.reply(
            'Iltimos /start yoki <b>📅 Yangi uchrashuv</b> tugmasini bosing!',
            { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } },
          );
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
    await ctx.reply('❌ Uchrashuv bekor qilindi!', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📅 Yangi uchrashuv', callback_data: 'new_meeting' }],
        ],
      },
    });
  }
  @Action('confirm')
  async confirmMeeting(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    try {
      await this.botModel.create({
        fullName: ctx.session.name,
        ...ctx.session,
        userId: ctx.from?.id,
      });
    } catch (error) {
      await ctx.reply(
        '❌ Uchrashuv saqlanishda hatolik iltimos qaytadan urining!',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '📅 Yangi uchrashuv', callback_data: 'new_meeting' }],
            ],
          },
        },
      );
    }
    await ctx.reply(
      '✅ Uchrashuv muvaffaqiyatli saqlandi!',
      Markup.removeKeyboard(),
    );
    if (!process.env.ADMIN)
      throw new BadGatewayException('Couldnt load the env variable admin!');
    await ctx.telegram.sendMessage(
      process.env.ADMIN,
      `✅ Yangi uchrashuv qoshilishi aniqlandi:\n\n 👤 Ism: ${ctx.session.name}\n 📍Manzil: ${ctx.session.address}\n 📅Hafta kuni: ${ctx.session.weekday}\n ⏳Soat: ${ctx.session.time} `,
    );
  }
}
