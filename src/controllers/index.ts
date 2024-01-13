/* Not sure we need this in a separate module
import TelegramBot from 'node-telegram-bot-api';

function handleCommand(command: string, msg: TelegramBot.Message, bot: TelegramBot) {
    // Handle different commands
    switch (command) {
      case 'start':
        // Handle "/start" command
        bot.sendMessage(msg.chat.id, 'Welcome to the bot!');
        break;
      case 'help':
        // Handle "/help" command
        bot.sendMessage(msg.chat.id, 'This is the help message.');
        break;
      default:
        // Handle unknown command
        bot.sendMessage(msg.chat.id, 'Unknown command.');
        break;
    }
  }
  
  export { handleCommand };
  */