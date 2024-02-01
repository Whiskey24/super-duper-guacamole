import { Bot, webhookCallback, InlineKeyboard, Context, MiddlewareFn } from 'grammy'
import * as webScraping from '../tasks/webScraping';
import * as s3 from '../database/s3Storage';
import * as fs from 'fs';
import subscriptions from '../subscriptions.json'; // allows loading a json file included in the source

// Check if process.env.TELEGRAM_TOKEN is undefined or empty
if (!process.env.TELEGRAM_TOKEN) {
  throw new Error('Telegram token is undefined or empty');
}

// Create bot with Telegram token
export const bot = new Bot(process.env.TELEGRAM_TOKEN)

// webhookCallback will make sure that the correct middleware(listener) function is called
export const handler = webhookCallback(bot, 'aws-lambda-async');

bot.command("help", async (ctx) => {
  console.log('Received /help command');
  const lines = [
    'Hi! These are the commands (preceded by /) that I know:',
    ' • help - this message',
    ' • menu - show a menu with options',
    ' • rabo - current Rabobank certificate price'
  ];
  await ctx.reply(lines.join('\n'));
});

bot.command("menu", async (ctx) => {
  console.log('Received /menu command');
  const inlineKeyboard = new InlineKeyboard()
  .text("Rabobank certificaten", "rabo").row()
  .text("Abonneren", "subscribe");
  await ctx.reply('Choose an option:', { reply_markup: inlineKeyboard });
});

bot.callbackQuery('subscribe', async (ctx) => {
  console.log('Received /subscibe callback');
  const inlineKeyboard = new InlineKeyboard();
  
  // add a button for each subscription
  subscriptions.forEach((subscription: any, index: number) => {
    inlineKeyboard.text(subscription.name, subscription.key);
    if ((index + 1) % 2 === 0) {  // Put 2 buttons in one row
      inlineKeyboard.row();
    }
  });

  await ctx.reply('Choose an option:', { reply_markup: inlineKeyboard });
});

// create a callback query handler for each subscription
subscriptions.forEach((subscription: any) => {
  bot.callbackQuery(subscription.key, async (ctx) => {
    console.log(`Received ${subscription.key} callback`);
    const chatId = ctx.chat?.id;
    
    // load chat data from S3, add subscription if not already present, and save again
    try {
      const chatData = await s3.getChatData(String(ctx.chat?.id));
      if (!chatData.subscriptions.find(sub => sub.id === subscription.id)) {
        chatData.subscriptions.push(subscription);
        await s3.saveChatData(chatData);
        await ctx.reply(`Chat is geabbonneerd op ${subscription.name} notificaties`);
      } else {
        await ctx.reply(`Chat was al geabbonneerd op ${subscription.name} notificaties`);
      }
    } catch (error) {
      console.error(`Error checking/adding ${subscription.key} subscription for chat ${chatId}:`, error);
    }
  });
})

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

// Function to send current date and time to all subscribed chat IDs
async function sendNotificationToSubscribers(): Promise<void> {
  try {
    // Get the subscribed chat IDs
    const subscribedChatIds = await s3.getSubscribedChatIds();

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