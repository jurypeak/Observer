// Import necessary classes from discord.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    // Define the slash command using SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName('button')  // Command name that users will type: /button
        .setDescription('Return my button'),  // Description shown in Discord UI

    // Function that executes when the command is used
    async execute(interaction, client) {
        // Create a new button
        const button = new ButtonBuilder()
            .setCustomId("github")  // This ID must match the name in your button component
            .setLabel(`Github`)     // Text displayed on the button
            .setStyle(ButtonStyle.Primary);  // Blue color button

        // Reply to the command with a message containing the button
        await interaction.reply({
            // ActionRowBuilder is required to hold components like buttons
            components: [new ActionRowBuilder().addComponents(button)],
        });
    },
};