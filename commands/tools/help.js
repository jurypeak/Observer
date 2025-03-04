// Discord help command to display a help menu.
// Author: Jayden Robertson (Proxill)
// Created: 04/03/2025
// Last modified: 04/03/2025

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder() //Creating a help slash command
        .setName('help')
        .setDescription('Observer help guide, provides list available commands.'),
        
        async execute(interaction, client) {
        const embed = new EmbedBuilder() //Creating help embed message
            .setTitle(`Help Menu`)
            .setDescription(`Here are the available commands:`)
            .setColor(`#EFBF04`)
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp(Date.now());
            
        // Loop through all the commands and add them to the embed
        client.commands.forEach(command => {
            embed.addFields({name:  `**${command.data.name}**`, value: command.data.description, inline: true });
        });

        await interaction.reply({
            embeds: [embed]
        });
    },
};