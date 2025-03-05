const chalk = require('chalk');

module.exports = {
    name: 'error',
    execute(client, error) {
        console.log(chalk.red(`MongoDB Error: ${error}`));
    },
}