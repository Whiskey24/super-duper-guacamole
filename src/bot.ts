import TelegramBot from 'node-telegram-bot-api';
import { handleCommand } from './controllers';
import config from './config';

const token = config.telegramBotToken;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Listen for any kind of message. There are different kinds of messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});

// Listen for "/start" command
bot.onText(/\/start/, (msg) => {
  handleCommand('start', msg, bot);
});

// Listen for "/help" command
bot.onText(/\/help/, (msg) => {
  handleCommand('help', msg, bot);
});