# My Telegram Bot

This project is a Telegram bot that uses AWS Lambda with Amazon RDS database and scheduled tasks for notifications and web scraping, written in TypeScript.

## Project Structure

The project has the following structure:

- `src/bot.ts`: Initializes the bot and sets up command handlers.
- `src/controllers/index.ts`: Exports controllers that handle different bot commands.
- `src/database/index.ts`: Sets up the connection to the Amazon RDS database.
- `src/tasks/notifications.ts`: Sends scheduled notifications to users.
- `src/tasks/webScraping.ts`: Performs web scraping and stores the data in the database.
- `src/types/index.ts`: Exports TypeScript types used in the project.
- `tests/index.ts`: Contains tests for the bot, controllers, tasks, and database.
- `package.json`: Lists the dependencies and scripts for the project.
- `tsconfig.json`: Specifies the TypeScript compiler options and the files to include in the compilation.
- `serverless.yml`: Specifies the AWS Lambda functions to deploy and their settings.

## Setup

1. Install the dependencies by running `npm install`.
2. Set up your Amazon RDS database, rename `config.default.json` to `config.json` and add the connection details in that file.
3. Set up your Telegram bot and add the bot token to `src/bot.ts`.
4. Deploy the AWS Lambda functions by running `serverless deploy`.

## Usage

After setting up the bot, you can interact with it on Telegram. The bot responds to the following commands:

- `/start`: Starts the bot.
- `/stop`: Stops the bot.
- `/notify`: Schedules a notification.
- `/scrape`: Starts a web scraping task.

## Testing

Run the tests by executing `npm test`.

## Contributing

Please read `CONTRIBUTING.md` for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.