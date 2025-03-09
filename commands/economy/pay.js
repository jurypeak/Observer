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
        const embed = new EmbedBuilder()
            .setColor('#FF5555')
            .setTitle(`Your Transfer Summary`)
            .setDescription(`**You've successfully transferred your credits!**`)
            .setThumbnail("attachment://cryptologo.png")
            .addFields([
                {
                    name: '📉  Credits Sent',
                    sender: `${interaction.user.username}`,
                    value: `**${amount.toLocaleString()}** credits have been removed from <@${interaction.user.id}>'s balance!`,
                    inline: false
                },
                {
                    name: '📈  Credits Received',
                    receiver: `${selectedUser.username}`,
                    value: `**${amount.toLocaleString()}** credits has been added to ${selectedUser}'s balance!`,
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
            files: [{
                attachment: "cryptologo.png",
                name: "cryptologo.png"
            }],
            ephemeral: true
        });
    },
};