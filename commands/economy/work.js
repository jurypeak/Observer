const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Balance = require("../../schemas/balance");
const Cooldown = require("../../schemas/cooldown");
const { default: prettyMs } = require("pretty-ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work for an amount of credits!'),
    async execute(interaction, client) {
        const user = interaction.user;
        const randomAmount = Math.random() * (23 - 12) + 14;
        const randomJob = Math.floor(Math.random() * 12); // Fixed to return an integer
        const jobs = [
            "Space-time Physicist", "Captain of a Deep-space Cruiser",
            "Black Hole Researcher", "Starship Engineer", "Intergalactic Diplomat",
            "Space Pirate", "Astronaut", "Alien Hunter", "Space Archaeologist",
            "Space Chef", "Space Tourist", "Space Station Janitor"
        ];

        // Fetch user balance and cooldown
        const storedBalance = await client.fetchBalance(user.id, interaction.guild.id);
        const workCooldown = await client.fetchCooldown(user.id, interaction.guild.id, 'work');

        await interaction.deferReply({ ephemeral: true });

        // Check if the cooldown is still active
        if (workCooldown && Date.now() < workCooldown.endsAt) {
            const timeRemaining = prettyMs(workCooldown.endsAt - Date.now());
            await interaction.editReply(`<@${user.id}> You can work for credits again in ${timeRemaining}`);
            return;
        }

        // Update or set new cooldown expiration time
        const newCooldownExpiration = Date.now() + 86400000; // 24 hours cooldown
        await Cooldown.updateOne(
            { userID: user.id, guildID: interaction.guild.id, command: 'work' },
            { endsAt: newCooldownExpiration }
        );

        // Update user's balance by adding the random amount
        await Balance.findOneAndUpdate(
            { _id: storedBalance._id },
            { balance: await client.toFixedNumber(storedBalance.balance + randomAmount) }
        );

        // Create the response embed
        const embed = new EmbedBuilder()
            .setColor('#FF5555') // Vibrant red
            .setTitle(`Your Work Pay`)
            .setDescription(`**You've completed your work!**`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields([
                {
                    name: '💰  Credits Received',
                    value: `**${randomAmount.toFixed(2)}** credits have been added to your balance!`,
                    inline: true
                },
                {
                    name: '⏱️  Cooldown',
                    value: `Come back <t:${Math.floor(Date.now() / 1000) + 86400}:R> for your next reward!`, // Discord timestamp format
                    inline: true
                },
                {
                    name: '🚀  Job',
                    value: `You worked as a: **${jobs[randomJob]}**.\nKeep it up for bonus rewards!`,
                    inline: false
                }
            ])
            .setFooter({
                text: `${client.user.username} | Economy System`,
                iconURL: client.user.avatarURL()
            })
            .setTimestamp();

        // Send the response
        await interaction.editReply({
            embeds: [embed],
        });
    },
};
