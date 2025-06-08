import { BotContext } from './bot.update';

export async function showPagination(ctx: BotContext) {
  const page = ctx.session.meetingsPage || 0;
  const meetings = ctx.session.meetings || [];

  const totalPages = Math.ceil(meetings.length / 3);
  const start = 3 * page;
  const end = 3 + start;

  const currentMeetings = meetings.slice(start, end);

  let allMeetings = '';
  for (const meeting of currentMeetings) {
    allMeetings += `<b>📅Uchrashuv:</b>
        👤<b>Ism:</b> ${meeting.fullName}
        📍<b>Manzil:</b> ${meeting.address}
        🕒<b>Vaqt:</b> ${meeting.time}
        📆<b>Hafta kuni:</b> ${meeting.weekday}\n\n`;
  }
  allMeetings += `Sahifa ${page + 1} / ${totalPages}`;

  const paginationMarkup = {
    reply_markup: {
      inline_keyboard: [
        [
          ...(page > 0
            ? [{ text: '<< orqaga', callback_data: 'preview' }]
            : []),
          ...(totalPages - 1 > page
            ? [{ text: 'oldinga >>', callback_data: 'next' }]
            : []),
        ],
      ],
    },
  };
  try {
    await ctx.editMessageText(allMeetings, {
      parse_mode: 'HTML',
      ...paginationMarkup,
    });
  } catch (error) {
    await ctx.reply(allMeetings, {
      parse_mode: 'HTML',
      ...paginationMarkup,
    });
  }
}
