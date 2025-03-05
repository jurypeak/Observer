const Guild = require("../../schemas/guild");
const { SlashCommandBuilder } = require("discord.js");
const mongoose = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('database')
        .setDescription('Return information from database!'),
    async execute(interaction, client) {
        let guildProfile = await Guild.findOne({ guildId: interaction.guild.id });
        if (!guildProfile) {
            guildProfile = await new Guild({
            _id: new mongoose.Types.ObjectId(),
            guildId: interaction.guild.id,
            guildName: interaction.guild.name,
            guildIcon: interaction.guild.iconURL()
                ? interaction.guild.iconURL()
                : "No icon."
        });
        await guildProfile.save().catch(console.error);
        await interaction.reply({
            content: `Server name ${guildProfile.guildName}`,
            ephemeral: true
        });
        console.log(guildProfile);
        } else {
            await interaction.reply({
                content: `Server ID ${guildProfile.guildId}`,
                ephemeral: true
            });
            console.log(guildProfile);
        }

    },
};
