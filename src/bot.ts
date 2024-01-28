import { Bot, webhookCallback, InlineKeyboard } from 'grammy'
import * as webScraping from './tasks/webScraping';
//import { Context } from 'aws-sdk/clients/personalizeruntime';


// Check if process.env.TELEGRAM_TOKEN is undefined or empty
if (!process.env.TELEGRAM_TOKEN) {
  throw new Error('Telegram token is undefined or empty');
}

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Function to fetch subscribed chat IDs from S3
async function getSubscribedChatIds() {
  try {
    console.log(`Fetching subscribed chat IDs from S3 bucket ${process.env.S3_BUCKET}...`);
    const s3Object = await s3.getObject({
      Bucket: process.env.S3_BUCKET,
      Key: 'subscribed-chat-ids.json',
    }).promise();

    return new Set(JSON.parse(s3Object.Body.toString()));
  } catch (error) {
    console.error('Error fetching subscribed chat IDs from S3:', error);
    return new Set(); // Return an empty set if there's an error
  }
}

// Function to save subscribed chat IDs to S3
async function saveSubscribedChatIds(subscribedChatIds: Set<number>): Promise<void> {
  try {
    await s3.putObject({
      Bucket: process.env.S3_BUCKET,
      Key: 'subscribed-chat-ids.json',
      Body: JSON.stringify(Array.from(subscribedChatIds)),
    }).promise();
  } catch (error) {
    console.error('Error saving subscribed chat IDs to S3:', error);
    throw error; // Rethrow the error after logging
  }
}

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
import { Context, MiddlewareFn } from 'grammy';
// Function to fetch Rabobank certificate details and send the response
const handleRaboCommand: MiddlewareFn<Context> = async (ctx) => {
  console.log('Received /rabo command or callback query');
  await ctx.reply("Fetching Rabobank certificate details...");
  const webpageData = await webScraping.rabo();

  // Convert the result object to a formatted string, escape special characters, and send the message
  const formattedResult = Object.entries(webpageData.keyValues).map(([key, value]) => `${key}: ${value}`).join('\n');
  const escapedFormattedResult = escapeSpecialCharacters(formattedResult);
  const message = `${escapedFormattedResult}\n\n[More Details](${webpageData.url})`;
  await ctx.reply(message, { parse_mode: "MarkdownV2" });
};

// Command handler
bot.command("rabo", handleRaboCommand);

// Callback query handler
bot.callbackQuery('rabo', handleRaboCommand);
bot.callbackQuery('test', (ctx) => ctx.reply('You chose the test option'));


// Characters to be escaped
const escapeCharacters = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];

// Function to escape special characters with '\' for MarkdownV2
function escapeSpecialCharacters(string: string): string {
  let newString = '';
  for (let i = 0; i < string.length; i++) {
    newString += escapeCharacters.includes(string[i]) ? '\\' + string[i] : string[i];
  }
  return newString;
}

// Subscribe chatId to notifications
bot.command('subscribe', async (ctx) => {
  const chatId = ctx.chat?.id;

  // Only add chatId if it is a valid number
  if (chatId && !isNaN(chatId)) {
    let subscribedChatIds: Set<number> = await getSubscribedChatIds() as Set<number>; // Explicitly type the variable

    // Log current subscribed chat IDs before adding the new one
    console.log(`Current subscribed chat IDs: ${Array.from(subscribedChatIds).join(', ')}`);

    subscribedChatIds.add(Number(chatId));

    try {
      // Save subscribed chat IDs to S3
      await saveSubscribedChatIds(subscribedChatIds);
      console.log(`Subscribed chat IDs: ${Array.from(subscribedChatIds).join(', ')}`);

      await ctx.reply(`Hi! This chat with id ${chatId} has been added to the notification list`);
    } catch (error) {
      console.error('Error saving subscribed chat IDs:', error);
      await ctx.reply('An error occurred while trying to subscribe. Please try again.');
    }
  } else {
    await ctx.reply('Could not find the chat ID. Please try to subscribe again.');
  }
});

// Function to send current date and time to all subscribed chat IDs
async function sendNotificationToSubscribers(): Promise<void> {
  try {
    // Get the subscribed chat IDs
    const subscribedChatIds = await getSubscribedChatIds();

    // Check if there are subscribed chat IDs
    if (subscribedChatIds.size === 0) {
      console.log('No subscribed chat IDs found. Skipping message sending.');
      return;
    }

    const currentDateAndTime = new Date().toLocaleString();
    const message = `Current date and time: ${currentDateAndTime}`;

    // Iterate through subscribed chat IDs and send the message
    for (const chatId of subscribedChatIds) {
      await bot.api.sendMessage(String(chatId), message);
    }

    console.log(`Message sent successfully to ${subscribedChatIds.size} subscribers: `, message);
  } catch (error) {
    console.error('Error sending message to subscribers:', error);
  }
}
export { sendNotificationToSubscribers}

bot.command("menu", async (ctx) => {
  console.log('Received /menu command');

  const inlineKeyboard = new InlineKeyboard()
  .text("Rabobank certificaten", "rabo").row()
  .text("Test optie", "test");

  await ctx.reply('Choose an option:', { reply_markup: inlineKeyboard });
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
