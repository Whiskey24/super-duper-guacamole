import TelegramBot from 'node-telegram-bot-api';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
//import { handleCommand } from './controllers';

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN || '', { polling: true });

// took this as an example: https://github.com/royshil/telegram-serverless-ts-bot-tutorial/tree/main

let globalResolve: (value: any) => void = () => {};

// this is the function that will be called by AWS Lambda and will handle all requests from Telegram
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Log the received event in a more readable format
    // console.log("Received event:", JSON.stringify(event, null, 2));

    // extract text message from the event body or empty string if message or text is not present
    const msg = JSON.parse(event.body || '{}').message?.text || '';

    if (msg) {
      console.log("Received message: ", msg);

      await new Promise((resolve, reject) => {
        globalResolve = resolve;

        // because we run inside lambda, we need to use processUpdate
        // this will emit the proper events and executing regexp callbacks (e.g. bot.talk).
        bot.processUpdate(msg);

        // set timeout to 3 seconds to resolve the promise in case the bot doesn't respond
        setTimeout(() => {
          // make sure to resolve the promise in case of timeout as well
          // do not reject the promise, otherwise the lambda will be marked as failed
          resolve("global timeout");
        }, 3000);
      });
    } else {
      console.log("Received empty message");
    }

    // respond to Telegram that the webhook has been received.
    // if this is not sent, telegram will try to resend the webhook over and over again.
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


// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, async (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
  const chatId = msg.chat.id;
  console.log("Received echo command");
  try {
    const resp = match ? match[1] : '<nothing to echo specified>'; // the captured "whatever"
    await bot.sendMessage(chatId, resp);  // send back the matched "whatever" to the chat
  } catch (error) {
    console.error('Error:', error);
    await bot.sendMessage(chatId, `❌ Error executing echo command: ${error}`);
  }
  // call the global resolve to signal the finish of the bot’s work for this message and clear the Lambda run.
  globalResolve("ok");
});

// Matches "/help [whatever]" or just "/help"
bot.onText(/\/help ?(.+)?/, async (msg: TelegramBot.Message, match: RegExpExecArray | null) => {
  const chatId = msg.chat.id;
  console.log("Received help command");
  try {
    const resp = match ? "help message on" + match[1] : 'general help message';
    await bot.sendMessage(chatId, resp);
  } catch (error) {
    console.error('Error:', error);
    await bot.sendMessage(chatId, `❌ Error executing help command: ${error}`);
  }
  globalResolve("ok");
});