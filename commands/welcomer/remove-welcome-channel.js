const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const welcomeSchema = require("../../schemas/welcome");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-welcome-channel')
        .setDescription('Remove a welcome channel!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((option) =>
            option
                .setName('target-channel')
                .setDescription('The channel to remove as the welcome channel.')
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const targetChannel = interaction.options.getChannel('target-channel');

            await interaction.deferReply({ephemeral: true});

            const query = {
                guildID: interaction.guild.id,
                channelID: targetChannel.id
            };

            const channelExistsInDB = await welcomeSchema.exists(query);

            if (!channelExistsInDB) {
                await interaction.followUp(`This channel is not set up as the welcome channel!`);
                return;
            }

            await welcomeSchema.findOneAndDelete(query)
                .then(() => {
                    interaction.followUp(
                        `The welcome channel has been successfully removed!`
                    );
                })
                .catch((err) => {
                    interaction.followUp(
                        `Database error occurred while removing the welcome channel!`
                    )
                    console.error(err);
                })
        } catch (error) {
            console.error(error);
        }
    }
};
