const chalk = require('chalk');

module.exports = {
    name: 'disconnected',
    execute(client) {
        console.log(chalk.red(`Disconnected from MongoDB`));
    },
};