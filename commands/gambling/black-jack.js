const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ComponentType
} = require('discord.js');
const Balance = require("../../schemas/balance");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('black-jack')
        .setDescription('Play a game of Black Jack!')
        .addIntegerOption(option =>
            option
                .setName('bet')
                .setDescription('The amount to bet')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            await interaction.deferReply();

            const userBalance = await client.fetchBalance(interaction.user.id, interaction.guild.id);

            const bet = interaction.options.getInteger('bet');

            if (bet > userBalance) {
                return await interaction.editReply({
                    content: `You do not have enough credits to bet that amount!`,
                    ephemeral: true
                });
            }

            const deckData = await client.createNewDeck();
            const deckID = deckData.deck_id;
            const dealerHand = [];
            const playerHand = [];

            await Balance.findOneAndUpdate(
                { _id: userBalance._id },
                {
                    balance: await client.toFixedNumber(userBalance.balance - bet)
                });

            for (let i = 0; i < 2; i++) {
                playerHand.push(await client.drawNewCard(deckID));
                dealerHand.push(await client.drawNewCard(deckID));
            }

            const embed = {
                color: 0xff5555,
                title: `Black Jack Game`,
                description: `**You've started a game of Black Jack!**`,
                fields: [
                    {
                        name: 'Dealer Hand',
                        value: client.formatCards(dealerHand, true)
                    },
                    {
                        name: 'Your Hand',
                        value: client.formatCards(playerHand)
                    }
                ]
            }
            const hitButton = new ButtonBuilder()
                .setCustomId('hit')
                .setLabel('HIT')
                .setStyle(ButtonStyle.Success);
            const standButton = new ButtonBuilder()
                .setCustomId('stand')
                .setLabel('STAND')
                .setStyle(ButtonStyle.Danger);
            const row = new ActionRowBuilder().addComponents(hitButton, standButton);
            const message = await interaction.editReply({
                embeds: [embed],
                components: [row],
                fetchReply: true
            });

            if (client.isBlackJack(playerHand)) {
                embed.title = `You've Won!`;
                await Balance.findOneAndUpdate(
                    { _id: userBalance._id },
                    {
                        balance: await client.toFixedNumber(userBalance.balance + (bet * 3))
                    });
                return interaction.editReply({
                    embeds: [embed]
                })
            }

            const collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60000
            });

            let winResult = 'dealer'

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: "This isn't your game!", ephemeral: true });
                }

                if (i.customId === 'hit') {
                    await i.deferUpdate();

                    const cardValue = await client.drawNewCard(deckID);
                    playerHand.push(cardValue);

                    embed.fields = [
                        {
                            name: 'Dealer Hand',
                            value: client.formatCards(dealerHand, true)
                        },
                        {
                            name: 'Your Hand',
                            value: client.formatCards(playerHand)
                        }
                    ];
                    if (client.isBust(playerHand)) {
                        embed.title = `💀 You've Lost!`;
                        embed.fields = [
                            {
                                name: 'Dealer Hand',
                                value: client.formatCards(dealerHand, false)  // Show all of dealer's cards
                            },
                            {
                                name: 'Your Hand',
                                value: client.formatCards(playerHand)
                            }
                        ];
                        await interaction.editReply({ embeds: [embed], components: [] });
                        collector.stop();
                    } else if (client.isBlackJack(playerHand)) {
                        winResult = 'player';
                        embed.title = `🎉 You've Won!`;
                        await Balance.findOneAndUpdate(
                            { _id: userBalance._id },
                            { balance: await client.toFixedNumber(userBalance.balance + (bet * 3)) }
                        );
                        await interaction.editReply({ embeds: [embed], components: [] });
                        collector.stop();
                    } else {
                        await interaction.editReply({ embeds: [embed] });
                    }
                } else {
                    while (!client.isDealerStay(dealerHand) && !client.isBust(dealerHand) && !client.isBlackJack(dealerHand)) {
                        dealerHand.push(await client.drawNewCard(deckID));
                    }
                    if (client.isBust(dealerHand)) {
                        winResult = 'player';
                        embed.title = `🎉 You've Won!`;
                        await Balance.findOneAndUpdate(
                            {_id: userBalance._id},
                            {balance: await client.toFixedNumber(userBalance.balance + (bet * 2))}
                        );
                    } else if (client.isPlayerWin(playerHand, dealerHand)) {
                        winResult = 'player';
                        embed.title = `🎉 You've Won!`;
                        await Balance.findOneAndUpdate(
                            {_id: userBalance._id},
                            {balance: await client.toFixedNumber(userBalance.balance + (bet * 2))}
                        );
                    } else if (client.isDraw(playerHand, dealerHand)) {
                        winResult = 'draw';
                        embed.title = `🤝 It's a Draw!`;
                        await Balance.findOneAndUpdate(
                            {_id: userBalance._id},
                            {balance: await client.toFixedNumber(userBalance.balance + bet)}
                        );
                    } else if (client.isBlackJack(dealerHand)) {
                        embed.title = `💀 You've Lost!`;
                    } else {
                        embed.title = `💀 You've Lost!`;
                    }

                    embed.fields = [
                        {
                            name: 'Dealer Hand',
                            value: client.formatCards(dealerHand)
                        },
                        {
                            name: 'Your Hand',
                            value: client.formatCards(playerHand)
                        }
                    ];

                    await i.update({embeds: [embed], components: []});
                    collector.stop();
                }
            });

            collector.on('end', async (_, reason) => {
                if (reason === 'time') {
                    throw Error('Black Jack game timed out');
                }

                let footerText;

                if (winResult === 'draw') {
                    footerText = `You did not lose any credits!`;
                }
                if (winResult === 'dealer') {
                    footerText = `You lost ${bet} credits!`;
                }
                else if (winResult === 'player' ) {
                    if(client.isBlackJack(playerHand)) {
                        footerText = `You won ${bet * 2} credits!`;
                    } else {
                        footerText = `You won ${bet} credits!`;
                    }
                }

                embed.footer = {
                    text: footerText
                };

                await interaction.editReply({
                    embeds: [embed],
                    components: []
                });
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply(`An error occurred: ${error.message}`,
                {
                    ephemeral: true,
                }
            );
        }
    },
};