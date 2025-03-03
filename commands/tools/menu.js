const { SlashCommandBuilder, SelectMenuBuilder, ActionRowBuilder, SelectMenuOptionBuilder } = require("discord.js");

// Slash command to get bot latency
module.exports = {
    data: new SlashCommandBuilder()
        .setName('menu')
        .setDescription('Returns a role menu.'),
    async execute(interaction, client) {
        const menu = new SelectMenuBuilder()
            .setCustomId("role-menu")
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder("Select a role")
            .setOptions(
                new SelectMenuOptionBuilder()
                    .setLabel("Admin")
                    .setValue("1346241994015506502")
                    .setDescription("Administrator role"),
                new SelectMenuOptionBuilder()
                    .setLabel("Moderator")
                    .setValue("1346243081762246716")
                    .setDescription("Moderator role"),
                new SelectMenuOptionBuilder()
                    .setLabel("Member")
                    .setValue("1346243116226576424")
                    .setDescription("Member role"),
            );
        await interaction.reply({
            components: [new ActionRowBuilder().addComponents(menu)],
        });
    },
};
