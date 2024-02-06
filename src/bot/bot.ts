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

bot.hears("help", async (ctx) => {
  await ctx.reply("Hi! Ik ben Super Duper Quacamole! Stuur /s of /start om te starten.", {
    reply_parameters: { message_id: ctx.msg.message_id },
  });
});

// sendMenu will send a menu with options to the user when the /s or /start command is received
const sendMenu = async (ctx: Context) => {
  console.log('Received show menu command');
  const inlineKeyboard = new InlineKeyboard()
    .text("Koers informatie", "info")
    .text("Abonneren", "subscribe");
  await ctx.reply('Choose an option:', { reply_markup: inlineKeyboard });
};
bot.command("s", sendMenu);
bot.command("start", sendMenu);

bot.callbackQuery('subscribe', async (ctx) => {
  console.log('Received subscribe callback');
  const inlineKeyboard = new InlineKeyboard();
  
  // add a button for each subscription
  subscriptions.forEach((subscription: any, index: number) => {
    inlineKeyboard.text(subscription.name, `sub-${subscription.key}`); // Add prefix to distinguish from other callbacks
    if ((index + 1) % 2 === 0) {  // Put 2 buttons in one row
      inlineKeyboard.row();
    }
  });

  await ctx.reply('Choose an option:', { reply_markup: inlineKeyboard });
});

bot.callbackQuery('info', async (ctx) => {
  console.log('Received info callback');
  const inlineKeyboard = new InlineKeyboard();
  
  // add a button for each subscription
  subscriptions.forEach((subscription: any, index: number) => {
    inlineKeyboard.text(subscription.name, `info-${subscription.key}`);
    if ((index + 1) % 2 === 0) {  // Put 2 buttons in one row
      inlineKeyboard.row();
    }
  });

  await ctx.reply('Choose an option:', { reply_markup: inlineKeyboard });
});


// create a callback query handler for each subscription
subscriptions.forEach((subscription: any) => {
  bot.callbackQuery(`sub-${subscription.key}`, async (ctx) => {
    console.log(`Received sub-${subscription.key} callback`);
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

// create a callback query handler for each subscription for info
subscriptions.forEach((subscription: any) => {
  bot.callbackQuery(`info-${subscription.key}`, async (ctx) => {
    console.log(`Received info-${subscription.key} callback`);
    const chatId = ctx.chat?.id;
    const webpageData = await webScraping.beleggerNl(subscription.id);
    if (webpageData.status == "success") {
      // Convert the result object to a formatted string, escape special characters, and send the message
      const formattedResult = Object.entries(webpageData.keyValues).map(([key, value]) => `${key}: ${value}`).join('\n');
      const escapedFormattedResult = escapeSpecialCharacters(formattedResult);
      const message = `__${subscription.name}__\n${escapedFormattedResult}\n\n[More Details](${webpageData.url})`;
      await ctx.reply(message, { parse_mode: "MarkdownV2" });
    } else {
      await ctx.reply(webpageData.keyValues.errormsg);
    }
  });
})

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