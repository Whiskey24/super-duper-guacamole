export interface WebpageData {
  url: string;
  keyValues: { [key: string]: string };
}

export interface ChatData {
  chatId: string;
  subscriptions: string[];
}