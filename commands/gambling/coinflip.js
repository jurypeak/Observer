const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Balance = require('../../schemas/balance');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin to win credits!')
        .addStringOption((option) =>
            option
                .setName('choice')
                .setDescription('Choose heads or tails')
                .setRequired(true)
                .addChoices(
                    { name: 'Heads', value: 'heads' },
                    { name: 'Tails', value: 'tails' }
                )
        )
        .addIntegerOption((option) =>
            option
                .setName('amount')
                .setDescription('The amount to bet')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        ),

    async execute(interaction, client) {
        const { id } = interaction.user;
        await interaction.deferReply();

        const randomNum = Math.round(Math.random());
        const result = randomNum ? 'heads' : 'tails';
        const bet = interaction.options.getInteger('amount');
        const userBalance = await client.fetchBalance(id, interaction.guild.id);
        const choice = interaction.options.getString('choice');

        // Update user's balance by deducting the bet
        await Balance.findOneAndUpdate(
            { _id: userBalance._id },
            { balance: await client.toFixedNumber(userBalance.balance - bet) }
        );

        const embed = {
            color: result === choice ? 0x4CAF50 : 0xFF5733, // Green for win, red for loss
            title: result === choice ? '🎉 You Won!' : '💀 You Lost!',
            thumbnail: result === choice ? { url: `attachment://coinfliphead.gif` } : { url: `attachment://coinfliptail.gif` },
            description: `**Your Choice:** ${choice}\n**Coin Result:** ${result}\n**Bet:** ${bet} credits\n\n`,
            fields: [
                {
                    name: 'New Balance',
                    value: `${userBalance.balance} credits`
                }
            ],
            footer: {
                text: `Good luck next time!`
            },
        };

        if (choice === result) {
            // User wins: Add the winnings
            await Balance.findOneAndUpdate(
                { _id: userBalance._id },
                { balance: await client.toFixedNumber(userBalance.balance + bet * 2) }
            );
            embed.description += `You won and gained ${bet * 2} credits! 🎉`;
            embed.fields = [
                {
                    name: 'New Balance',
                    value: `${userBalance.balance + bet * 2} credits`
                }
            ];
        } else {
            embed.fields = [
                {
                    name: 'New Balance',
                    value: `${userBalance.balance - bet} credits`
                }
            ];
            embed.description += `You lost ${bet} credits. Better luck next time! 💀`;
        }

        const coinGif = result === 'heads'
            ? new AttachmentBuilder('coinfliphead.gif', { name: 'coinfliphead.gif' })
            : new AttachmentBuilder('coinfliptail.gif', { name: 'coinfliptail.gif' });

        await interaction.editReply(
            {
                embeds: [embed],
                files: [coinGif]
            }
        );
    }
};
