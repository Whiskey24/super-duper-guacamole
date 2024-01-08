export interface BotCommand {
  command: string;
  description: string;
}

export interface Message {
  messageId: number;
  from: User;
  chat: Chat;
  date: number;
  text: string;
}

export interface User {
  id: number;
  isBot: boolean;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
}

export interface Chat {
  id: number;
  type: string;
  title?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface Notification {
  userId: number;
  text: string;
  date: Date;
}

export interface ScrapedData {
  id: number;
  data: string;
}

export interface AWSConfig {
  name: string;
  runtime: string;
  stage: string;
  region: string;
  database: {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
  };
}

export interface AppConfig {
  aws: AWSConfig;
  telegramBotToken: string;
}
