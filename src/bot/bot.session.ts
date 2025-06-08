import { Bot } from './entities/bot.entity';

export interface SessionMeeting {
  step?:
    | 'WAITING_FOR_NAME'
    | 'WAITING_FOR_ADDRESS'
    | 'WAITING_FOR_WEEKDAY'
    | 'WAITING_FOR_WEEKDAY'
    | 'WAITING_FOR_TIME'
    | 'WAITING_FOR_CONTACT'
    | 'DONE';
  name?: string;
  address?: string;
  weekday?: string;
  time?: string;
  meetingsPage?: number;
  meetings?: Bot[];
  contact?: string;
}
