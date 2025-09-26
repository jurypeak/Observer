const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

/**
 * Balance Command for Astral Discord Bot
 *
 * This command allows users to check their own balance or another user's balance.
 * Returns an error message if the user doesn't have a balance in the system yet.
 */

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

        // Get the target user
        const selectedUser = interaction.options.getUser('user') || interaction.user;

        // Fetch the user's balance from database
        const storedBalance = await client.getBalance(selectedUser.id, interaction.guild.id);

        // If no balance exists, show error message
        if (!storedBalance) {
            return await interaction.reply({
                content: `${selectedUser.tag} does not have a balance yet!`,
                ephemeral: true
            });
        }

        // If balance exists, display it in an embed
        else {
            const embed = new EmbedBuilder()
                .setColor('#d31515')
                .setTitle(`💰 ${selectedUser.username}'s Balance`)
                .setDescription(`**${storedBalance.balance.toLocaleString()}** Credits`)
                .setThumbnail(selectedUser.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({
                    iconURL: client.user.displayAvatarURL()
                });

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    },
};