const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/guildconfig');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (!message.guild || message.author?.bot) return;

        try {
            const config = await GuildConfig.findOne({ guildID: message.guild.id });
            if (!config?.logChannel) return;

            const logChannel = await message.guild.channels.fetch(config.logChannel).catch(() => null);
            if (!logChannel) return;

            const attachments = message.attachments.size
                ? message.attachments.map(att => att.url).join('\n')
                : 'No Attachments';

            const embed = new EmbedBuilder()
                .setColor('#FF5555')
                .setTitle('🚨 Message Deleted')
                .addFields(
                    { name: 'Author', value: `<@${message.author.id}> (\`${message.author.id}\`)` },
                    { name: 'Channel', value: `<#${message.channel.id}>` },
                    { name: 'Content', value: message.content || 'No Content' },
                    { name: 'Attachments', value: attachments }
                )
                .setTimestamp()
                .setFooter({ text: `Message ID: ${message.id}` });

            await logChannel.send({ embeds: [embed] });

        } catch (err) {
            console.error('Error logging deleted message:', err);
        }
    }
};
