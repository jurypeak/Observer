const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js')

const msglog = require('../../schemas/msglog');
const {Types} = require("mongoose");

module.exports = {
    mod: true,
    data: new SlashCommandBuilder()
        .setName('message-logger')
        .setDescription('Set the message log channel!')
        .addSubcommand(command => command.setName('add')
            .setDescription('Add a message log channel!')
            .addChannelOption(option => option.setName('channel')
                .setDescription('The channel to set as the message log channel!')
                .setRequired(true).addChannelTypes(ChannelType.GuildText))
            .addChannelOption(option => option.setName('log-channel')
                .setDescription('The channel to set as the message log channel!')
                .setRequired(true).addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(command => command.setName('remove')
            .setDescription('Remove the message log channel!')
            .addChannelOption(option => option.setName('channel')
                .setDescription('The channel to remove as the message log channel!')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))),
    async execute(interaction, client) {

        const { options } = interaction;
        const sub = options.getSubcommand();
        const channel = options.getChannel('channel');
        const data = await msglog.findOne({ guildID: interaction.guild.id, channelID: channel.id });

        async function sendMessage(message) {
            const embed = new EmbedBuilder()
                .setColor('#FF5555')
                .setDescription(message);

            await interaction.reply({embeds: [embed]}, {ephemeral: true});
        }

        switch (sub) {
            case 'add':
                if (data) {
                    await sendMessage('Looks like the message log channel is already set!');
                } else {
                    const logChannel = options.getChannel('log-channel');
                    await msglog.create({
                        _id: new Types.ObjectId(),
                        guildID: interaction.guild.id,
                        channelID: channel.id,
                        logChannelID: logChannel.id
                    });

                    await sendMessage('The message logger system is now enabled!');
                }

                break;
                case 'remove':
                    if (!data) {
                        await sendMessage('Looks like the message log channel is not set!');
                    } else {
                        await msglog.deleteOne({ guild: interaction.guild.id, channel: channel.id });
                        await sendMessage('The message logger system is now disabled!');
                    }
        }

    }
}