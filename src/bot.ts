import { Bot, webhookCallback } from 'grammy'
import * as webScraping from './tasks/webScraping';

// Check if process.env.TELEGRAM_TOKEN is undefined or empty
if (!process.env.TELEGRAM_TOKEN) {
    throw new Error('Telegram token is undefined or empty');
}

// use an environment variable to store the list of subscribed chat IDs
const SUBSCRIBED_CHAT_IDS_ENV_VAR = 'SUBSCRIBED_CHAT_IDS';

// Retrieve subscribed chat IDs from environment variable
const subscribedChatIds: Set<number> = new Set(
  process.env[SUBSCRIBED_CHAT_IDS_ENV_VAR]?.split(',').map((id) => parseInt(id, 10)) || []
);

// Create bot with Telegram token
export const bot = new Bot(process.env.TELEGRAM_TOKEN)

bot.command("help", async (ctx) => {
  console.log('Received /help command');
  const lines = [
    'Hi! These are the commands (preceded by /) that I know:',
    ' • help - this message',
    ' • rabo - current Rabobank certificate price',
    ' • subscribe - subscribe to notifications'
  ];
  await ctx.reply(lines.join('\n'));
});

bot.command("rabo", async (ctx) => {
  console.log('Received /rabo command');
  await ctx.reply("Fetching Rabobank certificate details...");
  const result = await webScraping.rabo();

  // Convert the result object to a formatted string
  const formattedResult = Object.entries(result).map(([key, value]) => `${key}: ${value}`).join('\n');

  // Send the formatted result as a reply
  await ctx.reply(`Rabobank Certificate Information:\n${formattedResult}`);
});

bot.command('subscribe', async (ctx) => {
  const chatId = ctx.chat?.id;
  if (chatId) {
    subscribedChatIds.add(chatId);
    // Update environment variable with the new list of subscribed chat IDs
    process.env[SUBSCRIBED_CHAT_IDS_ENV_VAR] = Array.from(subscribedChatIds).join(',');
    console.log(`Subscribed chat IDs: ${process.env[SUBSCRIBED_CHAT_IDS_ENV_VAR]}`);
    await ctx.reply(`Hi! This chat with id ${chatId} has been added to the notification list`);
  } else {
    await ctx.reply('Unable to determine chat ID.');
  }
});

// webhookCallback will make sure that the correct middleware(listener) function is called
export const handler = webhookCallback(bot, 'aws-lambda-async');

// function to set the webhook on Telegram with the API Gateway URL
async function setTelegramWebhook() {

  // Check if process.env.GW_URL is undefined or empty
  if (!process.env.GW_URL) {
    throw new Error('process.env.GW_URL is undefined or empty');
  }

  try {
    const webhookUrl = `${process.env.GW_URL}/bot`;

    // Set the Telegram webhook
    await bot.api.setWebhook(webhookUrl);

    console.log(`Telegram webhook set successfully to: ${webhookUrl}`);
    return (`Telegram webhook set successfully to: ${webhookUrl}`);
  } catch (error) {
    console.error('Error setting Telegram webhook:', error);
    throw error;
  }
}
export { setTelegramWebhook };
