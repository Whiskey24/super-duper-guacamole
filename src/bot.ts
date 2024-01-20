import { Bot, webhookCallback } from 'grammy'
import * as webScraping from './tasks/webScraping';

// Check if process.env.TELEGRAM_TOKEN is undefined or empty
if (!process.env.TELEGRAM_TOKEN) {
    throw new Error('Telegram token is undefined or empty');
}

// Create bot with Telegram token
export const bot = new Bot(process.env.TELEGRAM_TOKEN)

bot.command("help", async (ctx) => {
  console.log('Received /help command');
  const lines = [
    'Hi! These are the commands I know:',
    ' • help - this message',
    ' • rabo - current Rabobank certificate price',
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
  } catch (error) {
    console.error('Error setting Telegram webhook:', error);
    throw error;
  }
}
export { setTelegramWebhook };