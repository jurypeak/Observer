const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Balance = require("../../schemas/balance");
const User = require("../../schemas/users");
const Cooldown = require("../../schemas/cooldown");
const { default: prettyMs } = require("pretty-ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Give the daily amount of credits to the user!'),
    async execute(interaction, client) {
        const user = interaction.user;
        const randomAmount = Math.random() * (23 - 12) + 14;
        const storedBalance = await client.fetchBalance(user.id, interaction.guild.id);
        const userProfile = await client.fetchUser(user.id, interaction.guild.id);
        const dailyCooldown = await client.fetchCooldown(user.id, interaction.guild.id, 'daily');

        await interaction.deferReply({ ephemeral: true });

        const now = Date.now();
        const oneDay = 86400000;
        const twoDays = 2 * oneDay;

        if (dailyCooldown && now < dailyCooldown.endsAt) {
            const timeRemaining = prettyMs(dailyCooldown.endsAt - now);
            await interaction.editReply(`<@${user.id}> You can claim your daily credits again in ${timeRemaining}`);
            return;
        }

        let newStreak = userProfile.dailyStreak + 1;
        if (userProfile.lastClaimedDaily && now - userProfile.lastClaimedDaily > twoDays) {
            newStreak = 1;
        }

        await Balance.findOneAndUpdate(
            { _id: storedBalance._id },
            { balance: await client.toFixedNumber(storedBalance.balance + randomAmount) }
        );

        const newCooldownExpiration = now + oneDay;
        await Cooldown.updateOne(
            { userID: user.id, guildID: interaction.guild.id, command: 'daily' },
            { endsAt: newCooldownExpiration }
        );

        await User.updateOne(
            { userID: user.id, guildID: interaction.guild.id },
            { $set: { lastClaimedDaily: now, dailyStreak: newStreak } }
        );

        const embed = new EmbedBuilder()
            .setColor('#FF5555')
            .setTitle(`Your Daily Reward`)
            .setDescription(`**You've successfully claimed your daily credits!**`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields([
                {
                    name: '💰  Credits Received',
                    value: `**${randomAmount.toFixed(2).toLocaleString()}** credits have been added to your balance!`,
                    inline: true
                },
                {
                    name: '⏱️  Cooldown',
                    value: `Come back <t:${Math.floor(now / 1000) + 86400}:R> for your next reward!`,
                    inline: true
                },
                {
                    name: '🏆  Streak',
                    value: `Current streak: **${newStreak}** days.\nKeep it up for bonus rewards!`,
                    inline: false
                }
            ])
            .setFooter({
                text: `${client.user.username} | Economy System`,
                iconURL: client.user.avatarURL()
            })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed],
        });
    },
};
