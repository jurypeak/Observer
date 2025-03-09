const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Balance = require('../../schemas/balance');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Return leaderboard!'),
    async execute(interaction, client) {
        await interaction.deferReply();

        const { id } = interaction.user;

        let leaderboardEmbed = new EmbedBuilder()
            .setColor('#ff5555')
            .setTitle('Credits Leaderboard')
            .setThumbnail("attachment://medal.png")
            .setFooter({
                text: `You are not ranked yet.`,
                iconURL: client.user.displayAvatarURL()
            }).setTimestamp();

        const members = await Balance
            .find()
            .sort({ balance: -1 })
            .catch(console.error);

        if (!members || members.length === 0) {
            return interaction.editReply({ content: 'No data available for the leaderboard.' });
        }

        const memberIndex = members.findIndex(member => member.userID === id);
        if (memberIndex !== -1) {
            leaderboardEmbed.setFooter({
                text: `You are ranked: #${memberIndex + 1}`,
                iconURL: client.user.displayAvatarURL()
            }).setTimestamp();
        }

        const top10 = members.slice(0, 10);

        let desc = '';
        let rank = 1;
        for (let i = 0; i < top10.length; i++) {
            const { userID, balance } = top10[i];

            let rankEmoji = '';
            switch (rank) {
                case 1:
                    rankEmoji = '🥇';
                    break;
                case 2:
                    rankEmoji = '🥈';
                    break;
                case 3:
                    rankEmoji = '🥉';
                    break;
                default:
                    rankEmoji = '🔴';
                    break;
            }

            const user = await client.users.fetch(userID).catch(() => null);
            if (!user) {
                desc += `${rankEmoji} \` ${balance.toLocaleString()} \` - \*Unknown User\*\n`;
                continue;
            }

            desc += `${rankEmoji} \` ${balance.toLocaleString()} \` - ${user}\n`;
            rank++;
        }

        if (desc !== "") {
            leaderboardEmbed.setDescription(desc);
        }

        await interaction.editReply({
            embeds: [leaderboardEmbed],
            files: [{
                attachment: 'medal.png',
                name: 'medal.png'
            }]
        });
    },
};

