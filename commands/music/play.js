const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song in the voice channel!')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('The song name or URL to play')
        ),

    async execute(interaction, client) {
        const song = interaction.options.getString('song');
        const voiceChannel = interaction.member.voice.channel;
        const queue = client.disTube.getQueue(voiceChannel);
        await interaction.deferReply();

        if (!voiceChannel) {
            return interaction.reply({
                content: '❌ You must be in a voice channel to play music!',
                ephemeral: true
            });
        }

        if (queue && queue.paused) {
            await queue.resume();
            await interaction.editReply({
                content: '⏯️ Resumed the queue and now playing the new song!',
            });
            return;
        }

        const regex = /^(https:\/\/(www\.)?(youtube\.com\/(?:watch\?v=|embed\/|playlist\?list=)[\w\-]+|youtu\.be\/[\w\-]+)|https:\/\/soundcloud\.com\/[\w\-]+(?:\/[\w\-]+)?)$/;

        if (!regex.test(song)) {
            return interaction.editReply({
                content: '❌ Invalid URL! Only YouTube and SoundCloud links are allowed.',
                ephemeral: true
            });
        }

        try {
            await client.disTube.play(voiceChannel, song, {
                textChannel: interaction.channel,
                member: interaction.member
            });

            client.lastPlayedSong = song;

            await interaction.editReply({
                content: `🎶 Now playing **${song}** in **${voiceChannel.name}**!`,
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: '❌ An error occurred while trying to play the song!',
            });
        }
    },
};



