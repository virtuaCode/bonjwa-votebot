export interface Message {
  color: string;
  display_name: string;
  emotes: string | null;
  id: string;
  mod: boolean;
  room_id: number;
  subscriber: boolean;
  tmi_sent_ts: number;
  turbo: boolean;
  user_id: number;
  user_type: string | null;
  badges: {
    broadcaster?: number;
    subscriber?: number;
  };
  channel: string;
  message: string;
  username: string;
}
