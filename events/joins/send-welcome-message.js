const welcomeChannelSchema = require('../../schemas/welcome');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'send-welcome-message',
    async execute(member) {
        try {
            if (member.user.bot) return;

            const welcomeConfigs = await welcomeChannelSchema.find({ guildID: member.guild.id });

            if (!welcomeConfigs.length) {
                console.log("No welcome configuration found.");
                return;
            }

            for (const welcomeConfig of welcomeConfigs) {
                const targetChannel =
                    member.guild.channels.cache.get(welcomeConfig.channelID) ||
                    await member.guild.channels.fetch(welcomeConfig.channelID).catch(() => null);

                if (!targetChannel) {
                    console.log(`Channel not found: ${welcomeConfig.channelID}`);
                    return;
                }

                const welcomeEmbed = new MessageEmbed()
                    .setColor('#a11111')
                    .setTitle('Hello, Welcome to Astral')
                    .setDescription(`<@${member.user.id}> \nPlease wait to be verified into the server. If you have been provided a security password, type it in channel <#1348419021707546704> to gain access.`)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .addFields('Channel', member.user.username, true)
                    .addFields('Members', `${member.guild.memberCount}`, true)
                    .setTimestamp()
                    .setFooter(`Joined at ${new Date().toLocaleString('en-GB', { timeZone: 'UTC' })}`);

                targetChannel.send({ embeds: [welcomeEmbed] }).catch((error) => console.error("Error sending message:", error));
            }
        } catch (error) {
            console.error(error);
        }
    }
};