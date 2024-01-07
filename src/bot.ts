import TelegramBot from 'node-telegram-bot-api';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handleCommand } from './controllers';
import config from './config';

const token = config.telegramBotToken;
const bot = new TelegramBot(token);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { msg } = body;

    if (msg) {
      const chatId = msg.chat.id;

      // send a message to the chat acknowledging receipt of their message
      await bot.sendMessage(chatId, 'Received your message');

      // Extract command from msg.text
      const commandMatch = msg.text?.match(/\/(\w+)/);
      const command = commandMatch ? commandMatch[1].toLowerCase() : undefined;

      // pass command on to the handlers if command is defined
      if (command) {
        handleCommand(command, msg, bot);
      }
    }

    // You can add more logic here based on your use case

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};