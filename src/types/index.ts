export interface WebpageData {
  url: string;
  keyValues: { [key: string]: string };
  status: string;
}

export interface Subscription {
  id: string;
  name: string;
}

export interface ChatData {
  chatId: string;
  subscriptions: Subscription[];
}