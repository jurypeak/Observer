const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {

        if (!interaction.commandName) return;

        const sendGuild = await client.guilds.fetch('1346142993656184983');
        const sendChannel = await sendGuild.channels.fetch('1346175970138128486');

        console.log(interaction.commandName)

        const command = interaction.commandName;
        const guild = interaction.guild;
        const channel = interaction.channel;
        const user = interaction.user;

        // Enhanced Embed Design
        const embed = new EmbedBuilder()
            .setColor('#FF5555') // Sleek dark grey background for modern look
            .setTitle('🚀  Command Used')
            .setDescription(`An interaction command was used in ${guild.name}!`)
            .addFields(
                { name: 'Command', value: `\`${command}\``, inline: false },
                { name: 'Guild', value: `${guild.name} (\`${guild.id}\`)`, inline: false },
                { name: 'Channel', value: `<#${channel.id}>`, inline: false },
                { name: 'User', value: `<@${user.id}> (\`${user.id}\`)`, inline: false }
            )
            .setFooter({ text: 'Interaction Logger', iconURL: user.displayAvatarURL() })
            .setTimestamp();

        // Improved Button Design
        const button = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel('🔗 Generate Server Invite')
            .setCustomId('gen-invite-log')
            .setDisabled(false);

        const buttons = new ActionRowBuilder().addComponents(button);

        const msg = await sendChannel.send({
            embeds: [embed],
            components: [buttons]
        });

        const time = 300000;
        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time
        });

        collector.on('collect', async i => {
            if (i.customId === 'gen-invite-log') {
                try {
                    const invite = await channel.createInvite();

                    await i.reply({
                        content: `✅ **Here is your invite link for ${channel.name}:**\n${invite.url}`,
                        ephemeral: true
                    });

                } catch (error) {
                    console.error(`Error creating invite: ${error}`);
                    await i.reply({
                        content: '❌ **Failed to generate the invite link.** Please check my permissions.',
                        ephemeral: true
                    });
                }
            }
        });

        collector.on('end', async () => {
            const disabledButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setLabel('Invite Link Expired')
                .setCustomId('expired-invite')
                .setDisabled(true);

            const expiredButtons = new ActionRowBuilder().addComponents(disabledButton);

            embed.setFooter({ text: 'Interaction Logger - Ended ⏳' });

            await msg.edit({
                embeds: [embed],
                components: [expiredButtons]
            }).catch(console.error);
        });
    },
}
