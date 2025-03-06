const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Balance = require("../../schemas/balance");
const Cooldown = require("../../schemas/cooldown");
const User = require("../../schemas/users");
const { default: prettyMs } = require("pretty-ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Give the daily amount of credits to the user!'),
    async execute(interaction, client) {
        const user = interaction.user;
        const randomAmount = Math.random() * (23 - 12) + 14;
        const storedBalance = await client.fetchBalance(user.id, interaction.guild.id);
        const cooldown = await client.fetchCooldown(user.id, interaction.guild.id);
        const userProfile = await client.getUser(user.id, interaction.guild.id);

        await interaction.deferReply({ ephemeral: true });

        if (cooldown) {
            if (Date.now() < cooldown.endsAt) {
                await interaction.editReply(`<@${user.id}> You can claim your daily credits again in ${prettyMs(cooldown.endsAt - Date.now())}`);
                return;
            }
        }
        if (!cooldown) {
            await client.fetchCooldown(user.id, interaction.guild.id, "daily", 0);
        }
        await Balance.findOneAndUpdate(
            { _id: storedBalance._id },
            { balance: await client.toFixedNumber(storedBalance.balance + randomAmount) }
        );
        await Cooldown.findOneAndUpdate(
            { _id: cooldown._id },
            { endsAt: Date.now() + 86400000, command: "daily" } // 24 hours cooldown
        );

        await User.findOneAndUpdate(
            { _id: userProfile._id },
            {
                dailyStreak: userProfile.dailyStreak + 1 // Increment the daily streak
            }
        );
        const embed = new EmbedBuilder()
            .setColor('#FF5555') // Vibrant red
            .setTitle(`🎁 ${user.username}'s Daily Reward`)
            .setDescription(`**You've successfully claimed your daily credits!**`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields([
                {
                    name: '💰 Credits Received',
                    value: `**${randomAmount.toFixed(2)}** credits have been added to your balance!`,
                    inline: true
                },
                {
                    name: '⏱️ Cooldown',
                    value: `Come back <t:${Math.floor(Date.now()/1000) + 86400}:R> for your next reward!`, // Discord timestamp format
                    inline: true
                },
                {
                    name: '🏆 Streak',
                    value: `Current streak: **${userProfile.dailyStreak + 1}** days.\nKeep it up for bonus rewards!`,
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
