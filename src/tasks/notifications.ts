/* TODO
import { Bot } from '../bot';
import { Database } from '../database';

export class Notifications {
  private bot: Bot;
  private database: Database;

  constructor(bot: Bot, database: Database) {
    this.bot = bot;
    this.database = database;
  }

  public async sendNotifications(): Promise<void> {
    // Fetch users from the database
    const users = await this.database.getUsers();

    // Loop through each user and send a notification
    for (const user of users) {
      await this.bot.sendMessage(user.id, 'This is your scheduled notification!');
    }
  }
} 
*/