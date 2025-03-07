const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require("fs");

// Function to handle loading and registering commands
module.exports = (client) => {
    client.handleCommands = async () => {
        // Read the commands directory to find command folders
        const commandFolders = fs.readdirSync("./commands");
        for (const folder of commandFolders) {
            // Read command files inside each folder, filtering for .js files
            const commandFiles = fs
                .readdirSync(`./commands/${folder}`)
                .filter((file) => file.endsWith(".js"));

            // Extract commands and store them in the client
            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                await commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
            }
        }

        // Define the bot's client ID and the server (guild) ID
        const clientID = '1186306625259184279';
        const guildID = '1346142993656184983';

        // Create a new REST instance with the bot token
        const rest = new REST({ version: '9' })
            .setToken(process.env.DISCORD_TOKEN);

        try {
            console.log("Standard refreshing application (/) commands.");

            // Register the commands for the specific guild
            await rest.put(Routes.applicationGuildCommands(clientID, guildID), {
                body: client.commandArray,
            });
        } catch (error) {
            // Log any errors encountered during registration
            console.error(error);
        }
    };
};
