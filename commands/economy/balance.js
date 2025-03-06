const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Return the balance of the user!')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user to get the balance of')
        ),
    async execute(interaction, client) {
        const selectedUser = interaction.options.getUser('user') || interaction.user;
        const storedBalance = await client.getBalance(selectedUser.id, interaction.guild.id);

        if (!storedBalance) return await interaction.reply({
                content: `${selectedUser.tag} does not have a balance yet!`,
                ephemeral: true
        });
        else {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(`${selectedUser.username}'s balance`)
                .setTimestamp()
                .addFields([
                    {
                        name: `${storedBalance.balance} Credits`,
                        value: `\u200B`
                    }
                ])
                .setFooter({
                    text: client.user.tag,
                    iconURL: client.user.avatarURL()
                });

           await interaction.reply({
                embeds: [embed],
                ephemeral: true
           });
        }
    },
};