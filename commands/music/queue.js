const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Shows the current music queue in the voice channel.'),

    async execute(interaction, client) {
        const voiceChannel = interaction.member.voice.channel;
        await interaction.deferReply();

        if (!voiceChannel) {
            return interaction.editReply({
                content: '❌ You must be in a voice channel to view the queue!',
                ephemeral: true
            });
        }

        const queue = client.disTube.getQueue(voiceChannel);
        if (!queue || !queue.songs.length) {
            return interaction.editReply({
                content: '❌ There are no songs currently in the queue!',
                ephemeral: true
            });
        }

        const songsPerPage = 5;
        let currentPage = 0;

        function createQueueEmbed(page) {
            const startIndex = page * songsPerPage;
            const pageSongs = queue.songs.slice(startIndex + 1, startIndex + songsPerPage + 1); // Skip the first song, already shown

            const embed = new EmbedBuilder()
                .setColor('#ff5555')
                .setTitle('🎶  **Current Queue** in  ' + voiceChannel.name)
                .setDescription(`\n**Currently Playing:**\n**1. ${queue.songs[0].name}**${queue.songs[0].formattedDuration} ・ Requested by: ${queue.songs[0].user.username}\n\n**Next Songs:**`)
                .addFields(
                    pageSongs.map((song, index) => ({
                        name: `**${startIndex + index + 2}.** ${song.name}`, // Display the next song index properly
                        value: `Duration: ${song.formattedDuration} ・ Requested by: ${song.user.username}`,
                        inline: false
                    }))
                )
                .setFooter({
                    text: `Page ${page + 1} of ${Math.ceil(queue.songs.length / songsPerPage)}`,
                    iconURL: interaction.user.avatarURL() || interaction.user.defaultAvatarURL
                })
                .setTimestamp();

            return embed;
        }

        const message = await interaction.editReply({
            embeds: [createQueueEmbed(currentPage)]
        });

        await message.react('⬅️');
        await message.react('➡️');

        const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === interaction.user.id;
        const collector = message.createReactionCollector({ filter, time: 60000 });

        collector.on('collect', async (reaction) => {
            if (reaction.emoji.name === '➡️' && currentPage < Math.ceil(queue.songs.length / songsPerPage) - 1) {
                currentPage++;
            } else if (reaction.emoji.name === '⬅️' && currentPage > 0) {
                currentPage--;
            }

            await reaction.message.edit({
                embeds: [createQueueEmbed(currentPage)],
            });

            await reaction.users.remove(interaction.user.id);
        });

        collector.on('end', (collected, reason) => {
            message.reactions.removeAll();
        });
    },
};




