const chalk = require('chalk');

module.exports = {
    name: 'connecting',
    execute(client) {
        console.log(chalk.cyan(`Connecting to MongoDB`));
    },
};