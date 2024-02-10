export interface WebpageData {
  url: string;
  keyValues: { [key: string]: string };
  status: string;
}

export interface Subscription {
  id: string;
  name: string;
  lowTreshold: number,
  highTreshold: number
}

export interface ChatData {
  chatId: string;
  subscriptions: Subscription[];
}