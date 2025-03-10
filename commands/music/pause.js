const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause music in a voice channel!'),
    async execute(interaction, client) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                content: '❌ You must be in a voice channel to pause music!',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            const queue = client.disTube.getQueue(voiceChannel);

            if (!queue) {
                return await interaction.editReply({
                    content: '❌ There is no music playing in this voice channel!',
                });
            }

            await queue.pause();

            await interaction.editReply({
                content: `🎶 Pausing music in **${voiceChannel.name}**!`,
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: '❌ An error occurred while trying to pause the music!',
            });
        }
    },
};
