const welcomeChannelSchema = require('../../schemas/welcome');

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

                const customMessage = welcomeConfig.customMessage ||
                    'Welcome {username} to {server-name}!';

                const welcomeMessage = customMessage
                    .replace(`{username}`, member.user.username)
                    .replace(`{server-name}`, member.guild.name)
                    .replace(`{mention-member}`, `<@${member.user.id}>`);

                targetChannel.send(welcomeMessage).catch((error) => console.error("Error sending message:", error));
            }
        } catch (error) {
            console.error(error);
        }
    }
};
