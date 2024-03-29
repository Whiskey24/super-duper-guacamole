export interface WebpageData {
  url: string;
  keyValues: { [key: string]: string };
  status: string;
}

export interface Subscription {
  id: number;
  key: string;
  name: string;
  lowThreshold: number,
  highThreshold: number
}

export interface ChatData {
  chatId: number;
  subscriptions: Subscription[];
}