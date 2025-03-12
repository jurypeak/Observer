const { Events, EmbedBuilder } = require('discord.js');
const msglog = require('../../schemas/msglog');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {

        if (!message.guild || !message) return;

        const data = await msglog.findOne({
            guildID: message.guild.id,
            channelID: message.channel.id,
        });

        if (!data) return;

        const sendChannel = await message.guild.channels.fetch(data.logChannelID);

        const attachments = message.attachments.size > 0
            ? message.attachments.map(attachment => attachment.url).join('\n')
            : 'No Attachments';

        // Fetch the audit logs for the message delete event
        const auditLogs = await message.guild.fetchAuditLogs({
            limit: 1,
            actionType: 72, // 72 is the integer code for MESSAGE_DELETE
        });

        const deletionLog = auditLogs.entries.first();

        // Default to 'Unknown' if the deletion is not found
        let deletedBy = 'Unknown';

        if (deletionLog) {
            // Check if the id is the bot id then it means the message was deleted by author.
            // Audit logs only track messages deleted by others and not the author.
            // This is a workaround to track messages deleted by the author.
            if (deletionLog.executor.id === 1186306625259184279) {
                deletedBy = `<@${message.author.id}>`;
            } else {
                // If another deleted the message, log it as the executor
                deletedBy = `<@${deletionLog.executor.id}>`;
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#FF5555')
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

        await sendChannel.send({ embeds: [embed] });
    }
};
