const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/guildconfig');

/**
 * Delete message Event for Astral Discord Bot
 *
 * Sends an embed for any deleted messages
 */

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {

        // Ignore DMs and invalid messages
        if (!message.guild || !message) return;

        try {
            // Fetch the guild configuration
            const config = await GuildConfig.findOne({ guildID: message.guild.id });
            if (!config || !config.logChannel) return;

            // Fetch the log channel
            const logChannel = await message.guild.channels.fetch(config.logChannel).catch(() => null);
            if (!logChannel) return;

            // Handle attachments
            const attachments = message.attachments.size > 0
                ? message.attachments.map(att => att.url).join('\n')
                : 'No Attachments';

            // Attempt to find who deleted the message using audit logs
            let deletedBy = 'Unknown';
            try {
                const auditLogs = await message.guild.fetchAuditLogs({
                    limit: 1,
                    type: 'MESSAGE_DELETE'
                });
                const deletionEntry = auditLogs.entries.first();
                if (deletionEntry) {
                    // If deleted by bot itself, treat as author deleted
                    deletedBy = deletionEntry.executor.id === message.client.user.id
                        ? `<@${message.author.id}>`
                        : `<@${deletionEntry.executor.id}>`;
                }
            } catch {
                // Silently ignore audit log errors
            }

            // Build the log embed
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚨 Message Deleted')
                .setDescription(`A message was deleted in **${message.guild.name}**`)
                .addFields(
                    { name: 'Message Content', value: message.content || 'No Message Content', inline: false },
                    { name: 'Author', value: `<@${message.author.id}> (\`${message.author.id}\`)`, inline: false },
                    { name: 'Channel', value: `<#${message.channel.id}>`, inline: false },
                    { name: 'Attachments', value: attachments, inline: false },
                    { name: 'Deleted By', value: deletedBy, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `Message ID: ${message.id}` });

            // Send embed to log channel
            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error(`Error in message delete logger: ${error}`);
        }
    }
};
