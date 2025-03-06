const { SlashCommandBuilder } = require("discord.js");

// Slash command to get bot latency
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ged')
        .setDescription('Return my ping!'),
    async execute(interaction, client) {
        // Defer reply to allow time for processing
        await interaction.deferReply();

        // Get API latency and send response
        const newMessage = `API Latency: ${client.ws.ping}ms`;
        await interaction.editReply({
            content: newMessage
        });
    }
};