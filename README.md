# Super Duper Quacamole

*** Currently this is a training exercise ***

This project is a Telegram bot that uses AWS Lambda with Amazon RDS database and scheduled tasks for notifications and web scraping, written in TypeScript.

## Project Structure

The project has the following structure:

- .gitignore: This file specifies intentionally untracked files that Git should ignore.
- config.default.json: This is a template for your configuration file. You should rename it to config.json and add your Amazon RDS connection details.
- package.json: This file lists the dependencies and scripts for the project. It also includes metadata about the project like its name and version.
- README.md: This file provides an overview of the project, including setup instructions, usage, testing, contributing, and licensing information.
- serverless.yml: This file specifies the AWS Lambda functions to deploy and their settings.
- src/: This directory contains the source code of the project.
  - bot.ts: This file initializes the bot and sets up command handlers.
  - config.ts: This file exports the configuration object that is used throughout the project.
  - controllers/: This directory contains the controllers that handle different bot commands.
  - database/: This directory sets up the connection to the Amazon RDS database.
  - tasks/: This directory contains tasks that the bot can perform, such as sending notifications and web scraping.
  - types/: This directory exports TypeScript types used in the project.
- tests/: This directory contains tests for the bot, controllers, tasks, and database.
- tsconfig.json: This file specifies the TypeScript compiler options and the files to include in the compilation.

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