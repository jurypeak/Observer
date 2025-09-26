const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/guildconfig');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        if (!oldMessage.guild || oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        try {
            const config = await GuildConfig.findOne({ guildID: oldMessage.guild.id });
            if (!config?.logChannel) return;

            const logChannel = await oldMessage.guild.channels.fetch(config.logChannel).catch(() => null);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('✏️ Message Edited')
                .addFields(
                    { name: 'Author', value: `<@${oldMessage.author.id}> (\`${oldMessage.author.id}\`)` },
                    { name: 'Channel', value: `<#${oldMessage.channel.id}>` },
                    { name: 'Before', value: oldMessage.content || 'No Content' },
                    { name: 'After', value: newMessage.content || 'No Content' }
                )
                .setTimestamp()
                .setFooter({ text: `Message ID: ${oldMessage.id}` });

            await logChannel.send({ embeds: [embed] });

        } catch (err) {
            console.error('Error logging edited message:', err);
        }
    }
};
