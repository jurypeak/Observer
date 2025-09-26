const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/guildconfig');

/**
 * Edit message Event for Astral Discord Bot
 *
 * Sends an embed for any edited messages
 */

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        // Ignore DMs, bots, or if content didn't change
        if (!oldMessage.guild || !oldMessage.content || oldMessage.author.bot) return;
        if (oldMessage.content === newMessage.content) return;

        try {
            // Fetch guild configuration
            const config = await GuildConfig.findOne({ guildID: oldMessage.guild.id });
            if (!config || !config.logChannel) return;

            // Fetch the log channel
            const logChannel = await oldMessage.guild.channels.fetch(config.logChannel).catch(() => null);
            if (!logChannel) return;

            // Handle attachments
            const oldAttachments = oldMessage.attachments.size
                ? oldMessage.attachments.map(att => att.url).join('\n')
                : 'No Attachments';

            const newAttachments = newMessage.attachments.size
                ? newMessage.attachments.map(att => att.url).join('\n')
                : 'No Attachments';

            // Build the log embed
            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('✏️ Message Edited')
                .setDescription(`A message was edited in **${oldMessage.guild.name}**`)
                .addFields(
                    { name: 'Author', value: `<@${oldMessage.author.id}> (\`${oldMessage.author.id}\`)`, inline: false },
                    { name: 'Channel', value: `<#${oldMessage.channel.id}>`, inline: false },
                    { name: 'Before', value: oldMessage.content || 'No Content', inline: false },
                    { name: 'After', value: newMessage.content || 'No Content', inline: false },
                    { name: 'Old Attachments', value: oldAttachments, inline: false },
                    { name: 'New Attachments', value: newAttachments, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `Message ID: ${oldMessage.id}` });

            // Send embed to log channel
            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error(`Error in edit-message-log event: ${error}`);
        }
    }
};
