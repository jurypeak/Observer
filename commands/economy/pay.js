const { SlashCommandBuilder, EmbedBuilder} = require("discord.js");
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
            content: `The amount must be at least 1.00 credit!`,
            ephemeral: true
        })
        else if (amount > userStoredBalance) return await interaction.reply({
            content: `You do not have enough credits to pay that amount!`,
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
        let url;
        const embed = new EmbedBuilder()
            .setColor('#FF5555') // Vibrant red
            .setTitle(`Transfer Summary`)
            .setDescription(`**You've successfully claimed your daily credits!**`)
            .setThumbnail(url = "attachment://cryptologo.png")
            .addFields([
                {
                    name: '💰 Credits Sent',
                    sender: `${interaction.user.username}`,
                    value: `**${amount}** credits have been removed from your balance!`,
                    inline: false
                },
                {
                    name: '⏱️ Credits Received',
                    receiver: `${selectedUser.username}`,
                    value: `**${amount}** have been added to your balance!`, // Discord timestamp format
                    inline: false
                }
            ])
            .setFooter({
                text: `${client.user.username} | Economy System`,
                iconURL: client.user.avatarURL()
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    },
};