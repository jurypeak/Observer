const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js');
const msglog = require('../../schemas/msglog');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {

        if (!message.guild || !message) return;
        const data = await msglog.findOne({
            guildID: message.guild.id,
            channelID: message.channel.id,
        });
        if (!data) return;

        const sendChannel = await message.guild.channels.fetch(data.logChannelID);

        const buttonDelete = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel('Delete Message')
            .setCustomId('message_delete')
            .setDisabled(false); // Now enabled by default

        const buttonLink = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`)
                    .setLabel('View Message'),

                buttonDelete
            );

        const attachments = message.attachments.map(attachment => attachment.url).join('\n') || 'No Attachments';

        // Improved Embed Design
        const embed = new EmbedBuilder()
            .setColor('#FF5555')
            .setTitle('🚀  Message Logged')
            .setDescription(`A message was created and has been logged in ${message.guild.name}!`)
            .addFields(
                {name : 'Message Content', value : `${message.content || 'No Message Content'}`, inline : false},
                { name: 'Author', value: `<@${message.author.id}> (\`${message.author.id}\`)`, inline: false },
                { name: 'Channel', value: `<#${data.channelID}>`, inline: false },
                { name: 'Attachments', value: attachments, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: `Message ID: ${message.id}` });

        const msg = await sendChannel.send({
            embeds: [embed],
            components: [buttonLink]
        });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 300000 // 5 minutes
        });

        collector.on('collect', async i => {
            if (i.customId !== 'message_delete') return;

            if (!message) {
                const updatedEmbed = EmbedBuilder.from(embed)
                    .setDescription(`**This message has been deleted by the author or a moderator.**`);

                await msg.edit({ embeds: [updatedEmbed], components: [] }).catch(console.error);
                return await i.reply({ content: 'The message was already deleted.', ephemeral: true });
            }

            try {
                await message.delete();
                const updatedEmbed = EmbedBuilder.from(embed)
                    .setDescription(`**This message has been deleted by a moderator.**`);

                await msg.edit({ embeds: [updatedEmbed], components: [] }).catch(console.error);
                await i.reply({ content: 'Message deleted successfully!', ephemeral: true });

            } catch (error) {
                console.error(`Error deleting message: ${error}`);
                await i.reply({ content: 'An error occurred while trying to delete the message!', ephemeral: true });
            }
        });

        collector.on('end', async () => {
            const updatedButtonDelete = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel('Delete Message')
                .setCustomId('message_delete')
                .setDisabled(true);

            const updatedButtonLink = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`)
                        .setLabel('View Message'),
                    updatedButtonDelete
                );

            await msg.edit({ embeds: [embed], components: [updatedButtonLink] }).catch(console.error);
        });
    }
}
