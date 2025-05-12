export interface SessionMeeting {
  step?:
    | 'WAITING_FOR_NAME'
    | 'WAITING_FOR_ADDRESS'
    | 'WAITING_FOR_WEEKDAY'
    | 'WAITING_FOR_WEEKDAY'
    | 'WAITING_FOR_HOUR'
    | 'DONE';
  name?: string;
  address?: string;
  weekday?: string;
  time?: string;
}
