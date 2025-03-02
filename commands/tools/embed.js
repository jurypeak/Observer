const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// Slash command to return an embed message
module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Returns an embed.'),
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setTitle(`This is an embed`)
            .setDescription(`Ged`)
            .setColor(`#FFFFFF`)
            .setImage(client.user.displayAvatarURL())
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp(Date.now())
            .setAuthor({
                url: `https://github.com/jurypeak`,
                iconURL: interaction.user.displayAvatarURL(),
                name: interaction.user.tag
            })
            .addFields([
                {
                    name: ``,
                    value: ``,
                    inline: true
                }
            ]);
        await interaction.reply({
            embeds: [embed]
        });
    },
};