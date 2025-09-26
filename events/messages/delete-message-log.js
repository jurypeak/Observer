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
        // Ignore DMs or bot messages
        if (!message.guild || message.author?.bot) return;

        try {
            // Fetch guild configuration
            const config = await GuildConfig.findOne({ guildID: message.guild.id });
            if (!config || !config.logChannel) return;

            // Fetch the log channel
            const logChannel = await message.guild.channels.fetch(config.logChannel).catch(() => null);
            if (!logChannel) return;

            // Handle attachments
            const attachments = message.attachments.size
                ? message.attachments.map(att => att.url).join('\n')
                : 'No Attachments';

            // Build the embed
            const embed = new EmbedBuilder()
                .setColor('#FF5555') // Red for deletions
                .setTitle('🚨 Message Deleted')
                .setDescription(`A message was deleted in **${message.guild.name}**`)
                .addFields(
                    { name: 'Author', value: `<@${message.author.id}> (\`${message.author.id}\`)`, inline: false },
                    { name: 'Channel', value: `<#${message.channel.id}>`, inline: false },
                    { name: 'Content', value: message.content || 'No Content', inline: false },
                    { name: 'Attachments', value: attachments, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: `Message ID: ${message.id}` });

            // Send to log channel
            await logChannel.send({ embeds: [embed] });

        } catch (error) {
            console.error(`Error logging deleted message: ${error}`);
        }
    }
};
