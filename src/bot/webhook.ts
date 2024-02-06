import { Bot } from 'grammy'

// Check if process.env.TELEGRAM_TOKEN is undefined or empty
if (!process.env.TELEGRAM_TOKEN) {
  throw new Error('Telegram token is undefined or empty');
}

// Create bot with Telegram token
export const bot = new Bot(process.env.TELEGRAM_TOKEN)

// function to set the webhook on Telegram with the API Gateway URL
export const setTelegramWebhook = async function setTelegramWebhook() {

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
