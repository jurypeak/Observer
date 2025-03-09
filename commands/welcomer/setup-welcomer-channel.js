const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const welcomeSchema = require("../../schemas/welcome");
const {Types} = require("mongoose");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-welcomer-channel')
        .setDescription('Setup a channel to send welcome messages to.!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((option) =>
            option
                .setName('target-channel')
                .setDescription('The channel to send welcome messages to.')
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('message')
                .setDescription(
                    'TEMPLATE: {mention-member} - {username} - {server-name}'
                )
        ),
    async execute(interaction, client) {
        try {
            const targetChannel = interaction.options.getChannel('target-channel');
            const message = interaction.options.getString('message');

            await interaction.deferReply({ephemeral: true});

            const query = {
                guildID: interaction.guild.id,
                channelID: targetChannel.id
            };

            const channelExistsInDB = await welcomeSchema.exists(query);

            if (channelExistsInDB) {
                await interaction.followUp(`This channel is already set up as the welcome channel!`);
                return;
            }

            const newWelcomeChannel = new welcomeSchema({
                ...query,
                _id: new Types.ObjectId(),
                customMessage : message
            });

            newWelcomeChannel
                .save()
                .then(() => {
                    interaction.followUp({
                        content: `The welcome channel has been successfully set up!`
                    });
                })
                .catch((error) => {
                    interaction.followUp({
                        content: `An error occurred with the database while setting up the welcome channel!`,
                        ephemeral: true,
                    })
                    console.log(error);
                })

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `An error occurred while setting up the welcome channel!`,
                ephemeral: true
            });
        }
    }
};