const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder, InteractionResponseFlags } = require('discord.js');
const GuildConfig = require('../../schemas/guildconfig');

/**
 * Setup Command for Astral Discord Bot
 *
 * Allows admins to configure channels for:
 * - Welcome messages
 * - Message logs
 * - Level-up announcements
 * - Music commands
 * - Gamble commands
 * - Key verification
 * Also includes a show subcommand to view current settings
 */

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup bot systems for this server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

        // Welcomer setup
        .addSubcommand(sub =>
            sub.setName('welcomer')
                .setDescription('Set the welcome channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel for welcome messages')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                        .setRequired(true)
                )
        )

        // Message logger setup
        .addSubcommand(sub =>
            sub.setName('message-logger')
                .setDescription('Set the log channel for deleted/edited messages')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel where logs will be sent')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )

        // Level system setup
        .addSubcommand(sub =>
            sub.setName('level')
                .setDescription('Set the level-up announcement channel')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel for level-up messages')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                        .setRequired(true)
                )
        )

        // Music system setup
        .addSubcommand(sub =>
            sub.setName('music')
                .setDescription('Set the channel for music commands')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel for music commands')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )

        // Gamble system setup
        .addSubcommand(sub =>
            sub.setName('gamble')
                .setDescription('Set the channel for gambling commands')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel for gamble commands')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )

        // Key system setup
        .addSubcommand(sub =>
            sub.setName('key')
                .setDescription('Set the channel for key verification')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Channel for key verification')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )

        // Show current setup
        .addSubcommand(sub =>
            sub.setName('show')
                .setDescription('Show the current setup for this server')
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const guildID = interaction.guild.id;

        try {
            // Ensure guild config exists
            let config = await GuildConfig.findOne({ guildID });
            if (!config) {
                config = await GuildConfig.create({
                    guildID,
                    guildName: interaction.guild.name,
                    guildIcon: interaction.guild.iconURL() || null
                });
            }

            switch (sub) {
                case 'welcomer': {
                    const channel = interaction.options.getChannel('channel');
                    config.welcomeChannel = channel.id;
                    await config.save();
                    return interaction.reply({
                        content: `✅ Welcome messages → ${channel}`,
                        flags: InteractionResponseFlags.Ephemeral
                    });
                }

                case 'message-logger': {
                    const channel = interaction.options.getChannel('channel');
                    config.logChannel = channel.id;
                    await config.save();
                    return interaction.reply({
                        content: `✅ Message logs → ${channel}`,
                        flags: InteractionResponseFlags.Ephemeral
                    });
                }

                case 'level': {
                    const channel = interaction.options.getChannel('channel');
                    config.levelChannel = channel.id;
                    await config.save();
                    return interaction.reply({
                        content: `✅ Level-up announcements → ${channel}`,
                        flags: InteractionResponseFlags.Ephemeral
                    });
                }

                case 'music': {
                    const channel = interaction.options.getChannel('channel');
                    config.musicChannel = channel.id;
                    await config.save();
                    return interaction.reply({
                        content: `✅ Music commands → ${channel}`,
                        flags: InteractionResponseFlags.Ephemeral
                    });
                }

                case 'gamble': {
                    const channel = interaction.options.getChannel('channel');
                    config.gambleChannel = channel.id;
                    await config.save();
                    return interaction.reply({
                        content: `✅ Gamble commands → ${channel}`,
                        flags: InteractionResponseFlags.Ephemeral
                    });
                }

                case 'key': {
                    const channel = interaction.options.getChannel('channel');
                    config.keyChannel = channel.id;
                    await config.save();
                    return interaction.reply({
                        content: `✅ Key verification → ${channel}`,
                        flags: InteractionResponseFlags.Ephemeral
                    });
                }

                case 'show': {
                    const embed = new EmbedBuilder()
                        .setColor('#d31515')
                        .setTitle(`⚙️ Setup for ${interaction.guild.name}`)
                        .addFields(
                            { name: '👋 Welcome Channel', value: config.welcomeChannel ? `<#${config.welcomeChannel}>` : '❌ Not set' },
                            { name: '📝 Log Channel', value: config.logChannel ? `<#${config.logChannel}>` : '❌ Not set' },
                            { name: '🏆 Level-Up Channel', value: config.levelChannel ? `<#${config.levelChannel}>` : '❌ Not set' },
                            { name: '🎵 Music Commands', value: config.musicChannel ? `<#${config.musicChannel}>` : '❌ Not set' },
                            { name: '🎲 Gamble Commands', value: config.gambleChannel ? `<#${config.gambleChannel}>` : '❌ Not set' },
                            { name: '🔑 Key Verification', value: config.keyChannel ? `<#${config.keyChannel}>` : '❌ Not set' }
                        )
                        .setFooter({ text: `${interaction.client.user.username} | Setup System`, iconURL: interaction.client.user.displayAvatarURL() })
                        .setTimestamp();

                    return interaction.reply({
                        embeds: [embed],
                        flags: InteractionResponseFlags.Ephemeral
                    });
                }
            }
        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: 'An error occurred while running setup.',
                flags: InteractionResponseFlags.Ephemeral
            });
        }
    }
};
