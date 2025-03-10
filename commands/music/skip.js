const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song playing in the voice channel!'),

    async execute(interaction, client) {
        const voiceChannel = interaction.member.voice.channel;
        await interaction.deferReply();

        if (!voiceChannel) {
            return interaction.editReply({
                content: '❌ You must be in a voice channel to skip music!',
                ephemeral: true
            });
        }

        const queue = client.disTube.getQueue(voiceChannel);

        if (queue.songs.length >= 2 && queue.paused) {
            await client.disTube.skip(voiceChannel);
            await queue.resume();
            return interaction.editReply({
                content: '⏯️ Resumed the queue and now playing the new song!',
            });
        }

        if (queue.songs.length < 2) {
            return interaction.editReply({
                content: '❌ There is no music currently playing to skip!',
                ephemeral: true
            });
        }

        try {
            await client.disTube.skip(voiceChannel);

            await interaction.editReply({
                content: `⏭️ Skipped the current song in **${voiceChannel.name}**!`,
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: '❌ An error occurred while trying to skip the song!',
            });
        }
    },
};
