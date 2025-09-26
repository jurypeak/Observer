const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../schemas/guildconfig');

const CHANNEL_FIELDS = {
    welcomer: 'welcomeChannel',
    'message-logger': 'logChannel',
    level: 'levelChannel',
    music: 'musicChannel',
    gamble: 'gambleChannel',
    key: 'keyChannel'
};

function replyEphemeral(interaction, content, embed) {
    return interaction.reply({ content, embeds: embed ? [embed] : undefined, flags: 64 });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup bot systems for this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('show')
            .setDescription('Show current server setup'))
        .addSubcommand(sub => sub
            .setName('welcomer')
            .setDescription('Set welcome channel')
            .addChannelOption(opt => opt
                .setName('channel')
                .setDescription('Channel for welcome messages')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            ))
        .addSubcommand(sub => sub
            .setName('message-logger')
            .setDescription('Set log channel')
            .addChannelOption(opt => opt
                .setName('channel')
                .setDescription('Channel for message logs')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            ))
        .addSubcommand(sub => sub
            .setName('level')
            .setDescription('Set level-up announcements channel')
            .addChannelOption(opt => opt
                .setName('channel')
                .setDescription('Channel for level-up messages')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            ))
        .addSubcommand(sub => sub
            .setName('music')
            .setDescription('Set music commands channel')
            .addChannelOption(opt => opt
                .setName('channel')
                .setDescription('Channel for music commands')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            ))
        .addSubcommand(sub => sub
            .setName('gamble')
            .setDescription('Set gamble commands channel')
            .addChannelOption(opt => opt
                .setName('channel')
                .setDescription('Channel for gamble commands')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            ))
        .addSubcommand(sub => sub
            .setName('key')
            .setDescription('Set key verification channel')
            .addChannelOption(opt => opt
                .setName('channel')
                .setDescription('Channel for key verification')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            )),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildID = interaction.guild.id;

        try {
            let config = await GuildConfig.findOne({ guildID });
            if (!config) {
                config = await GuildConfig.create({
                    guildID,
                    guildName: interaction.guild.name,
                    guildIcon: interaction.guild.iconURL() || null
                });
            }

            // Handle "show" separately
            if (sub === 'show') {
                const embed = new EmbedBuilder()
                    .setColor('#d31515')
                    .setTitle(`⚙️ Setup for ${interaction.guild.name}`)
                    .addFields(
                        Object.entries(CHANNEL_FIELDS).map(([key, field]) => ({
                            name: key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            value: config[field] ? `<#${config[field]}>` : '❌ Not set'
                        }))
                    )
                    .setFooter({ text: `${interaction.client.user.username} | Setup System`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();

                return replyEphemeral(interaction, null, embed);
            }

            // Update channel
            if (CHANNEL_FIELDS[sub]) {
                const channel = interaction.options.getChannel('channel');
                config[CHANNEL_FIELDS[sub]] = channel.id;
                await config.save();
                return replyEphemeral(interaction, `✅ ${sub.replace(/-/g, ' ')} set → ${channel}`);
            }

        } catch (err) {
            console.error(err);
            return replyEphemeral(interaction, 'An error occurred while running setup.');
        }
    }
};
