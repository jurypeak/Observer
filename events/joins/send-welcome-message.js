const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/guildconfig');

module.exports = {
    name: 'send-welcome-message',
    async execute(member) {
        try {
            if (member.user.bot) return;

            const config = await GuildConfig.findOne({ guildID: member.guild.id });
            if (!config?.welcomeChannel) {
                console.log("No welcome channel set for guild:", member.guild.id);
                return;
            }

            const targetChannel =
                member.guild.channels.cache.get(config.welcomeChannel) ||
                await member.guild.channels.fetch(config.welcomeChannel).catch(() => null);

            if (!targetChannel) {
                console.log(`Welcome channel not found: ${config.welcomeChannel}`);
                return;
            }

            const username = member.user.username;
            const avatar = member.user.displayAvatarURL({ size: 256 });
            const banner = member.guild.bannerURL({ size: 1024 }) || member.guild.iconURL({ size: 512 });

            const welcomeEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setAuthor({ name: `${member.guild.name}`, iconURL: member.guild.iconURL({ size: 256 }) || undefined })
                .setTitle(`Welcome to ${member.guild.name}, ${username}! ✨`)
                .setDescription([
                    `Hey <@${member.id}> — we're glad you're here!`,
                    `Make yourself at home and check out the server channels. A moderator will assist you shortly if required.`
                ].join('\n'))
                .setThumbnail(avatar)
                .setImage(banner)
                .addFields(
                    { name: 'Account', value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
                    { name: 'Member #', value: `${member.guild.memberCount}`, inline: true },
                    { name: '\u200B', value: 'Be sure to read the rules and say hello! 🎉' }
                )
                .setFooter({ text: `Joined • ${new Date().toLocaleString('en-GB', { timeZone: 'UTC' })}` })
                .setTimestamp();

            await targetChannel.send({ embeds: [welcomeEmbed] }).catch(console.error);

        } catch (error) {
            console.error("Error in send-welcome-message event:", error);
        }
    }
};
