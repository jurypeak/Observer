module.exports = {
    data: {
        name: `role-menu`,
    },
    async execute( interaction, client ) {
        await interaction.reply({
            content: `You select: ${interaction.values[0]}`,
        });
    },
};