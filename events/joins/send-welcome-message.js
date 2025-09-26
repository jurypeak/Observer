const welcomeChannelSchema = require('../../schemas/welcome');
const { EmbedBuilder } = require('discord.js');

/**
 * Welcome Event for Astral Discord Bot
 *
 * This event sends a welcome message to new members.
 */

module.exports = {
    name: 'send-welcome-message',
    async execute(member) {
        try {
            // Don't send the welcome message for bots
            if (member.user.bot) return;

            // Get all welcome configurations for the server
            const welcomeConfigs = await welcomeChannelSchema.find({ guildID: member.guild.id });

            // If no welcome config exists, return
            if (!welcomeConfigs.length) {
                console.log("No welcome configuration found for guild:", member.guild.id);
                return;
            }

            for (const welcomeConfig of welcomeConfigs) {
                // Try to get the channel from cache first, then fetch if not found
                const targetChannel =
                    member.guild.channels.cache.get(welcomeConfig.channelID) ||
                    await member.guild.channels.fetch(welcomeConfig.channelID).catch(() => null);

                // If channel doesn't exist, return
                if (!targetChannel) {
                    console.log(`Channel not found: ${welcomeConfig.channelID}`);
                    return;
                }

                // Create the welcome embed
                const welcomeEmbed = new EmbedBuilder()
                    .setColor('#d31515')
                    .setTitle('Hello, Welcome to Astral')
                    .setDescription(`<@${member.user.id}> \nPlease wait to be verified into the server. If you have been provided a security password, type it in channel <#1348419021707546704> to gain access.`)
                    .setImage(member.user.displayAvatarURL({ dynamic: true, size: 128 }))
                    .addFields([
                        {
                            name: '\u200B', // Invisible character for empty field name
                            value: `**WELCOME**\n**${member.user.username.toUpperCase()}**`, // Welcome message with username
                            inline: false
                        }
                    ])
                    .setTimestamp() // Current timestamp
                    .setFooter({
                    // Footer with member count and formatted date
                        text: `${member.guild.memberCount} Members • ${new Date().toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'UTC'
                        })}`
                    });

                // Send the welcome embed to the configured channel
                await targetChannel.send({ embeds: [welcomeEmbed] }).catch((error) => {
                    console.error("Error sending message:", error);
                });
            }
        } catch (error) {
            console.error("Unexpected error:", error);
        }
    }
};