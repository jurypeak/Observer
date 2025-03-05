const { SlashCommandBuilder} = require("discord.js");
const Balance = require("../../schemas/balance");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Pays a user!')
        .addNumberOption((option) =>
            option
                .setName(`amount`)
                .setDescription(`The amount to pay`)
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName('target')
                .setDescription('The user to get the balance of')
        ),
    async execute(interaction, client) {
        const userStoredBalance = await client.fetchBalance(
            interaction.user.id,
            interaction.guild.id
        );
        let amount = interaction.options.getNumber("amount");
        const selectedUser = interaction.options.getUser('target');

        if (selectedUser.bot || selectedUser.id === interaction.user.id) return await interaction.reply({
            content: `You cannot pay a bot or yourself!`,
            ephemeral: true
        });
        else if (amount < 1.00) return await interaction.reply({
            content: `The amount must be at least $1.00!`,
            ephemeral: true
        })
        else if (amount > userStoredBalance) return await interaction.reply({
            content: `You do not have enough money to pay that amount!`,
            ephemeral: true
        });

        const selectedUserBalance = await client.fetchBalance(
            selectedUser.id,
            interaction.guild.id
        );

        amount = await client.toFixedNumber(amount);

        await Balance.findOneAndUpdate(
            { _id: userStoredBalance._id },
            {
                balance: await client.toFixedNumber(userStoredBalance.balance - amount)
            });

        await Balance.findOneAndUpdate(
            { _id: selectedUserBalance._id },
            {
                balance: await client.toFixedNumber(selectedUserBalance.balance + amount)
            });

        await interaction.reply({
            content: `You've sent $${amount} to ${selectedUser.tag}!`,
            ephemeral: true
        });
    },
};