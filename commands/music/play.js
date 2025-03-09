const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music in a voice channel!')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('The song name or URL to play')
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const song = interaction.options.getString('song');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                content: '❌ You must be in a voice channel to play music!',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        try {
            await client.disTube.play(voiceChannel, song, {
                textChannel: interaction.channel,
                member: interaction.member
            });

            await interaction.editReply({
                content: `🎶 Playing **${song}** in **${voiceChannel.name}**!`,
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: '❌ An error occurred while trying to play the song!',
            });
        }
    },
};
