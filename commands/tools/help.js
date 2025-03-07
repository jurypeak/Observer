const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Observer help guide, provides list available commands.'),

    async execute(interaction, client) {
        const commands = client.commands.map(command => command.data);

        const commandsPerPage = 5; // Number of commands per page
        const totalPages = Math.ceil(commands.length / commandsPerPage);
        let currentPage = 1;

        const embed = (page) => {
            const start = page * commandsPerPage;
            const end = Math.min(start + commandsPerPage, commands.length);
            const commandPage = commands.slice(start, end);

            const embed = new EmbedBuilder()
                .setTitle(`Help Menu`)
                .setDescription(`🔖  Use /command_name to execute commands!`)
                .setColor('#FF5555')
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({
                    text: `Page ${page + 1} of ${totalPages}`,
                    iconURL: client.user.displayAvatarURL(),
                })
                .setTimestamp();

            commandPage.forEach(command => {
                embed.addFields({ name: `**${command.name}**`, value: command.description, inline: false });
            });

            return embed;
        };

        const prevButton = new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Previous')
            .setStyle('1')
            .setDisabled(currentPage === 0);

        const nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle('1')
            .setDisabled(currentPage === totalPages - 1);

        const buttonRow = new ActionRowBuilder().addComponents(prevButton, nextButton);

        await interaction.deferReply();

        await interaction.editReply({
            embeds: [embed(currentPage)],
            components: [buttonRow],
        });

        const filter = (interaction) => interaction.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 60000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'next') {
                currentPage++;
            } else if (i.customId === 'prev') {
                currentPage--;
            }

            prevButton.setDisabled(currentPage === 0);
            nextButton.setDisabled(currentPage === totalPages - 1);

            await i.update({
                embeds: [embed(currentPage)],
                components: [new ActionRowBuilder().addComponents(prevButton, nextButton)],
            });
        });

        collector.on('end', () => {
            prevButton.setDisabled(true);
            nextButton.setDisabled(true);

            interaction.editReply({
                components: [new ActionRowBuilder().addComponents(prevButton, nextButton)],
            });
        });
    },
};
