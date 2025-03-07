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

        if (dailyCooldown && Date.now() < dailyCooldown.endsAt) {
            const timeRemaining = prettyMs(dailyCooldown.endsAt - Date.now());
            await interaction.editReply(`<@${user.id}> You can claim your daily credits again in ${timeRemaining}`);
            return;
        }

        await Balance.findOneAndUpdate(
            { _id: storedBalance._id },
            { balance: await client.toFixedNumber(storedBalance.balance + randomAmount) }
        );

        const newCooldownExpiration = Date.now() + 86400000; // 24 hours cooldown in ms
        await Cooldown.updateOne(
            { userID: user.id, guildID: interaction.guild.id, command: 'daily' },
            { endsAt: newCooldownExpiration }
        );

        const updatedUser = await User.updateOne(
            { userID: user.id, guildID: interaction.guild.id },
            { $inc: { dailyStreak: 1 } } 
        );

        const embed = new EmbedBuilder()
            .setColor('#FF5555') // Vibrant red
            .setTitle(`Your Daily Reward`)
            .setDescription(`**You've successfully claimed your daily credits!**`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields([
                {
                    name: '💰  Credits Received',
                    value: `**${randomAmount.toFixed(2)}** credits have been added to your balance!`,
                    inline: true
                },
                {
                    name: '⏱️  Cooldown',
                    value: `Come back <t:${Math.floor(Date.now()/1000) + 86400}:R> for your next reward!`, // Discord timestamp format
                    inline: true
                },
                {
                    name: '🏆  Streak',
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

