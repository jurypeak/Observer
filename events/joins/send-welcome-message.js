const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/guildconfig');

module.exports = {
    name: 'send-welcome-message',
    async execute(member) {
        try {
            // Ignore bots
            if (member.user.bot) return;

            // Fetch guild config
            const config = await GuildConfig.findOne({ guildID: member.guild.id });
            if (!config?.welcomeChannel) {
                console.log("No welcome channel set for guild:", member.guild.id);
                return;
            }

            // Get the channel from cache or fetch
            const targetChannel =
                member.guild.channels.cache.get(config.welcomeChannel) ||
                await member.guild.channels.fetch(config.welcomeChannel).catch(() => null);

            if (!targetChannel) {
                console.log(`Welcome channel not found: ${config.welcomeChannel}`);
                return;
            }

            // **Embed stays exactly as you had it**
            const welcomeEmbed = new EmbedBuilder()
                .setColor('#d31515')
                .setTitle('Hello, Welcome to Astral')
                .setDescription(`<@${member.user.id}>\nPlease wait to be verified into the server. If you have been provided a security password, type it in channel <#1348419021707546704> to gain access.`)
                .setImage(member.user.displayAvatarURL({ dynamic: true, size: 128 }))
                .addFields([
                    {
                        name: '\u200B',
                        value: `**WELCOME**\n**${member.user.username.toUpperCase()}**`,
                        inline: false
                    }
                ])
                .setTimestamp()
                .setFooter({
                    text: `${member.guild.memberCount} Members • ${new Date().toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'UTC'
                    })}`
                });

            // Send embed
            await targetChannel.send({ embeds: [welcomeEmbed] }).catch(console.error);

        } catch (error) {
            console.error("Error in send-welcome-message event:", error);
        }
    }
};
