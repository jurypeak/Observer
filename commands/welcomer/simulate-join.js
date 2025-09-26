const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('simulate-join')
        .setDescription('Simulates a user joining the server!')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user to simulate joining the server')
                .setRequired(true)
        ),
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (!member) {
            return interaction.editReply("User is not in the server or could not be fetched.");
        }

        // Emit the real Discord event so the same logic runs as a real member joining
        client.emit('guildMemberAdd', member);

        await interaction.editReply(`Simulated <@${member.id}> joining the server!`);
    }
};


